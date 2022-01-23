package user

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete user data. It is exported as RESTful endpoint via URL /restful/user/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "user/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&Users{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "user/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "user/delete: User data was successfully deleted.")
}
