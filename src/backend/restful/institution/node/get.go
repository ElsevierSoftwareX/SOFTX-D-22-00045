package node

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Get is used to find node data by name. It is exported as RESTful endpoint via URL /restful/node/get.
func Get(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "node/get: Error while parsing request data.")
		return
	}

	var id []Nodes
	var err error

	err = env.Db().Where(&Nodes{ID: json.ID}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "node/get: Error while querying database.")
		return
	}

	if len(id) != 1 {
		c.String(http.StatusInternalServerError, "node/get: Incorrect number of results found when expected one.")
		return
	}

	c.JSON(http.StatusOK, id[0])
}
