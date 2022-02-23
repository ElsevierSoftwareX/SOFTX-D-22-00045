package opengl

import (
	"embed"
	"errors"
	"fmt"
	"github.com/go-gl/gl/v4.6-core/gl"
	"github.com/go-gl/glfw/v3.3/glfw"
	"github.com/go-gl/mathgl/mgl32"
	"image"
	"image/color"
	"image/draw"
	"strings"
	"sync"
	"backend/env"
	"backend/restful"
	"backend/restful/node/storage"
	"time"
	"unsafe"
)

var context map[string]*graphicsContext
var window *glfw.Window
var programInputTexture uint32
var programOutputTexture uint32
var programVolumeTexture uint32
var programVolumeTexture2 uint32
var mainVertexArray uint32
var mainVertexBuffer uint32
var outputVertexArray uint32
var outputVertexBuffer uint32
var outputVertexIndicesBuffer uint32
var mainMutex sync.Mutex

func InitOpenGL(staticShaderFiles *embed.FS) {
	var err error

	if err = glfw.Init(); err != nil {
		panic(err)
	}

	glfw.WindowHint(glfw.Visible, glfw.False)
	glfw.WindowHint(glfw.ContextVersionMajor, 4)
	glfw.WindowHint(glfw.ContextVersionMinor, 5)
	glfw.WindowHint(glfw.OpenGLProfile, glfw.OpenGLCoreProfile)
	glfw.WindowHint(glfw.OpenGLForwardCompatible, glfw.True)

	window, err = glfw.CreateWindow(1, 1, env.ServerConfiguration.Name, nil, nil)

	if err != nil {
		panic(err)
	}

	mainMutex.Lock()
	window.MakeContextCurrent()

	if err = gl.Init(); err != nil {
		panic("Could not init OpenGL.")
	}

	if env.ServerConfiguration.Debug == true {
		gl.Enable(gl.DEBUG_OUTPUT)
		var zero int32 = 0
		gl.DebugMessageCallback(debugOpenGL, unsafe.Pointer(&zero))
	}

	context = make(map[string]*graphicsContext)

	err = createProgram(staticShaderFiles, &programInputTexture, "PrepareTexture.vert", "PrepareTexture.frag")

	if err != nil {
		panic(err)
	}

	err = createProgram(staticShaderFiles, &programOutputTexture, "PrepareTexture.vert", "OutputTexture.frag")

	if err != nil {
		panic(err)
	}

	err = createProgram(staticShaderFiles, &programVolumeTexture, "Volume.vert", "Volume.frag")

	if err != nil {
		panic(err)
	}

	err = createProgram(staticShaderFiles, &programVolumeTexture2, "Volume2.vert", "Volume2.frag")

	if err != nil {
		panic(err)
	}

	setupGeometry()
	mainMutex.Unlock()

	go cleaningTimer()
}

