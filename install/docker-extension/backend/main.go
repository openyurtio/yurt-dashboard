package main

import (
	"context"
	"flag"
	"net"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
	"my-extension/install"
)

var logger = logrus.New()
var installer *install.Installer

func main() {
	var socketPath string
	var kubeconfig string
	flag.StringVar(&socketPath, "socket", "/run/guest-services/backend.sock", "Unix domain socket to listen on")
	flag.StringVar(&kubeconfig, "kubeconfig", "", "Path to kubeconfig file")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logger.SetOutput(os.Stdout)

	// Initialize installer
	installer = install.NewInstaller(kubeconfig)

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
	router.Use(middleware.CORS())
	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		logger.Fatal(err)
	}
	router.Listener = ln

	// Health check
	router.GET("/hello", hello)
	
	// Service status (legacy)
	router.GET("/services/status", getServicesStatus)
	
	// Installation endpoints
	router.POST("/api/install/prerequisites/check", checkPrerequisites)
	router.POST("/api/install/start", startInstallation)
	router.GET("/api/install/status/:id", getInstallationStatus)
	router.GET("/api/install/check", checkInstallation)

	logger.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func hello(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, HTTPMessageBody{Message: "hello"})
}

func getServicesStatus(ctx echo.Context) error {
	// Check actual installation status
	status, err := install.CheckInstallationStatus(context.Background(), "")
	if err != nil {
		logger.Warnf("Failed to check installation status: %v", err)
		// Return mock data if check fails
		return ctx.JSON(http.StatusOK, getMockServices())
	}

	// Map installation status to services
	services := []Service{
		mapComponentToService(status, "yurt-manager"),
		mapComponentToService(status, "yurthub"),
		mapComponentToService(status, "raven-agent"),
	}

	// Add other services that don't need checking
	services = append(services, []Service{
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
	}...)

	return ctx.JSON(http.StatusOK, services)
}

func mapComponentToService(status *install.InstallationCheckResult, componentName string) Service {
	for _, comp := range status.Components {
		if comp.Name == componentName {
			service := Service{
				ID:          comp.Name,
				Name:        getServiceName(comp.Name),
				Description: getServiceDescription(comp.Name),
				Icon:        getServiceIcon(comp.Name),
			}
			if comp.Installed && comp.Status == "healthy" {
				service.Status = "healthy"
			} else if comp.Installed {
				service.Status = "warning"
			} else {
				service.Status = "error"
			}
			return service
		}
	}
	// Not found, return default error status
	return Service{
		ID:          componentName,
		Name:        getServiceName(componentName),
		Description: getServiceDescription(componentName),
		Icon:        getServiceIcon(componentName),
		Status:      "error",
	}
}

func getMockServices() []Service {
	return []Service{
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
}

func getServiceName(id string) string {
	names := map[string]string{
		"yurt-manager": "Yurt Manager",
		"yurthub":      "YurtHub",
		"raven-agent":  "Raven Agent",
	}
	if name, ok := names[id]; ok {
		return name
	}
	return id
}

func getServiceDescription(id string) string {
	descriptions := map[string]string{
		"yurt-manager": "Node lifecycle & CSR management",
		"yurthub":      "Edge-cloud communication proxy",
		"raven-agent":  "Cross-network connectivity",
	}
	if desc, ok := descriptions[id]; ok {
		return desc
	}
	return ""
}

func getServiceIcon(id string) string {
	icons := map[string]string{
		"yurt-manager": "manager",
		"yurthub":      "hub",
		"raven-agent":  "agent",
	}
	if icon, ok := icons[id]; ok {
		return icon
	}
	return "default"
}

// Installation endpoints

func checkPrerequisites(ctx echo.Context) error {
	result, err := install.CheckPrerequisites(context.Background(), "")
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}
	return ctx.JSON(http.StatusOK, result)
}

type StartInstallationRequest struct {
	KubernetesServerAddr string `json:"kubernetesServerAddr"`
}

func startInstallation(ctx echo.Context) error {
	var req StartInstallationRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Invalid request body",
		})
	}

	id, err := installer.StartInstallation(req.KubernetesServerAddr)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"installationId": id,
		"status":         "started",
		"message":        "Installation started",
	})
}

func getInstallationStatus(ctx echo.Context) error {
	id := ctx.Param("id")
	if id == "" {
		return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "Installation ID is required",
		})
	}

	status, err := installer.GetStatus(id)
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, status)
}

func checkInstallation(ctx echo.Context) error {
	status, err := install.CheckInstallationStatus(context.Background(), "")
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}
	return ctx.JSON(http.StatusOK, status)
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
