package user

import (
	"net/http"
	"backend/env"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

//ChangePassword is used to change the password of currently logged in user. It is exported as RESTful endpoint via URL /restful/user/change-password.
func ChangePassword(c *gin.Context) {
	payload, ok := c.Get("JWT_PAYLOAD")

	if ok != true {
		c.String(http.StatusUnauthorized, "user/change-password: User is not authorized for this action.")
		return
	}

	userIDclaim, ok := payload.(jwt.MapClaims)["user_id"]

	if ok != true {
		c.String(http.StatusUnauthorized, "user/change-password: User is not authorized for this action.")
		return
	}

	userID, ok := userIDclaim.(string)

	if ok != true {
		c.String(http.StatusUnauthorized, "user/change-password: User is not authorized for this action.")
		return
	}

	var passwords changePasswordRequest

	if c.BindJSON(&passwords) != nil {
		c.String(http.StatusBadRequest, "user/change-password: Error while parsing request data.")
		return
	}

	var ud Users
	var err error

	err = env.Db().Where(&Users{ID: userID, Password: passwords.OldPassword}).First(&ud).Error

	switch {
	case err == gorm.ErrRecordNotFound:
		c.String(http.StatusUnauthorized, "user/change-password: User is not authorized for this action.")
		return
	case err != nil:
		c.String(http.StatusInternalServerError, "user/change-password: Error while querying database.")
		return
	}

	ud.Password = passwords.NewPassword
	err = env.Db().Save(&ud).Error

	if err != nil {
		c.String(http.StatusInternalServerError, "user/change-password: Error while querying database.")
		return
	}

	c.String(http.StatusOK, "user/change-password: Password was successfully changed.")
}
