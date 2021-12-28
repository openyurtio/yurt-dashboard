package main

import (
	"bytes"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func getUserInfoFromParas(c *gin.Context) (kubeConfig, namespace string, err error) {
	requestParas := &User{}

	// request body format not allowed
	if err := c.BindJSON(requestParas); err != nil {
		logger.Debug(fmt.Sprintf("fail to parse HTTP paras into User struct: %v", err))
		return "", "", fmt.Errorf("parse Paras Error: %w", err)
	}

	return requestParas.KubeConfig, requestParas.Namespace, nil
}

type K8sRequest func(string, string) ([]byte, error)

// use original k8s request results to construct HTTP resp
func proxyRequest(c *gin.Context, fn K8sRequest) {

	kubeConfig, namespace, err := getUserInfoFromParas(c)
	if err != nil {
		logger.Warn(c.ClientIP(), "parse request paras failed", err.Error())
		JSONErr(c, http.StatusBadRequest, err.Error())
		return
	}

	// use k8s apiserver's raw resp body as proxy server resp body
	resBody, err := fn(kubeConfig, namespace)
	if err != nil {
		logger.Warn(namespace, "get resource list fail", err.Error())
		JSONErr(c, http.StatusServiceUnavailable, err.Error())
		return
	}

	logger.Info(namespace, "get resource list successfully")
	// assert content-type is "application/json" for client requst
	c.DataFromReader(http.StatusOK, int64(len(resBody)), "application/json", bytes.NewReader(resBody), nil)
}

func JSONErr(c *gin.Context, code int, msg string) {
	c.JSON(code, gin.H{
		"msg":    msg,
		"status": false,
	})
}

func JSONSuccess(c *gin.Context, msg string) {
	c.JSON(http.StatusOK, gin.H{
		"msg":    msg,
		"status": true,
	})
}

func int32Ptr(i int32) *int32 { return &i }

func getAppServiceName(appName string) string {
	return fmt.Sprintf("%s-service", strings.ToLower(appName))
}
