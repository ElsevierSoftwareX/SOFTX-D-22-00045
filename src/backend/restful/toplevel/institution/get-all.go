package institution

import (
	"net/http"
	"backend/env"

	"github.com/gin-gonic/gin"
)

//GetAll is used to list all institutions. It is exported as RESTful endpoint via URL /restful/institution/get-all.
func GetAll(c *gin.Context) {
	var id []Institutions
	var err error

	err = env.Db().Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "institution/get-all: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, id)
}
