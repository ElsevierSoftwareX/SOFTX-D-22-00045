package radiology_report

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete radiology report. It is exported as RESTful endpoint via URL /restful/radiology-report/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "radiology-report/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&RadiologyReport{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "radiology-report/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "radiology-report/delete: radiology-report was successfully deleted.")
}