func createProgram(staticShaderFiles *embed.FS, program *uint32, vertex string, fragment string) error {
	window.MakeContextCurrent()

	vertexShader := gl.CreateShader(gl.VERTEX_SHADER)
	vsSource, err := staticShaderFiles.ReadFile("shaders/" + vertex)

	if err != nil {
		return errors.New("could not open vertex shader")
	}

	vsSrc, free := gl.Strs(string(vsSource) + "\x00")

	gl.ShaderSource(vertexShader, 1, vsSrc, nil)
	free()
	gl.CompileShader(vertexShader)

	var status int32

	gl.GetShaderiv(vertexShader, gl.COMPILE_STATUS, &status)

	if status == gl.FALSE {
		var logLength int32

		gl.GetShaderiv(vertexShader, gl.INFO_LOG_LENGTH, &logLength)

		log := strings.Repeat("\x00", int(logLength+1))

		gl.GetShaderInfoLog(vertexShader, logLength, nil, gl.Str(log))

		return fmt.Errorf("failed to compile shader %v: ", log)
	}

	fragmentShader := gl.CreateShader(gl.FRAGMENT_SHADER)
	fsSource, err := staticShaderFiles.ReadFile("shaders/" + fragment)

	if err != nil {
		return errors.New("could not open fragment shader")
	}

	fsSrc, free := gl.Strs(string(fsSource) + "\x00")

	gl.ShaderSource(fragmentShader, 1, fsSrc, nil)
	free()
	gl.CompileShader(fragmentShader)
	gl.GetShaderiv(fragmentShader, gl.COMPILE_STATUS, &status)

	if status == gl.FALSE {
		var logLength int32

		gl.GetShaderiv(fragmentShader, gl.INFO_LOG_LENGTH, &logLength)

		log := strings.Repeat("\x00", int(logLength+1))

		gl.GetShaderInfoLog(fragmentShader, logLength, nil, gl.Str(log))

		return fmt.Errorf("failed to compile shader %v: ", log)
	}

	*program = gl.CreateProgram()
	gl.AttachShader(*program, vertexShader)
	gl.AttachShader(*program, fragmentShader)
	gl.LinkProgram(*program)

	gl.GetProgramiv(*program, gl.LINK_STATUS, &status)

	if status == gl.FALSE {
		var logLength int32

		gl.GetProgramiv(*program, gl.INFO_LOG_LENGTH, &logLength)

		log := strings.Repeat("\x00", int(logLength+1))

		gl.GetProgramInfoLog(*program, logLength, nil, gl.Str(log))

		return fmt.Errorf("failed to link program: %v", log)
	}

	gl.DeleteShader(vertexShader)
	gl.DeleteShader(fragmentShader)

	gl.UseProgram(0)

	return nil
}

func setupGeometry() {
	var vertices = []float32{
		-1.0, -1.0, 0.0, 0.0, 0.0,
		1.0, -1.0, 0.0, 1.0, 0.0,
		-1.0, 1.0, 0.0, 0.0, 1.0,
		-1.0, 1.0, 0.0, 0.0, 1.0,
		1.0, -1.0, 0.0, 1.0, 0.0,
		1.0, 1.0, 0.0, 1.0, 1.0,
	}

	var cubeVertices = []float32{
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		-1.0, 1.0, -1.0,
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
	}

	var cubeIndices = []uint16{
		0, 5, 4, 5, 0, 1, 3, 7, 6, 3, 6, 2, 7, 4, 6, 6, 4, 5,
		2, 1, 3, 3, 1, 0, 3, 0, 7, 7, 0, 4, 6, 5, 2, 2, 5, 1,
	}

	// Full screen quad
	gl.CreateBuffers(1, &mainVertexBuffer)
	gl.NamedBufferStorage(mainVertexBuffer, len(vertices)*4, gl.Ptr(vertices), gl.DYNAMIC_STORAGE_BIT)

	gl.CreateVertexArrays(1, &mainVertexArray)

	gl.VertexArrayVertexBuffer(mainVertexArray, 0, mainVertexBuffer, 0, 5*4)

	gl.EnableVertexArrayAttrib(mainVertexArray, 0)
	gl.EnableVertexArrayAttrib(mainVertexArray, 1)

	gl.VertexArrayAttribFormat(mainVertexArray, 0, 3, gl.FLOAT, false, 0)
	gl.VertexArrayAttribFormat(mainVertexArray, 1, 2, gl.FLOAT, false, 3*4)

	gl.VertexArrayAttribBinding(mainVertexArray, 0, 0)
	gl.VertexArrayAttribBinding(mainVertexArray, 1, 0)

	// Cube
	gl.CreateBuffers(1, &outputVertexBuffer)
	gl.NamedBufferStorage(outputVertexBuffer, len(cubeVertices)*4, gl.Ptr(cubeVertices), gl.DYNAMIC_STORAGE_BIT)

	gl.CreateBuffers(1, &outputVertexIndicesBuffer)
	gl.NamedBufferStorage(outputVertexIndicesBuffer, len(cubeIndices)*2, gl.Ptr(cubeIndices), gl.DYNAMIC_STORAGE_BIT)

	gl.CreateVertexArrays(1, &outputVertexArray)

	gl.VertexArrayVertexBuffer(outputVertexArray, 0, outputVertexBuffer, 0, 3*4)
	gl.VertexArrayElementBuffer(outputVertexArray, outputVertexIndicesBuffer)

	gl.EnableVertexArrayAttrib(outputVertexArray, 0)

	gl.VertexArrayAttribFormat(outputVertexArray, 0, 3, gl.FLOAT, false, 0)

	gl.VertexArrayAttribBinding(outputVertexArray, 0, 0)

	gl.BindVertexArray(0)

	gl.Disable(gl.DEPTH_TEST)
}

