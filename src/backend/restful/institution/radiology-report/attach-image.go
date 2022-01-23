package radiology_report

import (
	"net/http"

	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//AttachImage is used to attach image to radiology report. It is exported as RESTful endpoint via URL /restful/radiology-report/attach-image.
func AttachImage(c *gin.Context) {
	var json RadiologyReportImages

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "radiology-report/attach-image: Error parsing request data.")
		return
	}

	var err error

	err = env.Db().Create(&json).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "radiology-report/attach-image: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, restful.RecordID{ID: json.ID})
}
