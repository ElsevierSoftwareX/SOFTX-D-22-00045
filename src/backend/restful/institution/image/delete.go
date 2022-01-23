package image

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete image metadata. It is exported as RESTful endpoint via URL /restful/image/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "image/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&Images{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "image/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "image/delete: Image metadata was successfully deleted.")
}
