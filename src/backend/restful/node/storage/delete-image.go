package storage

import (
	"net/http"
	"os"
	"backend/env"

	"github.com/gin-gonic/gin"
)

//DeleteImage is used to delete image from disk. It is exported as RESTful endpoint via URL /restful/storage/delete-image.
func DeleteImage(c *gin.Context) {
	var json Checksum

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "storage/delete-image: Error while parsing request data.")
		return
	}

	var err error

	err = os.Remove(env.GetImagesFolder() + string(os.PathSeparator) + json.MD5sum)

	if err != nil {
		c.String(http.StatusInternalServerError, "storage/delete-image: Error while deleting file.")
		return
	}

	c.String(http.StatusOK, "storage/delete-image: Image was successfully deleted.")
}
