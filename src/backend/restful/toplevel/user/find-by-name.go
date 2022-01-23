package user

import (
	"net/http"
	"backend/env"
	"backend/restful"
	"backend/restful/toplevel"

	"github.com/gin-gonic/gin"
)

//FindByName is used to find user data by first and last name. It is exported as RESTful endpoint via URL /restful/user/find-by-name.
func FindByName(c *gin.Context) {
	var json toplevel.FindByFirstAndLastNameRequest

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "user/find-by-name: Error while parsing request data.")
		return
	}

	var ud []Users
	var err error

	err = env.Db().Where("first_name LIKE ? AND last_name LIKE ?",
		restful.ReplaceWildcard(json.FirstName), restful.ReplaceWildcard(json.LastName)).Find(&ud).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "user/find-by-name: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, ud)
}
