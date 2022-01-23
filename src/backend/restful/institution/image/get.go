package image

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Get is used to get image metadata. It is exported as RESTful endpoint via URL /restful/image/get.
func Get(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "image/get: Error while parsing request data.")
		return
	}

	var id []Images
	var err error

	err = env.Db().Where(&Images{ID: json.ID}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "image/get: Error while querying database.")
		return
	}

	if len(id) > 1 {
		c.String(http.StatusInternalServerError, "image/get: Multiple results found when expected one.")
		return
	} else if len(id) == 0 {
		c.String(http.StatusNoContent, "image/get: No results found.")
		return
	}

	c.JSON(http.StatusOK, id[0])
}
