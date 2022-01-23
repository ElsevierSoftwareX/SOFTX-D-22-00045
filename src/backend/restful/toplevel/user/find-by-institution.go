package user

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//FindByInstitution is used to find users by institution in which they work. It is exported as RESTful endpoint via URL /restful/user/find-by-institution.
func FindByInstitution(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "user/find-by-institution: Error while parsing request data.")
		return
	}

	var ud []Users
	var err error

	err = env.Db().Where(&Users{Institution: json.ID}).Find(&ud).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "user/find-by-institution: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, ud)
}
