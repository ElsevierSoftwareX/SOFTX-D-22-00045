package radiology_report

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//FindByPatient is used to find radiology report by patient. It is exported as RESTful endpoint via URL /restful/radiology-report/find-by-patient.
func FindByPatient(c *gin.Context) {
	var json restful.FindByPatient

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "radiology-report/find-by-patient: Error while parsing request data.")
		return
	}

	var id []RadiologyReport
	var err error

	err = env.Db().Where(&RadiologyReport{Patient: json.Patient}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "radiology-report/find-by-patient: Error while querying database.")
		return
	}

	var response = make([]radiologyReportSearchResults, 0, len(id))

	for _, v := range id {
		tmp := radiologyReportSearchResults{
			Institution:     json.Institution,
			RadiologyReport: v,
		}

		response = append(response, tmp)
	}

	c.JSON(http.StatusOK, response)
}
