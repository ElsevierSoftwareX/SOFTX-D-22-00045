package radiology_report

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//DetachImage is used to detach image from radiology report. It is exported as RESTful endpoint via URL /restful/radiology-report/detach-image.
func DetachImage(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "radiology-report/detach-image: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&RadiologyReportImages{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "radiology-report/detach-image: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "radiology-report/detach-image: Image was successfully detached from radiology-report.")
}
