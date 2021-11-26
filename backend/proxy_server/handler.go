package main

import (
	"bytes"
	"fmt"
	"net/http"
	"strings"
	"time"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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

	kubeConfig, namespace, err := parseResourceParas(c)
	if err != nil {
		JSONErr(c, http.StatusBadRequest, err.Error())
	}

	clusterStatus, err := client.GetClusterOverview(kubeConfig, namespace)
	if err != nil {
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	c.JSON(http.StatusOK, clusterStatus)

}

func loginHandler(c *gin.Context) {

	submitUser := &struct {
		MobilePhone string
		Token       string
	}{}
	if err := c.BindJSON(submitUser); err != nil {
		return // parse failed, then abort
	}

	fetchUser, err := client.GetUser(adminKubeConfig, submitUser.MobilePhone)
	if err != nil { // fetch user failed
		JSONErr(c, http.StatusInternalServerError, err.Error())
		return
	}

	// test if user token is valid
	if strings.TrimSpace(fetchUser.Spec.Token) != strings.TrimSpace(submitUser.Token) {
		JSONErr(c, http.StatusBadRequest, "username or password is invalid")
		return
	}

	c.JSON(http.StatusOK, fetchUser)
}

func registerHandler(c *gin.Context) {

	userProfile := &client.UserSpec{}
	if err := c.BindJSON(userProfile); err != nil {
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("register: parse form data fail: %v", err))
		return // parse failed, then abort
	}

	// create user obj
	err := client.CreateUser(adminKubeConfig, userProfile)
	if err != nil {
		JSONErr(c, http.StatusInternalServerError, fmt.Sprintf("register: create user fail: %v", err))
		return
	}

	// get created user and check its status
	// return only when User resources is all prepared (User.Status.EffectiveTime is not null)
	maxRetry := 30
	for i := 1; i <= maxRetry; i++ {
		createdUser, err := client.GetUser(adminKubeConfig, userProfile.Mobilephone)
		if err != nil {
			JSONErr(c, http.StatusInternalServerError, fmt.Sprintf("register: get created user fail: %v", err))
			return
		}

		// all resources has been created, return success
		if createdUser.Status.EffectiveTime != (v1.Time{}) {
			c.JSON(http.StatusOK, createdUser)
			return
		}

		time.Sleep(time.Duration(2) * time.Second)
	}

	JSONErr(c, http.StatusInternalServerError, "register: get created user fail: exceed maxretry")

}

func setNodeAutonomyHandler(c *gin.Context) {
	requestParas := &struct {
		User
		NodeName string
		Autonomy string
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("setNodeAutonomy: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	resBody, err := client.PatchNode(requestParas.KubeConfig,
		requestParas.NodeName, map[string]interface{}{"metadata": map[string]map[string]string{"annotations": {
			"node.beta.alibabacloud.com/autonomy": requestParas.Autonomy,
		}}})
	if err != nil {
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	// assert content-type is "application/json" for client requst
	c.DataFromReader(http.StatusOK, int64(len(resBody)), "application/json", bytes.NewReader(resBody), nil)
}

func getAppHandler(c *gin.Context) {
	kubeConfig, namespace, err := parseResourceParas(c)

	if err != nil {
		JSONErr(c, http.StatusBadRequest, err.Error())
		return
	}

	dpList, err := client.GetDeployment(kubeConfig, namespace)
	if err != nil {
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	svcList, err := client.GetService(kubeConfig, namespace)
	if err != nil {
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
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("createDeployment: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	var deployment interface{}
	switch requestParas.App {
	case "RSSHub":
		deployment = getRsshubDeploymentConfig(requestParas.DeploymentName, requestParas.Namespace, requestParas.Replicas)
	case "WordPress":
		deployment = getWorkPressDeploymentConfig(requestParas.DeploymentName, requestParas.Namespace, requestParas.Replicas)
	case "EdgeXFoundry":
		deployment = getTTRssDeploymentConifg(requestParas.DeploymentName, requestParas.Namespace, requestParas.Replicas)
	default:
		JSONErr(c, http.StatusBadRequest, "Unknown APP type")
		return
	}

	err := client.CreateDeployment(requestParas.KubeConfig, requestParas.Namespace, deployment)
	if err != nil {
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	// if has service options has been set
	if requestParas.Service {
		service := getServiceConfig(requestParas.App, requestParas.Namespace, requestParas.Port)
		err = client.CreateService(requestParas.KubeConfig, requestParas.Namespace, service)
		if err != nil {
			JSONErr(c, http.StatusServiceUnavailable, err.Error())
			client.DeleteDeployment(requestParas.KubeConfig, requestParas.Namespace, requestParas.DeploymentName)
			return
		}
	}

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
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("createDeployment: parse parameters fail: %v", err))
		return // parse failed, then abort
	}

	// delete app's deployment
	err := client.DeleteDeployment(requestParas.KubeConfig, requestParas.Namespace, requestParas.DeploymentName)
	if err != nil {
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	// if this app has a service, delete it
	if requestParas.Service {
		err = client.DeleteService(requestParas.KubeConfig, requestParas.Namespace, getAppServiceName(requestParas.App))
		if err != nil {
			JSONErr(c, http.StatusServiceUnavailable, err.Error())
			return
		}
	}

	JSONSuccess(c, fmt.Sprintf("uninstall app %s successsfully", requestParas.App))

}
