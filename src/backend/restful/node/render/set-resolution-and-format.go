package render

import (
	"github.com/gin-gonic/gin"
	"net/http"
	opengl "backend/graphics"
)

func SetResolutionAndFormat(c *gin.Context) {
	var json resolutionAndFormat

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "render/set-resolution-and-format: Error while parsing request data.")
		return
	}

	err := opengl.SetOutputImageSizeAndFormat(json.MD5sum, json.Width, json.Height, json.Format)

	if err != nil {
		c.String(http.StatusBadRequest, "render/set-resolution-and-format: Unable set image resolution and format.")
		return
	}

	c.String(http.StatusOK, "")
}
