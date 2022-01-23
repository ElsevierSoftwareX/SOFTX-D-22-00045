package patient

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//Delete is used to delete patient data. It is exported as RESTful endpoint via URL /restful/patient/delete.
func Delete(c *gin.Context) {
	var json restful.RecordID

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "patient/delete: Error while parsing request data.")
		return
	}

	var err error

	err = env.Db().Delete(&Patients{ID: json.ID}).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "patient/delete: Error while deleting record.")
		return
	}

	c.String(http.StatusOK, "patient/delete: Patient data was successfully deleted.")
}
