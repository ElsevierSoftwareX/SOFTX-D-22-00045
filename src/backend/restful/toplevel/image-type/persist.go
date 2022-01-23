package image_type

import (
	"net/http"

	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Persist is used to save image type. It is exported as RESTful endpoint via URL /restful/image-type/persist.
func Persist(c *gin.Context) {
	var json ImageTypes

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "image-type/persist: Error parsing request data.")
		return
	}

	var err error

	if env.Db().NewRecord(json) {
		err = env.Db().Create(&json).Error
	} else {
		err = env.Db().Save(&json).Error
	}

	if err != nil {
		c.String(http.StatusInternalServerError, "image-type/persist: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, restful.RecordID{ID: json.ID})
}
