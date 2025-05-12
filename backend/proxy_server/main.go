package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

var logger ServerLogger

func main() {
	logger = NewZLogger(true) 
	router := gin.New()

	// Use our custom logger middleware
	router.Use(logger.GinLogger())

	// allow CORS request for frontend dev server request
	router.Use(cors.Default())
	// setup oauth2 client
	setOauthClient()
	// Serve frontend static files
	router.Use(static.Serve("/", static.LocalFile("../../frontend/build", true)))
	// if no match route found, take it to index.html for front-end routing
	router.NoRoute(func(c *gin.Context) { c.File("../../frontend/build/index.html") })
	// setup route group for the API
	setAPIGroup(router)

	// Start and run the server
	if err := router.Run(":80"); err != nil {
		logger.Error("server", "start", "Failed to start server: "+err.Error())
		panic("gin server fail to start")
	}
}

func setAPIGroup(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.POST("/getOverview", getClusterOverviewHandler)
		api.POST("/getNodes", getNodeHandler)
		api.POST("/getDeployments", getDeploymentHandler)
		api.POST("/getStatefulsets", getStatefulsetHandler)
		api.POST("/getJobs", getJobHandler)
		api.POST("/getNodepools", getNodepoolHandler)
		api.POST("/getPods", getPodHandler)
		api.POST("/login", loginHandler)
		api.POST("/register", registerHandler)
		api.POST("/setNodeAutonomy", setNodeAutonomyHandler)
		api.POST("/getApps", getAppHandler)
		api.POST("/installApp", installAppHandler)
		api.POST("/uninstallApp", uninstallAppHandler)
		api.POST("/github", githubLoginHandler)
		api.POST("/initEntryInfo", initEntryInfoHandler)
		api.POST("/checkConnectivity", checkConnectivityHandler)
		api.POST("/guideComplete", guideCompleteHandler)
	}
	setSystemAPIGroup(api)
}

func setSystemAPIGroup(router *gin.RouterGroup) {
	system := router.Group("/system")
	{
		system.POST("/appList", getSystemAppListHandler)
		system.POST("/appInstall", installSystemAppHandler)
		system.POST("/appUninstall", uninstallSystemAppHandler)
		system.POST("/appDefaultConfig", getSystemAppDefaultConfigHandler)
		system.POST("/appInstallFromGuide", installSystemAppFromGuideHandler)
	}
}
