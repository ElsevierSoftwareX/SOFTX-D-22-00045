package render

import (
	"bytes"
	"image/jpeg"
	"image/png"
	"net/http"
	opengl "backend/graphics"

	"github.com/gin-gonic/gin"
	"github.com/kolesa-team/go-webp/encoder"
	"github.com/kolesa-team/go-webp/webp"
)

//FetchFrame is used to fetch image frame. It is exported as RESTful endpoint via URL /restful/render/fetch-frame.
func FetchFrame(c *gin.Context) {
	var json frameNumber

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "render/fetch-frame: Error while parsing request data.")
		return
	}

	var err error

	img, format, err := opengl.GetFrame(json.MD5sum, json.Frame)

	if err != nil {
		c.String(http.StatusBadRequest, "render/fetch-frame: Error while fetching frame.")
		return
	}

	if img == nil {
		c.String(http.StatusNoContent, "render/fetch-frame: Image is still loading.")
		return
	}

	buffer := new(bytes.Buffer)

	switch format {
	case "webp":
		options, err := encoder.NewLossyEncoderOptions(encoder.PresetDefault, 95)

		if err != nil {
			c.String(http.StatusBadRequest, "render/fetch-frame: Unable to encode image.")
			return
		}

		err = webp.Encode(buffer, img, options)
	case "jpeg":
		err = jpeg.Encode(buffer, img, &jpeg.Options{95})
	case "png":
		err = png.Encode(buffer, img)
	default:
		c.String(http.StatusBadRequest, "render/fetch-frame: Image format not set.")
		return
	}

	if err != nil {
		c.String(http.StatusBadRequest, "render/fetch-frame: Unable to encode image.")
		return
	}

	//dst := make([]byte, base64.StdEncoding.EncodedLen(buffer.Len()))
	//base64.StdEncoding.Encode(dst, buffer.Bytes())

	c.Data(200, "text/plain", buffer.Bytes())
}
