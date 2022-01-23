package render

import (
	"github.com/gin-gonic/gin"
	"net/http"
	opengl "backend/graphics"
	"backend/restful/node/storage"
)

//UnloadImage is used to unload image from memory. It is exported as RESTful endpoint via URL /restful/render/unload-image.
func UnloadImage(c *gin.Context) {
	var json storage.Checksum

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "render/unload-image: Error while parsing request data.")
		return
	}

	err := opengl.Destroy(json.MD5sum)

	if err != nil {
		c.String(http.StatusInternalServerError, "render/unload-image: Image not found.")
		return
	}

	c.String(http.StatusOK, "render/unload-image: Image was successfully deleted.")
}
