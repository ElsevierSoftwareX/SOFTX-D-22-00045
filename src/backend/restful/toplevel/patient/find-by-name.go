package patient

import (
	"net/http"
	"backend/env"
	"backend/restful"
	"backend/restful/toplevel"

	"github.com/gin-gonic/gin"
)

//FindByName is used to find patient data by first and last name. It is exported as RESTful endpoint via URL /restful/patient/find-by-name.
func FindByName(c *gin.Context) {
	var json toplevel.FindByFirstAndLastNameRequest

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "patient/find-by-name: Error while parsing request data.")
		return
	}

	var pd []Patients
	var err error

	err = env.Db().Where("first_name LIKE ? AND last_name LIKE ?",
		restful.ReplaceWildcard(json.FirstName), restful.ReplaceWildcard(json.LastName)).Find(&pd).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "patient/find-by-name: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, pd)
}
