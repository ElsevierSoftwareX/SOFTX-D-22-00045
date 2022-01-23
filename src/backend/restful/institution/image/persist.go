package image

import (
	"net/http"

	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Persist is used to save image metadata. It is exported as RESTful endpoint via URL /restful/image/persist.
func Persist(c *gin.Context) {
	var err error
	var json Images

	err = c.BindJSON(&json)

	if err != nil {
		c.String(http.StatusBadRequest, "image/persist: Error parsing request data.")
		return
	}

	if env.Db().NewRecord(json) {
		err = env.Db().Create(&json).Error
	} else {
		err = env.Db().Save(&json).Error
	}

	if err != nil {
		c.String(http.StatusInternalServerError, "image/persist: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, restful.RecordID{ID: json.ID})
}
