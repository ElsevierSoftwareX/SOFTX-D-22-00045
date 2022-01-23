package node

import (
	"net/http"
	"backend/env"

	"github.com/gin-gonic/gin"
)

//GetAll is used to list all nodes. It is exported as RESTful endpoint via URL /restful/node/get-all.
func GetAll(c *gin.Context) {
	var id []Nodes
	var err error

	err = env.Db().Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "node/get-all: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, id)
}
