package institution

import (
	"net/http"

	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Persist is used to save institution data. It is exported as RESTful endpoint via URL /restful/institution/persist.
func Persist(c *gin.Context) {
	var json Institutions

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "institution/persist: Error parsing request data.")
		return
	}

	var err error

	if env.Db().NewRecord(json) {
		err = env.Db().Create(&json).Error
	} else {
		err = env.Db().Save(&json).Error
	}

	if err != nil {
		c.String(http.StatusInternalServerError, "institution/persist: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, restful.RecordID{ID: json.ID})
}
