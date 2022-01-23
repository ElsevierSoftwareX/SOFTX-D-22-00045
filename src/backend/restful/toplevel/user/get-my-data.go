package user

import (
	"net/http"
	"backend/env"
	"backend/restful/toplevel/institution"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

//MyUserData is used to fetch data about the user and the institution for which he works. It is exported as RESTful endpoint via URL /restful/user/get-my-data.
func MyUserData(c *gin.Context) {
	payload, ok := c.Get("JWT_PAYLOAD")

	if ok != true {
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	}

	userIDclaim, ok := payload.(jwt.MapClaims)["user_id"]

	if ok != true {
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	}

	userID, ok := userIDclaim.(string)

	if ok != true {
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	}

	institutionIDclaim, ok := payload.(jwt.MapClaims)["institution_id"]

	if ok != true {
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	}

	institutionID, ok := institutionIDclaim.(string)

	if ok != true {
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	}

	var myData *myUserData = new(myUserData)

	var err error

	err = env.Db().Where(&Users{ID: userID}).First(&myData.UserData).Error

	switch {
	case err == gorm.ErrRecordNotFound:
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	case err != nil:
		c.String(http.StatusInternalServerError, "user/get-my-data: Error while querying database.")
		return
	}

	err = env.Db().Where(&institution.Institutions{ID: institutionID}).First(&myData.InstitutionData).Error

	switch {
	case err == gorm.ErrRecordNotFound:
		c.String(http.StatusUnauthorized, "user/get-my-data: User is not authorized for this action.")
		return
	case err != nil:
		c.String(http.StatusInternalServerError, "user/get-my-data: Error while querying database.")
		return
	}

	c.JSON(http.StatusOK, myData)
}