func ShutdownOpenGL() {
	DestroyAll()
	glfw.Terminate()
}

func updateTime(md5sum string) {
	if _, ok := context[md5sum]; ok {
		context[md5sum].lastAccessTime = time.Now()
	}
}

func ContextExists(md5sum string) bool {
	if _, ok := context[md5sum]; ok {
		updateTime(md5sum)

		return true
	}

	return false
}

func DestroyAll() {
	for key := range context {
		Destroy(key)
	}

	mainMutex.Lock()
	window.MakeContextCurrent()

	if gl.IsProgram(programInputTexture) == true {
		gl.DeleteProgram(programInputTexture)
	}

	if gl.IsProgram(programOutputTexture) == true {
		gl.DeleteProgram(programOutputTexture)
	}

	if gl.IsProgram(programVolumeTexture) == true {
		gl.DeleteProgram(programVolumeTexture)
	}

	if gl.IsProgram(programVolumeTexture2) == true {
		gl.DeleteProgram(programVolumeTexture2)
	}

	if gl.IsVertexArray(mainVertexArray) {
		gl.DeleteVertexArrays(1, &mainVertexArray)
	}

	if gl.IsBuffer(mainVertexBuffer) {
		gl.DeleteBuffers(1, &mainVertexBuffer)
	}

	if gl.IsVertexArray(outputVertexArray) {
		gl.DeleteVertexArrays(1, &outputVertexArray)
	}

	if gl.IsBuffer(outputVertexBuffer) {
		gl.DeleteBuffers(1, &outputVertexBuffer)
	}

	if gl.IsBuffer(outputVertexIndicesBuffer) {
		gl.DeleteBuffers(1, &outputVertexIndicesBuffer)
	}

	mainMutex.Unlock()
}

func Destroy(md5sum string) error {
	if _, ok := context[md5sum]; ok {
		mainMutex.Lock()
		window.MakeContextCurrent()

		if gl.IsTexture(context[md5sum].mainTexture) {
			gl.DeleteTextures(1, &context[md5sum].mainTexture)
		}

		if gl.IsTexture(context[md5sum].inputTexture) {
			gl.DeleteTextures(1, &context[md5sum].inputTexture)
		}

		if gl.IsTexture(context[md5sum].outputTexture) {
			gl.DeleteTextures(1, &context[md5sum].outputTexture)
		}

		if gl.IsTexture(context[md5sum].outputTextureFront) {
			gl.DeleteTextures(1, &context[md5sum].outputTextureFront)
		}

		if gl.IsTexture(context[md5sum].outputTextureBack) {
			gl.DeleteTextures(1, &context[md5sum].outputTextureBack)
		}

		if gl.IsFramebuffer(context[md5sum].framebuffer) {
			gl.DeleteFramebuffers(1, &context[md5sum].inputTexture)
		}

		delete(context, md5sum)
		mainMutex.Unlock()

		return nil
	}

	return errors.New("context does not exist")
}

