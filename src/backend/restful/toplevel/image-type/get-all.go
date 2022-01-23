package image_type

import (
	"net/http"
	"backend/env"

	"github.com/gin-gonic/gin"
)

//GetAll is used to list all image types. It is exported as RESTful endpoint via URL /restful/image-type/get-all.
func GetAll(c *gin.Context) {
	var id []ImageTypes
	var err error

	err = env.Db().Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "image-type/get-all: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, id)
}
