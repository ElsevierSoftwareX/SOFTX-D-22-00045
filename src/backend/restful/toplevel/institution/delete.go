package institution

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete institution data. It is exported as RESTful endpoint via URL /restful/institution/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "institution/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&Institutions{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "institution/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "institution/delete: Institution data was successfully deleted.")
}
