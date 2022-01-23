package radiology_report

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"backend/env"
	"backend/restful"
)

//ListImages is used to list images attached to radiology report. It is exported as RESTful endpoint via URL /restful/radiology-report/list-images.
func ListImages(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "radiology-report/list-images: Error while parsing request data.")
		return
	}

	var id []RadiologyReportImages
	var err error

	err = env.Db().Where(&RadiologyReportImages{RadiologyReport: json.ID}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "radiology-report/list-images: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, id)
}
