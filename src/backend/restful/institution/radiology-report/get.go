package radiology_report

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Get is used to get radiology report. It is exported as RESTful endpoint via URL /restful/radiology-report/get.
func Get(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "radiology-report/get: Error while parsing request data.")
		return
	}

	var id []RadiologyReport
	var err error

	err = env.Db().Where(&RadiologyReport{ID: json.ID}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "radiology-report/get: Error while querying database.")
		return
	}

	if len(id) != 1 {
		c.String(http.StatusInternalServerError, "radiology-report/get: Incorrect number of results found when expected one.")
		return
	}

	c.JSON(http.StatusOK, id[0])
}
