package main

import (
	"os"
	"strings"
	client "yurt_console_backend/k8s_client"

	"github.com/gin-gonic/gin"
)

const showGuidePageEnv = "SHOW_GUIDE_PAGE"
const experienceCenterEnv = "EXPERIENCE_CENTER_MODE"

func guideComplete(c *gin.Context) {
	res := &struct {
		UserInfo client.User `json:"user_info"`
	}{}
	fillAdminUserInfo(&res.UserInfo)

	logger.Info("admin", "guide complete")
	JSONSuccessWithData(c, "", res)
}

type OpenYurtAppInfo struct {
	Name     string `json:"name"`
	Required bool   `json:"required"`
}

type guideInfo struct {
	OpenYurtAppList []OpenYurtAppInfo `json:"openyurt_apps"`
}

func isGuideFinish() bool {
	ShowGuideMode := strings.ToLower(os.Getenv(showGuidePageEnv))
	switch ShowGuideMode {
	case "", "necessary":
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

	OpenYurtAppsName := getFullySupportedOpenYurtNames()
	RequiredOpenYurtAppsName := getRequiredOpenYurtNames()
	for _, n := range OpenYurtAppsName {
		var info OpenYurtAppInfo
		info.Name = n
		for _, rn := range RequiredOpenYurtAppsName {
			if rn == n {
				info.Required = true
				break
			}
		}
		res.OpenYurtAppList = append(res.OpenYurtAppList, info)
	}

	return res
}

func checkNeedGuidance() bool {
	// Get nodepool data to test if openyurt is deployed. Activate guidance if data fetch fails.
	_, err := client.GetRawNodepool(adminKubeConfig, "")
	return err != nil
}

func checkConnectivity(c *gin.Context) {
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
