package institution

import (
	"net/http"
	"backend/env"
	"backend/restful"

	"github.com/gin-gonic/gin"
)

//FindByName is used to find institution data by name. It is exported as RESTful endpoint via URL /restful/institution/find-by-name.
func FindByName(c *gin.Context) {
	var json findInstitutionByNameRequest

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "institution/find-by-name: Error while parsing request data.")
		return
	}

	var id []Institutions
	var err error

	err = env.Db().Where("name LIKE ?", restful.ReplaceWildcard(json.Name)).Find(&id).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "institution/find-by-name: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, id)
}
