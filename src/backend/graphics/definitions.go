package opengl

import (
	"time"
)

type graphicsContext struct {
	dicomImageSize     iVec3D
	mainImageSize      iVec3D
	outputImageSize    iVec2D
	dicomName          string
	inputTexture       uint32
	mainTexture        uint32
	outputTexture      uint32
	outputTextureFront uint32
	outputTextureBack  uint32
	lastAccessTime     time.Time
	frameLoaded        []bool
	loadingError       bool
	loadingFinished    bool
	framebuffer        uint32
	outputFormat       string
	rescaleSlope       float32
	rescaleIntercept   float32
	windowCenter       float32
	windowWidth        float32
}

type iVec2D struct {
	x int
	y int
}

type iVec3D struct {
	x int
	y int
	z int
}
