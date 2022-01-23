package image_type

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Get is used to get image type. It is exported as RESTful endpoint via URL /restful/image-type/get.
func Get(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "image-type/get: Error while parsing request data.")
		return
	}

	var id []ImageTypes
	var err error

	err = env.Db().Where(&ImageTypes{ID: json.ID}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "image-type/get: Error while querying database.")
		return
	}

	if len(id) != 1 {
		c.String(http.StatusInternalServerError, "image-type/get: Incorrect number of results found when expected one.")
		return
	}

	c.JSON(http.StatusOK, id[0])
}
