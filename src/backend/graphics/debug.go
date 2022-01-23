package opengl

import (
	"fmt"
	"github.com/go-gl/gl/v4.6-core/gl"
	"unsafe"
)

func debugOpenGL(source uint32, gltype uint32, id uint32, severity uint32, length int32, message string, userParam unsafe.Pointer) {
	var src, typ, svr string

	switch source {
	case gl.DEBUG_SOURCE_API:
		src = "API"
	case gl.DEBUG_SOURCE_WINDOW_SYSTEM:
		src = "WINDOW SYSTEM"
	case gl.DEBUG_SOURCE_SHADER_COMPILER:
		src = "SHADER COMPILER"
	case gl.DEBUG_SOURCE_THIRD_PARTY:
		src = "THIRD PARTY"
	case gl.DEBUG_SOURCE_APPLICATION:
		src = "APPLICATION"
	case gl.DEBUG_SOURCE_OTHER:
		src = "OTHER"
	}

	switch gltype {
	case gl.DEBUG_TYPE_ERROR:
		typ = "ERROR"
	case gl.DEBUG_TYPE_DEPRECATED_BEHAVIOR:
		typ = "DEPRECATED_BEHAVIOR"
	case gl.DEBUG_TYPE_UNDEFINED_BEHAVIOR:
		typ = "UNDEFINED_BEHAVIOR"
	case gl.DEBUG_TYPE_PORTABILITY:
		typ = "PORTABILITY"
	case gl.DEBUG_TYPE_PERFORMANCE:
		typ = "PERFORMANCE"
	case gl.DEBUG_TYPE_MARKER:
		typ = "MARKER"
	case gl.DEBUG_TYPE_OTHER:
		typ = "OTHER"
	}

	switch severity {
	case gl.DEBUG_SEVERITY_NOTIFICATION:
		svr = "NOTIFICATION"
	case gl.DEBUG_SEVERITY_LOW:
		svr = "LOW"
	case gl.DEBUG_SEVERITY_MEDIUM:
		svr = "MEDIUM"
	case gl.DEBUG_SEVERITY_HIGH:
		svr = "HIGH"
	}
	fmt.Println("-----OpenGL debug message-----")
	fmt.Println("Source:", src)
	fmt.Println("Type:", typ)
	//fmt.Println("ID:", id)
	fmt.Println("Severity:", svr)
	//fmt.Println("Length:", length)
	fmt.Print("Message: ", message)
	//fmt.Println("User param:", userParam)
	fmt.Println("------------------------------")
}
