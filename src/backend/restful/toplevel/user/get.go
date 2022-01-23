package user

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"backend/env"
	"backend/restful"
)

//Get is used to find user data by first and last name. It is exported as RESTful endpoint via URL /restful/user/get.
func Get(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "user/get: Error while parsing request data.")
		return
	}

	var ud []Users
	var err error

	err = env.Db().Where(&Users{ID: json.ID}).Find(&ud).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "user/get: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, ud)
}
