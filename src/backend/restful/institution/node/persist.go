package node

import (
	"net/http"

	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Persist is used to save node data. It is exported as RESTful endpoint via URL /restful/node/persist.
func Persist(c *gin.Context) {
	var json Nodes

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "node/persist: Error parsing request data.")
		return
	}

	var err error

	if env.Db().NewRecord(json) {
		err = env.Db().Create(&json).Error
	} else {
		err = env.Db().Save(&json).Error
	}

	if err != nil {
		c.String(http.StatusInternalServerError, "node/persist: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, restful.RecordID{ID: json.ID})
}
