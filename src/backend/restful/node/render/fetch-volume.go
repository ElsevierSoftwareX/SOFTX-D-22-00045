package render

import (
	"bytes"
	"image/jpeg"
	"image/png"
	"net/http"
	opengl "backend/graphics"
	"backend/restful"

	"github.com/gin-gonic/gin"
	"github.com/kolesa-team/go-webp/encoder"
	"github.com/kolesa-team/go-webp/webp"
)

//FetchVolume is used to fetch rendered volume. It is exported as RESTful endpoint via URL /restful/render/fetch-volume.
func FetchVolume(c *gin.Context) {
	var json restful.VolumeParameters

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "render/fetch-volume: Error while parsing request data.")
		return
	}

	var err error

	img, format, err := opengl.GetVolume(&json)

	if err != nil {
		c.String(http.StatusBadRequest, "render/fetch-volume: Error while fetching volume.")
		return
	}

	if img == nil {
		c.String(http.StatusNoContent, "render/fetch-volume: Image is still loading.")
		return
	}

	buffer := new(bytes.Buffer)

	switch format {
	case "webp":
		options, err := encoder.NewLossyEncoderOptions(encoder.PresetDefault, 95)

		if err != nil {
			c.String(http.StatusBadRequest, "render/fetch-volume: Unable to encode image.")
			return
		}

		err = webp.Encode(buffer, img, options)
	case "jpeg":
		err = jpeg.Encode(buffer, img, &jpeg.Options{95})
	case "png":
		err = png.Encode(buffer, img)
	default:
		c.String(http.StatusBadRequest, "render/fetch-volume: Image format not set.")
		return
	}

	if err != nil {
		c.String(http.StatusBadRequest, "render/fetch-volume: Unable to encode image.")
		return
	}

	//dst := make([]byte, base64.StdEncoding.EncodedLen(buffer.Len()))
	//base64.StdEncoding.Encode(dst, buffer.Bytes())

	c.Data(200, "text/plain", buffer.Bytes())
}
