package main

import (
	"backend/restful/node/render"
	"embed"
	"errors"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"backend/env"
	opengl "backend/graphics"
	"backend/restful"
	"backend/restful/institution/image"
	"backend/restful/institution/node"
	radiologyReport "backend/restful/institution/radiology-report"
	"backend/restful/node/storage"
	imageType "backend/restful/toplevel/image-type"
	"backend/restful/toplevel/institution"
	"backend/restful/toplevel/patient"
	"backend/restful/toplevel/user"

	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	"github.com/lucas-clemente/quic-go/http3"
)

//go:embed web files/test.html
var staticHtmlFiles embed.FS

//go:embed shaders
var staticShaderFiles embed.FS

var router *gin.Engine
var authMiddleware *jwt.GinJWTMiddleware
var configFileName *string

type login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func init() {
	runtime.LockOSThread()
}

func main() {
	configFileName = flag.String("config", "config.yaml", "Config file name")
	flag.Parse()

	if env.LoadConfigFile(*configFileName) != nil {
		panic("Can not open configuration file.")
	}

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGUSR1)
	go processSignal(signals)

	if env.ServerConfiguration.Debug == false {
		router = gin.Default()
		gin.SetMode(gin.ReleaseMode)
	} else {
		router = gin.New()
		config := cors.DefaultConfig()
		config.AllowHeaders = []string{"X-PINGOTHER", "Authorization", "Content-Type", "Origin"}
		//		config.AllowAllOrigins = true
		config.AllowOrigins = []string{"https://sivr.info:5000", "https://sivr.info:5001", "https://sivr.info:5002", "https://sivr.info:5003"}
		config.AllowMethods = []string{"GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"}
		config.ExposeHeaders = []string{"Content-Length"}
		config.AllowCredentials = true
		config.AllowOriginFunc = func(origin string) bool {
			return origin == "https://sivr.info:5000/"
		}

		router.Use(cors.New(config))
	}

	var err error

	authMiddleware, err = jwt.New(&jwt.GinJWTMiddleware{
		Realm:         env.ServerConfiguration.Name,
		Key:           []byte(env.ServerConfiguration.JWTPassword),
		Timeout:       time.Minute * 5,
		MaxRefresh:    time.Hour * 8,
		Authenticator: loginHandler,
		PayloadFunc:   payloadHandler,
		Unauthorized:  unauthorized,
		TokenLookup:   "header: Authorization",
		TokenHeadName: "Bearer",
		TimeFunc:      time.Now,
	})

	if err != nil {
		panic("Could not setup auth middleware.")
	}

	fmt.Println("----------------------------------------")
	fmt.Printf("Name: %s\n", env.ServerConfiguration.Name)
	fmt.Printf("Type: %s\n", env.ServerConfiguration.ServerType)
	fmt.Printf("Address: %s\n", env.ServerConfiguration.Address)
	fmt.Printf("Port: %d\n", env.ServerConfiguration.Port)
	fmt.Printf("Debug: %t\n", env.ServerConfiguration.Debug)
	fmt.Println("----------------------------------------")

	//file, err := os.OpenFile(env.ServerConfiguration.Name+".log", os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0644)
	//
	//if err != nil {
	//	panic(err)
	//}
	//
	//defer file.Close()
	//
	//log.SetOutput(file)

	switch env.ServerConfiguration.ServerType {
	case "web":
		startWebServer()
	case "toplevel":
		startToplevelServer()
	case "institution":
		startMainInstitutionServer()
	case "node":
		startNodeServer()
	default:
		panic("Type of server was not selected. Exiting ...")
	}
}

func processSignal(signal chan os.Signal) {
	for {
		select {
		case <-signal:
			// TODO: Čekaj da ne bude korisnika na serveru
			fmt.Printf("Loading configuration from a file %s.\n", *configFileName)
			fmt.Println("Please notice that only JWT password will be reloaded.")

			if env.LoadConfigFile(*configFileName) != nil {
				panic("Can not open configuration file.")
			}

			authMiddleware.Key = []byte(env.ServerConfiguration.JWTPassword)
		}
	}
}

func startWebServer() {
	router.StaticFile("/", "web/index.html")
	router.StaticFile("/index.html", "web/index.html")
	router.StaticFile("/favicon.ico", "web/favicon.ico")
	router.StaticFile("/test.html", "files/test.html")
	router.StaticFS("staticFiles", http.FS(staticHtmlFiles))

	err := http3.ListenAndServe(env.ServerConfiguration.Address+":"+strconv.Itoa(int(env.ServerConfiguration.Port)),
		env.ServerConfiguration.CertFile, env.ServerConfiguration.KeyFile, router)

	if err != nil {
		panic("Could not start server.")
	}
}

