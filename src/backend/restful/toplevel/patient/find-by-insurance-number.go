package patient

import (
	"net/http"
	"backend/env"

	"github.com/gin-gonic/gin"
)

//FindByInsuranceNumber is used to find patient data by insurance number. It is exported as RESTful endpoint via URL /restful/patient/find-by-insurance-number.
func FindByInsuranceNumber(c *gin.Context) {
	var json findByInsuranceNumberRequest

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "patient/find-by-insurance-number: Error while parsing request data.")
		return
	}

	var pd []Patients
	var err error

	err = env.Db().Where(&Patients{InsuranceNumber: json.InsuranceNumber}).Find(&pd).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "patient/find-by-insurance-number: Error while querying database.")
		return
	}

	if len(pd) > 1 {
		c.String(http.StatusInternalServerError, "patient/find-by-insurance-number: Multiple result found when expected one.")
		return
	}

	c.JSON(http.StatusOK, pd[0])
}
