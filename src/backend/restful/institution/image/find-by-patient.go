package image

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"backend/env"
	"backend/restful"
)

//FindByPatient is used to find image metadata by patient. It is exported as RESTful endpoint via URL /restful/image/find-by-patient.
func FindByPatient(c *gin.Context) {
	var json restful.FindByPatient

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "image/find-by-patient: Error while parsing request data.")
		return
	}

	var id []Images
	var err error

	err = env.Db().Where(&Images{Patient: json.Patient}).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "image/find-by-patient: Error while querying database.")
		return
	}

	var response = make([]imageSearchResults, 0, len(id))

	for _, v := range id {
		tmp := imageSearchResults{
			Institution: json.Institution,
			Image:       v,
		}

		response = append(response, tmp)
	}

	c.JSON(http.StatusOK, response)
}
