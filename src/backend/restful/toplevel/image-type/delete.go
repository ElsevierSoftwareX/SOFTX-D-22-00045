package image_type

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete image type. It is exported as RESTful endpoint via URL /restful/image-type/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "image-type/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&ImageTypes{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "image-type/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "image-type/delete: Image type was successfully deleted.")
}