func createContext(info *storage.ImageInfo, mainTextureSize *iVec3D, framebuffer uint32, mainTexture uint32, inputTexture uint32) error {

	if _, ok := context[info.MD5sum]; ok {
		return errors.New("context already exists")
	}

	mainMutex.Lock()

	context[info.MD5sum] = &graphicsContext{
		dicomImageSize:   iVec3D{info.Cols, info.Rows, info.Frames},
		dicomName:        info.MD5sum,
		lastAccessTime:   time.Now(),
		inputTexture:     inputTexture,
		mainTexture:      mainTexture,
		mainImageSize:    *mainTextureSize,
		outputFormat:     "",
		frameLoaded:      make([]bool, info.Frames),
		framebuffer:      framebuffer,
		rescaleSlope:     info.RescaleSlope,
		rescaleIntercept: info.RescaleIntercept,
		windowCenter:     info.WindowCenter,
		windowWidth:      info.WindowWidth,
	}

	mainMutex.Unlock()

	return nil
}

func cleaningTimer() {
	for range time.Tick(time.Minute) {
		for key := range context {
			if time.Now().After(context[key].lastAccessTime.Add(5 * time.Minute)) {
				Destroy(key)
			}
		}
	}
}

func SetLoaded(md5sum string, error bool) error {
	if _, ok := context[md5sum]; ok {
		context[md5sum].loadingError = error
		context[md5sum].loadingFinished = true

		updateTime(md5sum)

		return nil
	}

	return errors.New("context does not exist")
}