func startToplevelServer() {
	env.OpenDatabase()
	defer env.CloseDatabase()

	router.POST("/restful/auth/login", authMiddleware.LoginHandler)
	authRoute := router.Group("/restful/auth")
	authRoute.Use(authMiddleware.MiddlewareFunc())
	{
		authRoute.POST("/refresh_token", authMiddleware.RefreshHandler)
	}

	//Manipulation around default group permissions (should use JWT token but should not be admin)
	router.POST("/restful/user/change-password", authMiddleware.MiddlewareFunc(), user.ChangePassword)
	router.POST("/restful/user/get-my-data", authMiddleware.MiddlewareFunc(), user.MyUserData)
	router.POST("/restful/user/get", authMiddleware.MiddlewareFunc(), user.Get)
	router.POST("/restful/user/find-by-name", authMiddleware.MiddlewareFunc(), user.FindByName)
	router.POST("/restful/user/find-by-institution", authMiddleware.MiddlewareFunc(), user.FindByInstitution)
	userRoute := router.Group("/restful/user")
	userRoute.Use(authMiddleware.MiddlewareFunc())
	userRoute.Use(restful.IsAdmin)
	{
		userRoute.POST("/persist", user.Persist)
		userRoute.POST("/delete", user.Delete)
	}

	patientRoute := router.Group("/restful/patient")
	patientRoute.Use(authMiddleware.MiddlewareFunc())
	{
		patientRoute.POST("/persist", patient.Persist)
		patientRoute.POST("/find-by-name", patient.FindByName)
		patientRoute.POST("/find-by-insurance-number", patient.FindByInsuranceNumber)
		patientRoute.POST("/delete", patient.Delete)
	}

	institutionRoute := router.Group("/restful/institution")
	institutionRoute.Use(authMiddleware.MiddlewareFunc())
	institutionRoute.Use(restful.IsAdmin)
	{
		institutionRoute.POST("/persist", institution.Persist)
		institutionRoute.POST("/get-all", institution.GetAll)
		institutionRoute.POST("/find-by-insurance-number", institution.FindByName)
		institutionRoute.POST("/delete", institution.Delete)
	}

	router.POST("/restful/image-type/get-all", authMiddleware.MiddlewareFunc(), imageType.GetAll)
	router.POST("/restful/image-type/get", authMiddleware.MiddlewareFunc(), imageType.Get)
	imageTypeRoute := router.Group("/restful/image-type")
	imageTypeRoute.Use(authMiddleware.MiddlewareFunc())
	institutionRoute.Use(restful.IsAdmin)
	{
		imageTypeRoute.POST("/persist", imageType.Persist)
		imageTypeRoute.POST("/delete", imageType.Delete)
	}

	err := http3.ListenAndServe(env.ServerConfiguration.Address+":"+strconv.Itoa(int(env.ServerConfiguration.Port)),
		env.ServerConfiguration.CertFile, env.ServerConfiguration.KeyFile, router)

	if err != nil {
		panic("Could not start server.")
	}
}

func startMainInstitutionServer() {
	env.OpenDatabase()
	defer env.CloseDatabase()

	infoRoute := router.Group("/restful/info")
	infoRoute.Use(authMiddleware.MiddlewareFunc())
	{
		infoRoute.POST("/ping", ping)
	}

	router.POST("/restful/node/get-all", authMiddleware.MiddlewareFunc(), node.GetAll)
	router.POST("/restful/node/get", authMiddleware.MiddlewareFunc(), node.Get)
	nodeRoute := router.Group("/restful/node")
	nodeRoute.Use(authMiddleware.MiddlewareFunc())
	nodeRoute.Use(restful.IsSuperuser)
	{
		nodeRoute.POST("/persist", node.Persist)
		nodeRoute.POST("/delete", node.Delete)
	}

	imageRoute := router.Group("/restful/image")
	imageRoute.Use(authMiddleware.MiddlewareFunc())
	{
		imageRoute.POST("/persist", image.Persist)
		imageRoute.POST("/find-by-patient", image.FindByPatient)
		imageRoute.POST("/get", image.Get)
		imageRoute.POST("/delete", image.Delete)
	}

	radiologyReportRoute := router.Group("/restful/radiology-report")
	radiologyReportRoute.Use(authMiddleware.MiddlewareFunc())
	{
		radiologyReportRoute.POST("/persist", radiologyReport.Persist)
		radiologyReportRoute.POST("/find-by-patient", radiologyReport.FindByPatient)
		radiologyReportRoute.POST("/delete", radiologyReport.Delete)
		radiologyReportRoute.POST("/attach-image", radiologyReport.AttachImage)
		radiologyReportRoute.POST("/detach-image", radiologyReport.DetachImage)
		radiologyReportRoute.POST("/get", radiologyReport.Get)
		radiologyReportRoute.POST("/list-images", radiologyReport.ListImages)
	}

	err := http3.ListenAndServe(env.ServerConfiguration.Address+":"+strconv.Itoa(int(env.ServerConfiguration.Port)),
		env.ServerConfiguration.CertFile, env.ServerConfiguration.KeyFile, router)

	if err != nil {
		panic("Could not start server.")
	}
}

