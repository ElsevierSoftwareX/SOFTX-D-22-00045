package node

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete node data. It is exported as RESTful endpoint via URL /restful/node/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "node/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&Nodes{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "node/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "node/delete: Node data was successfully deleted.")
}