func CreateTextures(imageInfo *storage.ImageInfo) error {
	_, ok := context[imageInfo.MD5sum]

	if ok {
		return errors.New("image already exists")
	}

	mainMutex.Lock()
	window.MakeContextCurrent()

	var max3DTexSize int32

	gl.GetIntegerv(gl.MAX_3D_TEXTURE_SIZE, &max3DTexSize)

	if imageInfo.Frames > int(max3DTexSize) {
		return errors.New("image is too big to fit in a 3D texture")
	}

	w := imageInfo.Cols
	h := imageInfo.Rows
	ratio := float32(w) / float32(h)

	if w > int(max3DTexSize) {
		w = int(max3DTexSize)
		h = int(float32(w) / ratio)
	}

	if h > int(max3DTexSize) {
		h = int(max3DTexSize)
		w = int(float32(h) * ratio)
	}

	mainImageSize := &iVec3D{x: w, y: h, z: imageInfo.Frames}

	var framebuffer uint32

	gl.CreateFramebuffers(1, &framebuffer)

	borderColor := []float32{0.0, 0.0, 0.0, 1.0}
	var inputTexture uint32

	gl.CreateTextures(gl.TEXTURE_2D, 1, &inputTexture)
	gl.BindTextureUnit(0, inputTexture)
	gl.TextureParameteri(inputTexture, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.TextureParameteri(inputTexture, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.TextureParameteri(inputTexture, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
	gl.TextureParameteri(inputTexture, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)
	gl.TextureParameterfv(inputTexture, gl.TEXTURE_BORDER_COLOR, &borderColor[0])
	gl.TextureStorage2D(inputTexture, 1, gl.R16_SNORM, int32(imageInfo.Cols), int32(imageInfo.Rows))

	var mainTexture uint32

	gl.CreateTextures(gl.TEXTURE_3D, 1, &mainTexture)
	gl.BindTextureUnit(1, mainTexture)
	gl.TextureParameteri(mainTexture, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.TextureParameteri(mainTexture, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.TextureParameteri(mainTexture, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
	gl.TextureParameteri(mainTexture, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)
	gl.TextureParameteri(mainTexture, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_BORDER)
	gl.TextureParameterfv(mainTexture, gl.TEXTURE_BORDER_COLOR, &borderColor[0])
	gl.TextureStorage3D(mainTexture, 4, gl.R8, int32(w), int32(h), int32(imageInfo.Frames))

	mainMutex.Unlock()

	return createContext(imageInfo, mainImageSize, framebuffer, mainTexture, inputTexture)
}

func GetFrame(md5sum string, frame int) (rgba *image.Gray, format string, err error) {
	ctx, ok := context[md5sum]

	if !ok {
		return nil, "", errors.New("image not found")
	} else {
		if ctx.frameLoaded[frame] == false {
			return nil, "", nil
		}
	}

	if frame < 0 || frame > ctx.mainImageSize.z-1 {
		return nil, "", errors.New("invalid frame number")
	}

	width := ctx.outputImageSize.x
	height := ctx.outputImageSize.y

	img := image.NewGray(image.Rect(0, 0, width, height))

	mainMutex.Lock()
	window.MakeContextCurrent()

	gl.NamedFramebufferTexture(ctx.framebuffer, gl.COLOR_ATTACHMENT0, ctx.outputTexture, 0)
	gl.BindFramebuffer(gl.FRAMEBUFFER, ctx.framebuffer)
	gl.Viewport(0, 0, int32(width), int32(height))

	if gl.CheckNamedFramebufferStatus(ctx.framebuffer, gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE {
		gl.BindFramebuffer(gl.FRAMEBUFFER, 0)

		return nil, "", errors.New("framebuffer is not complete")
	}

	gl.UseProgram(programOutputTexture)
	gl.Uniform1f(0, float32(frame)/float32(ctx.mainImageSize.z))
	gl.BindVertexArray(mainVertexArray)
	gl.DrawArrays(gl.TRIANGLES, 0, 2*3)
	gl.MemoryBarrier(gl.ALL_BARRIER_BITS)

	gl.PixelStorei(gl.PACK_ALIGNMENT, 1)
	gl.GetTextureSubImage(ctx.outputTexture, 0, 0, 0, 0, int32(width), int32(height), 1, gl.RED, gl.UNSIGNED_BYTE, int32(width*height), gl.Ptr(img.Pix))
	gl.PixelStorei(gl.PACK_ALIGNMENT, 4)

	gl.BindVertexArray(0)
	gl.BindFramebuffer(gl.FRAMEBUFFER, 0)
	gl.UseProgram(0)

	mainMutex.Unlock()
	updateTime(md5sum)

	return img, ctx.outputFormat, nil
}

func GetVolume(volParam *restful.VolumeParameters) (rgba *image.RGBA, format string, err error) {
	ctx, ok := context[volParam.MD5sum]

	if !ok {
		return nil, "", errors.New("image not found")
	} else {
		if ctx.loadingFinished == false {
			return nil, "", nil
		}
	}

	width := ctx.outputImageSize.x
	height := ctx.outputImageSize.y

	img := image.NewRGBA(image.Rect(0, 0, width, height))

	mainMutex.Lock()
	window.MakeContextCurrent()

	gl.BindFramebuffer(gl.FRAMEBUFFER, ctx.framebuffer)
	gl.Viewport(0, 0, int32(width), int32(height))

	if gl.CheckNamedFramebufferStatus(ctx.framebuffer, gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE {
		gl.BindFramebuffer(gl.FRAMEBUFFER, 0)

		return nil, "", errors.New("framebuffer is not complete")
	}

	gl.BindVertexArray(outputVertexArray)

	gl.UseProgram(programVolumeTexture)
	eye := mgl32.Vec3{volParam.ViewX, volParam.ViewY, volParam.ViewZ}
	Translate := mgl32.Translate3D(volParam.TranslateX, volParam.TranslateY, volParam.TranslateZ)
	Rotate := mgl32.HomogRotate3D(mgl32.DegToRad(volParam.RotateAngle), mgl32.Vec3{volParam.RotateX, volParam.RotateY, volParam.RotateZ}.Normalize())
	Model := Translate.Mul4(Rotate)
	View := mgl32.LookAtV(eye, mgl32.Vec3{0, 0, 0}, mgl32.Vec3{0, 1, 0})
	Projection := mgl32.Perspective(90.0, float32(ctx.mainImageSize.x)/float32(ctx.mainImageSize.y), 0.1, 100.0)
	MV := View.Mul4(Model)
	MVP := Projection.Mul4(MV)
	gl.UniformMatrix4fv(0, 1, false, &MVP[0])

	clr := []float32{0, 0, 0, 1}

	gl.NamedFramebufferTexture(ctx.framebuffer, gl.COLOR_ATTACHMENT0, ctx.outputTextureFront, 0)
	gl.ClearNamedFramebufferfv(ctx.framebuffer, gl.COLOR, 0, &clr[0])

	gl.Enable(gl.CULL_FACE)
	gl.CullFace(gl.BACK)
	gl.DrawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, gl.PtrOffset(0))
	gl.MemoryBarrier(gl.ALL_BARRIER_BITS)

	gl.NamedFramebufferTexture(ctx.framebuffer, gl.COLOR_ATTACHMENT0, ctx.outputTextureBack, 0)
	gl.ClearNamedFramebufferfv(ctx.framebuffer, gl.COLOR, 0, &clr[0])
	gl.CullFace(gl.FRONT)
	gl.DrawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, gl.PtrOffset(0))
	gl.MemoryBarrier(gl.ALL_BARRIER_BITS)

	gl.Disable(gl.CULL_FACE)

	gl.UseProgram(programVolumeTexture2)
	gl.NamedFramebufferTexture(ctx.framebuffer, gl.COLOR_ATTACHMENT0, ctx.outputTexture, 0)
	gl.ClearNamedFramebufferfv(ctx.framebuffer, gl.COLOR, 0, &clr[0])
	gl.BindVertexArray(mainVertexArray)
	gl.Uniform1f(0, volParam.Gamma)
	gl.Uniform1i(1, volParam.RenderingMode)
	gl.DrawArrays(gl.TRIANGLES, 0, 2*3)
	gl.MemoryBarrier(gl.ALL_BARRIER_BITS)

	gl.PixelStorei(gl.PACK_ALIGNMENT, 1)
	gl.GetTextureSubImage(ctx.outputTexture, 0, 0, 0, 0, int32(width), int32(height), 1, gl.RGBA, gl.UNSIGNED_BYTE, 4*int32(width*height), gl.Ptr(img.Pix))
	gl.PixelStorei(gl.PACK_ALIGNMENT, 4)

	gl.BindVertexArray(0)
	gl.BindFramebuffer(gl.FRAMEBUFFER, 0)
	gl.UseProgram(0)
	//gl.Disable(gl.BLEND)

	mainMutex.Unlock()
	updateTime(volParam.MD5sum)

	return img, ctx.outputFormat, nil
}

func SetFrame(imageInfo *storage.ImageInfo, img *image.Image, frame int32) error {
	ctx, ok := context[imageInfo.MD5sum]

	if !ok {
		return errors.New("image not found")
	}

	mainMutex.Lock()
	window.MakeContextCurrent()

	gl.NamedFramebufferTextureLayer(ctx.framebuffer, gl.COLOR_ATTACHMENT0, ctx.mainTexture, 0, frame)
	gl.BindFramebuffer(gl.FRAMEBUFFER, ctx.framebuffer)
	gl.Viewport(0, 0, int32(ctx.mainImageSize.x), int32(ctx.mainImageSize.y))

	if gl.CheckNamedFramebufferStatus(ctx.framebuffer, gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE {
		gl.BindFramebuffer(gl.FRAMEBUFFER, 0)

		return errors.New("framebuffer is not complete")
	}

	if (*img).ColorModel() != color.Gray16Model {
		return errors.New("image color model is not supported")
	}

	var loadedImage *image.Gray16

	loadedImage = image.NewGray16((*img).Bounds())
	draw.Draw(loadedImage, loadedImage.Bounds(), *img, image.Point{X: 0, Y: 0}, draw.Src)

	gl.PixelStorei(gl.UNPACK_SWAP_BYTES, gl.TRUE)
	gl.PixelStorei(gl.UNPACK_ALIGNMENT, 1)
	gl.TextureSubImage2D(ctx.inputTexture, 0, 0, 0, int32(imageInfo.Cols), int32(imageInfo.Rows), gl.RED, gl.SHORT, gl.Ptr(loadedImage.Pix))
	gl.PixelStorei(gl.UNPACK_ALIGNMENT, 4)
	gl.PixelStorei(gl.UNPACK_SWAP_BYTES, gl.FALSE)
	gl.MemoryBarrier(gl.ALL_BARRIER_BITS)

	gl.UseProgram(programInputTexture)
	gl.Uniform1f(0, ctx.rescaleSlope)
	gl.Uniform1f(1, ctx.rescaleIntercept)
	gl.Uniform1f(2, ctx.windowCenter)
	gl.Uniform1f(3, ctx.windowWidth)

	gl.BindVertexArray(mainVertexArray)
	gl.DrawArrays(gl.TRIANGLES, 0, 2*3)
	gl.BindVertexArray(0)
	gl.BindFramebuffer(gl.FRAMEBUFFER, 0)
	gl.UseProgram(0)

	ctx.frameLoaded[frame] = true
	mainMutex.Unlock()
	updateTime(imageInfo.MD5sum)

	return nil
}

func SetOutputImageSizeAndFormat(md5sum string, width int, height int, format string) error {
	ctx, ok := context[md5sum]

	if ok == false {
		return errors.New("context does not exist")
	}

	ratio := float32(ctx.mainImageSize.x) / float32(ctx.mainImageSize.y)
	w := width
	h := int(float32(w) / ratio)

	if h > height {
		h = height
		w = int(float32(h) * ratio)
	}

	mainMutex.Lock()
	window.MakeContextCurrent()

	if gl.IsTexture(ctx.outputTexture) {
		gl.DeleteTextures(1, &ctx.outputTexture)
	}

	if gl.IsTexture(ctx.outputTextureFront) {
		gl.DeleteTextures(1, &ctx.outputTextureFront)
	}

	if gl.IsTexture(ctx.outputTextureBack) {
		gl.DeleteTextures(1, &ctx.outputTextureBack)
	}

	borderColor := []float32{0.0, 0.0, 0.0, 1.0}
	var texture uint32

	gl.CreateTextures(gl.TEXTURE_2D, 1, &texture)
	gl.BindTextureUnit(2, texture)
	gl.TextureParameteri(texture, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.TextureParameteri(texture, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.TextureParameteri(texture, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
	gl.TextureParameteri(texture, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)
	gl.TextureParameterfv(texture, gl.TEXTURE_BORDER_COLOR, &borderColor[0])
	gl.TextureStorage2D(texture, 1, gl.RGBA8, int32(w), int32(h))

	var texture1 uint32

	gl.CreateTextures(gl.TEXTURE_2D, 1, &texture1)
	gl.BindTextureUnit(3, texture1)
	gl.TextureParameteri(texture1, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.TextureParameteri(texture1, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.TextureParameteri(texture1, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
	gl.TextureParameteri(texture1, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)
	gl.TextureParameterfv(texture, gl.TEXTURE_BORDER_COLOR, &borderColor[0])
	gl.TextureStorage2D(texture1, 1, gl.RGB8, int32(w), int32(h))

	var texture2 uint32

	gl.CreateTextures(gl.TEXTURE_2D, 1, &texture2)
	gl.BindTextureUnit(4, texture2)
	gl.TextureParameteri(texture2, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.TextureParameteri(texture2, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.TextureParameteri(texture2, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_BORDER)
	gl.TextureParameteri(texture2, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_BORDER)
	gl.TextureParameterfv(texture, gl.TEXTURE_BORDER_COLOR, &borderColor[0])
	gl.TextureStorage2D(texture2, 1, gl.RGB8, int32(w), int32(h))

	ctx.outputImageSize = iVec2D{x: w, y: h}
	ctx.outputFormat = format
	ctx.outputTexture = texture
	ctx.outputTextureFront = texture1
	ctx.outputTextureBack = texture2

	mainMutex.Unlock()
	updateTime(md5sum)

	return nil
}

func GenerateMipmap(md5sum string) error {
	ctx, ok := context[md5sum]

	if !ok {
		return errors.New("image not found")
	}

	mainMutex.Lock()
	window.MakeContextCurrent()

	gl.GenerateTextureMipmap(ctx.mainTexture)
	gl.TextureParameteri(ctx.mainTexture, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
	gl.TextureParameteri(ctx.mainTexture, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

	mainMutex.Unlock()

	return nil
}
