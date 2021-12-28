/*
 resource_handler.go contains resource CRUD APIs
*/

package main

import (
	"bytes"
	"fmt"
	"net/http"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
)

func getNodeHandler(c *gin.Context) {
	proxyRequest(c, client.GetRawNode)
}

func getDeploymentHandler(c *gin.Context) {
	proxyRequest(c, client.GetRawDeployment)
}

func getStatefulsetHandler(c *gin.Context) {
	proxyRequest(c, client.GetRawStatefulset)
}

func getJobHandler(c *gin.Context) {
	proxyRequest(c, client.GetRawJob)
}

func getNodepoolHandler(c *gin.Context) {
	proxyRequest(c, client.GetRawNodepool)
}

func getPodHandler(c *gin.Context) {
	proxyRequest(c, client.GetRawPod)
}

func getClusterOverviewHandler(c *gin.Context) {

	kubeConfig, namespace, err := getUserInfoFromParas(c)
	if err != nil {
		logger.Warn(c.ClientIP(), "fail to parse request parameter", err.Error())
		JSONErr(c, http.StatusBadRequest, err.Error())
	}

	clusterStatus, err := client.GetClusterOverview(kubeConfig, namespace)
	if err != nil {
		logger.Warn(namespace, "fail to get cluster overview", err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	logger.Info(namespace, "get cluster overview successfully")
	c.JSON(http.StatusOK, clusterStatus)

}

func setNodeAutonomyHandler(c *gin.Context) {
	requestParas := &struct {
		User
		NodeName string
		Autonomy string
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "fail to parse request parameter", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("setNodeAutonomy: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	resBody, err := client.PatchNode(requestParas.KubeConfig,
		requestParas.NodeName, map[string]interface{}{"metadata": map[string]map[string]string{"annotations": {
			"node.beta.openyurt.io/autonomy": requestParas.Autonomy,
		}}})
	if err != nil {
		logger.Warn(requestParas.Namespace, fmt.Sprintf("fail to patch node %s with autonomy annotation", requestParas.NodeName), err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	logger.Info(requestParas.Namespace, "set node autonomy successfully")
	// assert content-type is "application/json" for client requst
	c.DataFromReader(http.StatusOK, int64(len(resBody)), "application/json", bytes.NewReader(resBody), nil)
}

// "App" is a concept from Lab Page.
// An App contains one or more Deploys and  Services if enabled

func getAppHandler(c *gin.Context) {
	kubeConfig, namespace, err := getUserInfoFromParas(c)

	if err != nil {
		logger.Warn(c.ClientIP(), "fail to parse request parameter", err.Error())
		JSONErr(c, http.StatusBadRequest, err.Error())
		return
	}

	dpList, err := client.GetDeployment(kubeConfig, namespace)
	if err != nil {
		logger.Warn(namespace, "get deployment list fail", err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	svcList, err := client.GetService(kubeConfig, namespace)
	if err != nil {
		logger.Warn(namespace, "get service list fail", err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	appList := []*struct {
		App        string
		Deployment *appsv1.Deployment
		Service    *corev1.Service
	}{{App: "RSSHub"}, {App: "WordPress"}, {App: "EdgeXFoundry"}}

	// for each app
	for _, app := range appList {
		// find if its corresponding deployment exist
		for _, dp := range dpList.Items {
			if dp.Labels["app"] == app.App && dp.Labels["type"] == "lab" {
				app.Deployment = &dp
				break
			}
		}
		// find if its corresponding service exist
		for _, svc := range svcList.Items {
			if svc.Labels["app"] == app.App && svc.Labels["type"] == "lab" {
				app.Service = &svc
				break
			}
		}
	}

	logger.Info(namespace, "get app list successfully")
	c.JSON(http.StatusOK, appList)

}

func installAppHandler(c *gin.Context) {
	requestParas := &struct {
		User
		DeploymentName string
		App            string
		Service        bool
		Replicas       int
		Port           int
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("createDeployment: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	var deployment interface{}
	var targetPort int
	switch requestParas.App {
	case "RSSHub":
		deployment = getRsshubDeploymentConfig(requestParas.DeploymentName, requestParas.Namespace, requestParas.Replicas)
		targetPort = 1200
	case "WordPress":
		// prepare mysql service in advance
		// #todo, this will be refactored when create resource from yaml interface has been prepared
		err := client.CreateDeployment(requestParas.KubeConfig, requestParas.Namespace, getWordPressMysqlDeployConfig(requestParas.Namespace))
		if err != nil {
			logger.Debug(fmt.Sprintf("install WordPress prepare: create MySQL Deployment fail, %s", err.Error()))
		}
		err = client.CreateService(requestParas.KubeConfig, requestParas.Namespace, getServiceConfig(wordpress_mysql_delpoy_name, requestParas.Namespace, 3306, 3306))
		if err != nil {
			logger.Debug(fmt.Sprintf("install WordPress prepare: create MySQL Service fail, %s", err.Error()))
		}
		deployment = getWordPressDeploymentConfig(requestParas.DeploymentName, requestParas.Namespace, requestParas.Replicas)
		targetPort = 80
	case "EdgeXFoundry":
	default:
		JSONErr(c, http.StatusBadRequest, "Unknown APP type")
		logger.Warn(requestParas.Namespace, fmt.Sprintf("install App %s failed", requestParas.App), "Unsupported App name")
		return
	}

	err := client.CreateDeployment(requestParas.KubeConfig, requestParas.Namespace, deployment)
	if err != nil {
		logger.Warn(requestParas.Namespace, fmt.Sprintf("create %s app deployment fail", requestParas.App), err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	// if has service options has been set
	if requestParas.Service {
		service := getServiceConfig(requestParas.App, requestParas.Namespace, requestParas.Port, targetPort)
		err = client.CreateService(requestParas.KubeConfig, requestParas.Namespace, service)
		if err != nil {
			logger.Warn(requestParas.Namespace, fmt.Sprintf("create %s app service fail", requestParas.App), err.Error())
			JSONErr(c, http.StatusServiceUnavailable, err.Error())
			err := client.DeleteDeployment(requestParas.KubeConfig, requestParas.Namespace, requestParas.DeploymentName)
			if err != nil {
				logger.Debug(fmt.Sprintf("install app %s post: delete deploy fail, %s", requestParas.App, err.Error()))
			}
			return
		}
	}

	logger.Info(requestParas.Namespace, fmt.Sprintf("install app %s successsfully", requestParas.App))
	JSONSuccess(c, fmt.Sprintf("install app %s successsfully", requestParas.App))
}

func uninstallAppHandler(c *gin.Context) {
	requestParas := &struct {
		User
		DeploymentName string
		App            string
		Service        bool
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Warn(c.ClientIP(), "parse request paras fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("createDeployment: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	// remove supporting mysql deploy&service, if app is WordPress
	if requestParas.App == "WordPress" {
		err := client.DeleteDeployment(requestParas.KubeConfig, requestParas.Namespace, wordpress_mysql_delpoy_name)
		if err != nil {
			logger.Debug(fmt.Sprintf("uninstall WordPress prepare: delete MySQL Deploy fail, %s", err.Error()))
		}
		err = client.DeleteService(requestParas.KubeConfig, requestParas.Namespace, getAppServiceName(wordpress_mysql_delpoy_name))
		if err != nil {
			logger.Debug(fmt.Sprintf("uninstall WordPress prepare: delete MySQL Service fail, %s", err.Error()))
		}
	}

	// delete app's deployment
	err := client.DeleteDeployment(requestParas.KubeConfig, requestParas.Namespace, requestParas.DeploymentName)
	if err != nil {
		logger.Warn(requestParas.Namespace, "delete deployment fail", err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	// if this app has a service, delete it
	if requestParas.Service {
		err = client.DeleteService(requestParas.KubeConfig, requestParas.Namespace, getAppServiceName(requestParas.App))
		if err != nil {
			logger.Warn(requestParas.Namespace, "delete service fail", err.Error())
			JSONErr(c, http.StatusServiceUnavailable, err.Error())
			return
		}
	}

	logger.Info(requestParas.Namespace, fmt.Sprintf("uninstall app %s successsfully", requestParas.App))
	JSONSuccess(c, fmt.Sprintf("uninstall app %s successsfully", requestParas.App))

}