func startNodeServer() {
	opengl.InitOpenGL(&staticShaderFiles)
	defer opengl.ShutdownOpenGL()

	infoRoute := router.Group("/restful/info")
	infoRoute.Use(authMiddleware.MiddlewareFunc())
	{
		infoRoute.POST("/ping", ping)
	}

	storageRoute := router.Group("/restful/storage")
	storageRoute.Use(authMiddleware.MiddlewareFunc())
	{
		storageRoute.POST("/save-image", storage.SaveImage)
		storageRoute.POST("/delete-image", storage.DeleteImage)
	}

	renderRoute := router.Group("/restful/render")
	renderRoute.Use(authMiddleware.MiddlewareFunc())
	{
		renderRoute.POST("/load-image", render.LoadImage)
		renderRoute.POST("/unload-image", render.UnloadImage)
		renderRoute.POST("/fetch-frame", render.FetchFrame)
		renderRoute.POST("/fetch-volume", render.FetchVolume)
		renderRoute.POST("/set-resolution-and-format", render.SetResolutionAndFormat)
	}

	err := http3.ListenAndServe(env.ServerConfiguration.Address+":"+strconv.Itoa(int(env.ServerConfiguration.Port)),
		env.ServerConfiguration.CertFile, env.ServerConfiguration.KeyFile, router)

	if err != nil {
		panic("Could not start server.")
	}
}

func unauthorized(c *gin.Context, code int, message string) {
	c.String(http.StatusUnauthorized, "User is not authorized for this action.")
}

func loginHandler(c *gin.Context) (interface{}, error) {
	var loginVals login
	var err error

	err = c.ShouldBind(&loginVals)

	if err != nil {
		return nil, jwt.ErrMissingLoginValues
	}

	userID := loginVals.Username
	password := loginVals.Password

	var ud user.Users

	err = env.Db().Where("username = ? AND password = ? AND active = TRUE", userID, password).First(&ud).Error

	switch {
	case err == gorm.ErrRecordNotFound:
		c.String(http.StatusUnauthorized, "user/login: Wrong username or password.")
		return nil, errors.New("wrong username or password")
	case err != nil:
		c.String(http.StatusInternalServerError, "user/login: Error while querying database.")
		return nil, errors.New("internal server error")
	}

	return &ud.Username, nil
}

func payloadHandler(data interface{}) jwt.MapClaims {
	userID, ok := data.(*string)

	if ok == false {
		return nil
	}

	var ud user.Users
	var err error

	err = env.Db().Where("username = ?", userID).First(&ud).Error

	switch {
	case err == gorm.ErrRecordNotFound:
		return nil
	case err != nil:
		return nil
	}

	var id institution.Institutions

	err = env.Db().Where("id = ?", ud.Institution).First(&id).Error

	switch {
	case err == gorm.ErrRecordNotFound:
		return nil
	case err != nil:
		return nil
	}

	return jwt.MapClaims{
		"admin":                   ud.Administrator,
		"superuser":               ud.Superuser,
		"user_id":                 ud.ID,
		"MD":                      ud.DoctorOfMedicine,
		"institution_id":          id.ID,
		"institution_ip_address":  id.IPAddress,
		"institution_port_number": id.PortNumber,
	}
}

func ping(c *gin.Context) {
	c.String(http.StatusOK, "info/ping: Ping was successful.")
}
