package restful

import (
	"net/http"
	"strings"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
)

//ReplaceWildcard is used to replace wildcard * (which users are accustomed to) with % (which database requires).
func ReplaceWildcard(input string) string {
	return strings.Replace(input, "*", "%", -1)
}

//IsAdmin checks if user is admin.
func IsAdmin(c *gin.Context) {
	payload, ok := c.Get("JWT_PAYLOAD")

	if ok != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	admin, ok := payload.(jwt.MapClaims)["admin"]

	if ok != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	retval, ok := admin.(bool)

	if ok != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	if retval != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	c.Next()
}

//IsSuperuser checks if user is superuser.
func IsSuperuser(c *gin.Context) {
	payload, ok := c.Get("JWT_PAYLOAD")

	if ok != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	superuser, ok := payload.(jwt.MapClaims)["superuser"]

	if ok != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	retval, ok := superuser.(bool)

	if ok != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	if retval != true {
		c.String(http.StatusUnauthorized, "User is not authorized for this action.")
		c.Abort()
		return
	}

	c.Next()
}
