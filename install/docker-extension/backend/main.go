package main

import (
	"flag"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
)

var logger = logrus.New()

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest-services/backend.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logger.SetOutput(os.Stdout)

	logMiddleware := middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper: middleware.DefaultSkipper,
		Format: `{"time":"${time_rfc3339_nano}","id":"${id}",` +
			`"method":"${method}","uri":"${uri}",` +
			`"status":${status},"error":"${error}"` +
			`}` + "\n",
		CustomTimeFormat: "2006-01-02 15:04:05.00000",
		Output:           logger.Writer(),
	})

	logger.Infof("Starting listening on %s\n", socketPath)
	router := echo.New()
	router.HideBanner = true
	router.Use(logMiddleware)
	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		logger.Fatal(err)
	}
	router.Listener = ln

	router.GET("/hello", hello)
	router.GET("/services/status", getServicesStatus)

	logger.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func hello(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "hello"})
}

func getServicesStatus(ctx echo.Context) error {
	services := []Service{
		{
			ID:          "yurt-manager",
			Name:        "Yurt Manager",
			Description: "Node lifecycle & CSR management",
			Icon:        "manager",
			Status:      "healthy",
		},
		{
			ID:          "yurthub",
			Name:        "YurtHub",
			Description: "Edge-cloud communication proxy",
			Icon:        "hub",
			Status:      "healthy",
		},
		{
			ID:          "raven-agent",
			Name:        "Raven Agent",
			Description: "Cross-network connectivity",
			Icon:        "agent",
			Status:      "healthy",
		},
		{
			ID:          "kubelet",
			Name:        "Kubelet",
			Description: "Container runtime management",
			Icon:        "kubelet",
			Status:      "healthy",
		},
		{
			ID:          "kube-proxy",
			Name:        "Kube Proxy",
			Description: "Service load balancing",
			Icon:        "proxy",
			Status:      "warning",
		},
		{
			ID:          "coredns",
			Name:        "CoreDNS",
			Description: "DNS resolution service",
			Icon:        "dns",
			Status:      "healthy",
		},
		{
			ID:          "dashboard",
			Name:        "Dashboard",
			Description: "Web management interface",
			Icon:        "dashboard",
			Status:      "warning",
		},
	}
	return ctx.JSON(http.StatusOK, services)
}

type HTTPMessageBody struct {
	Message string
}

type Service struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Status      string `json:"status"`
}
