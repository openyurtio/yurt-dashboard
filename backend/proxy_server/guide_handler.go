package main

import (
	"os"
	"strings"
	helm_client "yurt_console_backend/helm_client"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
)

// Empty or "auto": automatically detect whether the guide page needs to be displayed. 
// "always": Always displayed.
// "never": Never displayed.
const showGuidePageEnv = "SHOW_GUIDE_PAGE"

// "yes": experience center mode
// "no": admin mode
const experienceCenterEnv = "EXPERIENCE_CENTER_MODE"

// Handler
func guideCompleteHandler(c *gin.Context) {
	res := &struct {
		UserInfo client.User `json:"user_info"`
	}{}
	fillAdminUserInfo(&res.UserInfo)

	logger.Info("admin", "guide complete")
	JSONSuccessWithData(c, "", res)
}

func checkConnectivityHandler(c *gin.Context) {
	res := &struct {
		Result bool   `json:"result"`
		Msg    string `json:"msg"`
	}{}

	// Get node data from k8s to test cluster connectivity
	_, err := client.GetRawNode(adminKubeConfig, "")
	if err != nil {
		res.Result = false
		res.Msg = err.Error()
	} else {
		res.Result = true
	}

	JSONSuccessWithData(c, "", res)
}

// Information sent to the front-end before loading the guide page
type guideInfo struct {
	OpenYurtAppList []OpenYurtAppInfo `json:"openyurt_apps"`	// Component information used in component installation guidance
}

// Tool function
func isGuideFinish() bool {
	ShowGuideMode := strings.ToLower(os.Getenv(showGuidePageEnv))
	switch ShowGuideMode {
	case "", "auto":
		return !checkNeedGuidance()
	case "never":
		return true
	case "always":
		return false
	}
	return false
}

func getGuideInfo() guideInfo {
	var res guideInfo
	res.OpenYurtAppList = FullySupportedOpenYurtApps

	return res
}

func checkNeedGuidance() bool {
	// Check whether yurt-manager is installed. Activate guidance if not installed
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
		FilterChartName: "yurt-manager",
	})
	return err != nil || len(res.ReleaseElements) == 0
}
