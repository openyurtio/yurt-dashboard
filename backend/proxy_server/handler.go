package main

import (
	"net/http"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
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

	kubeConfig, namespace, err := parseParas(c)
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
