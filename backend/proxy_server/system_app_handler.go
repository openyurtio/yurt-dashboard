package main

import (
	"fmt"
	"net/http"
	"strings"
	helm_client "yurt_console_backend/helm_client"

	"github.com/gin-gonic/gin"
)

const OpenYurtRepoName = "openyurt"
const OpenYurtRepoURL = "https://openyurtio.github.io/openyurt-helm"
const OpenYurtNamespace = "kube-system"

type packageVersion struct {
	Version    string `json:"version"`
	AppVersion string `json:"app_version"`
}
type packageInfo struct {
	ChartName      string           `json:"chart_name"`
	Description    string           `json:"description"`
	PackageVersion packageVersion   `json:"version"`
	Versions       []packageVersion `json:"versions"`
	Status         string           `json:"status"`
	FullySupported bool             `json:"fully_supported"`
}

func getAllOpenYurtNames() []string {
	res := getFullySupportedOpenYurtNames()
	if true {
		res = append(res, getNotFullySupportedOpenYurtNames()...)
	}
	return res
}

func getNotFullySupportedOpenYurtNames() []string {
	// A collection of components that only provide uninstallation
	return []string{
		"openyurt",
		"pool-coordinator",
		"yurt-app-manager",
		"yurt-controller-manager",
		"raven-controller-manager",
	}
}

func getFullySupportedOpenYurtNames() []string {
	// A collection of components that provide complete control, including installation, uninstallation, and upgrades
	return []string{
		"yurt-manager",
		"yurt-coordinator",
		"yurthub",
		"raven-agent",
		//"yurt-dashboard",
	}
}

func checkAndAddSystemAppRepo(updateRepo bool) error {
	err := helm_client.RepoAdd(&helm_client.RepoAddOptions{
		Name:              OpenYurtRepoName,
		URL:               OpenYurtRepoURL,
		NoRepoExsitsError: true,
		UpdateWhenExsits:  updateRepo,
	})
	if err != nil {
		return err
	}
	return nil
}

func fetchFakePackageInfo(packages *[]packageInfo) {
	chartNames := getFullySupportedOpenYurtNames()
	for _, name := range chartNames {
		find := false
		for i := range *packages {
			if (*packages)[i].ChartName == name {
				(*packages)[i].FullySupported = true
				find = true
				break
			}
		}
		if !find {
			newPackageInfo := packageInfo{
				ChartName:      name,
				FullySupported: true,
				Status:         "fakeinfo",
			}
			*packages = append(*packages, newPackageInfo)
		}
	}
}

func fetchRepoPackagesInfo(packages *[]packageInfo) error {
	fetchFakePackageInfo(packages)

	res, err := helm_client.SearchRepo(&helm_client.RepoSearchOptions{
		RepoNames: []string{OpenYurtRepoName},
	})
	if err != nil {
		// return the fake info instead of error
		return nil
	}

	chartNames := getFullySupportedOpenYurtNames()
	for _, element := range res.RepoSearchElements {
		find := false
		for _, name := range chartNames {
			if element.ChartName == name {
				find = true
				break
			}
		}
		if !find {
			continue
		}

		find = false
		for i := range *packages {
			one := &(*packages)[i]
			if one.ChartName == element.ChartName {
				if one.Status == "fakeinfo" {
					one.Description = element.Description
					one.PackageVersion.Version = element.Version
					one.PackageVersion.AppVersion = element.AppVersion
					one.Status = "undeployed"
				}
				one.Versions = append(one.Versions, packageVersion{Version: element.Version, AppVersion: element.AppVersion})
				find = true
				break
			}
		}
		if !find {
			newPackageInfo := packageInfo{
				ChartName:   element.ChartName,
				Description: element.Description,
				PackageVersion: packageVersion{
					Version:    element.Version,
					AppVersion: element.AppVersion,
				},
				Versions: []packageVersion{{
					Version:    element.Version,
					AppVersion: element.AppVersion,
				}},
				Status:         "undeployed",
				FullySupported: true,
			}
			*packages = append(*packages, newPackageInfo)
		}
	}

	return nil
}

func fetchInstalledPackagesInfo(packages *[]packageInfo) error {
	chartNames := getAllOpenYurtNames()
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
		AllNamespaces:   true,
		FilterChartName: strings.Join(chartNames, "|"),
		ShowOptions: helm_client.ListShowOptions{
			ShowDeployed:     true,
			ShowPending:      true,
			ShowUninstalling: true,
		},
	})
	if err != nil {
		return err
	}

	for _, element := range res.ReleaseElements {
		find := false
		for i := range *packages {
			one := &(*packages)[i]
			if one.ChartName == element.ChartName {
				one.Description = element.Description
				one.PackageVersion.Version = element.Version
				one.PackageVersion.AppVersion = element.AppVersion
				one.Status = element.Status
				find = true
				break
			}
		}
		if !find {
			newPackage := packageInfo{
				ChartName:   element.ChartName,
				Description: element.Description,
				PackageVersion: packageVersion{
					Version:    element.Version,
					AppVersion: element.AppVersion,
				},
				Status: element.Status,
			}
			*packages = append(*packages, newPackage)
		}
	}
	return nil
}

func getSystemAppListHandler(c *gin.Context) {
	requestParas := &struct {
		User
		UpdateRepo bool `json:"update_repo"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "getSystemAppListHandler, fail to parse request parameter", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppListHandler: parse parameters fail: %v", err))
		return
	}

	checkAndAddSystemAppRepo(requestParas.UpdateRepo)

	packages := []packageInfo{}
	err := fetchRepoPackagesInfo(&packages)
	if err != nil {
		logger.Error(c.ClientIP(), "fetch repo packages fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("fetch repo packages fail: %v", err))
		return
	}

	err = fetchInstalledPackagesInfo(&packages)
	if err != nil {
		logger.Error(c.ClientIP(), "fetch install packages fail", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("fetch install packages fail: %v", err))
		return
	}

	JSONSuccessWithData(c, "get openyurt app list successsfully", packages)
}

func installSystemAppHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ChartName  string `json:"chart_name"`
		Version    string `json:"version"`
		ConfigType string `json:"config"`
		ConfigFile string `json:"config_file"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "installSystemAppHandler, fail to parse request parameter:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppHandler: parse parameters fail: %v", err))
		return
	}

	isOpenYurtApp := false
	elements := getFullySupportedOpenYurtNames()
	for _, element := range elements {
		if element == requestParas.ChartName {
			isOpenYurtApp = true
			break
		}
	}
	if !isOpenYurtApp {
		logger.Error(c.ClientIP(), "installSystemAppHandler, not openyurt app:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppHandler: not openyurt app: %s", requestParas.ChartName))
		return
	}

	valueFile := ""
	if requestParas.ConfigType == "configFile" {
		valueFile = requestParas.ConfigFile
	}

	err := helm_client.Install(&helm_client.InstallOptions{
		Namespace:   OpenYurtNamespace,
		ReleaseName: requestParas.ChartName,
		ChartString: OpenYurtRepoName + "/" + requestParas.ChartName,
		Version:     requestParas.Version,
		ValueFile:   valueFile,
	})
	if err != nil {
		logger.Error(c.ClientIP(), "installSystemAppHandler, install failed:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppHandler: install failed: %v", err))
		return
	}

	logger.Info(requestParas.Namespace, fmt.Sprintf("install openyurt app %s successsfully", requestParas.ChartName))
	JSONSuccess(c, fmt.Sprintf("install openyurt app %s successsfully", requestParas.ChartName))
}

func uninstallSystemAppHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ChartName string `json:"chart_name"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "uninstallSystemAppHandler, fail to parse request parameter:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("uninstallSystemAppHandler: parse parameters fail: %v", err))
		return
	}

	isOpenYurtApp := false
	elements := getAllOpenYurtNames()
	for _, element := range elements {
		if element == requestParas.ChartName {
			isOpenYurtApp = true
			break
		}
	}
	if !isOpenYurtApp {
		logger.Error(c.ClientIP(), "uninstallSystemAppHandler, not openyurt app:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("uninstallSystemAppHandler: not openyurt app: %s", requestParas.ChartName))
		return
	}

	// Find release by chart name, compatible with system apps installed by other means
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
		AllNamespaces:   true,
		FilterChartName: requestParas.ChartName,
	})
	if err != nil {
		logger.Error(c.ClientIP(), "uninstallSystemAppHandler, find openyurt app fail:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("uninstallSystemAppHandler: find openyurt app fail: %s", requestParas.ChartName))
		return
	}

	// There should be only one Chart, the first one will be uninstalled
	for _, element := range res.ReleaseElements {
		if requestParas.ChartName == element.ChartName {
			if err := helm_client.Uninstall(&helm_client.UninstallOptions{
				Namespace: element.Namespace,
				Names:     []string{element.Name},
			}); err != nil {
				logger.Error(c.ClientIP(), "uninstallSystemAppHandler, uninstall openyurt app fail:", requestParas.ChartName)
				JSONErr(c, http.StatusBadRequest, fmt.Sprintf("uninstallSystemAppHandler: uninstall openyurt app fail: %s", requestParas.ChartName))
				return
			}
			break
		}
	}

	logger.Info(requestParas.Namespace, fmt.Sprintf("uinstall openyurt app %s successsfully", requestParas.ChartName))
	JSONSuccess(c, fmt.Sprintf("uinstall openyurt app %s successsfully", requestParas.ChartName))
}

func getSystemAppDefaultConfigHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ChartName string `json:"chart_name"`
		Version   string `json:"version"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "getSystemAppDefaultConfigHandler, fail to parse request parameter:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppDefaultConfigHandler: parse parameters fail: %v", err))
		return
	}

	isOpenYurtApp := false
	elements := getAllOpenYurtNames()
	for _, element := range elements {
		if element == requestParas.ChartName {
			isOpenYurtApp = true
			break
		}
	}
	if !isOpenYurtApp {
		logger.Error(c.ClientIP(), "getSystemAppDefaultConfigHandler, not openyurt app:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppDefaultConfigHandler: not openyurt app: %s", requestParas.ChartName))
		return
	}

	defConfig, err := helm_client.ShowValues(&helm_client.ShowOptions{
		ChartString: OpenYurtRepoName + "/" + requestParas.ChartName,
		Version:     requestParas.Version,
	})
	if err != nil {
		logger.Error(c.ClientIP(), "getSystemAppDefaultConfigHandler, show values error:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppDefaultConfigHandler: show values error: %s", err))
		return
	}

	JSONSuccessWithData(c, "get default config success", gin.H{"default_config": defConfig})
}

func getSystemAppCurConfigHandler(c *gin.Context) {
	requestParas := &struct {
		User
		ChartName string `json:"chart_name"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "getSystemAppCurConfigHandler, fail to parse request parameter:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppCurConfigHandler: parse parameters fail: %v", err))
		return
	}

	isOpenYurtApp := false
	elements := getAllOpenYurtNames()
	for _, element := range elements {
		if element == requestParas.ChartName {
			isOpenYurtApp = true
			break
		}
	}
	if !isOpenYurtApp {
		logger.Error(c.ClientIP(), "getSystemAppCurConfigHandler, not openyurt app:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppCurConfigHandler: not openyurt app: %s", requestParas.ChartName))
		return
	}

	// Find release by chart name, compatible with system apps installed by other means
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
		AllNamespaces:   true,
		FilterChartName: requestParas.ChartName,
	})
	if err != nil {
		logger.Error(c.ClientIP(), "getSystemAppCurConfigHandler, find openyurt app fail:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppCurConfigHandler: find openyurt app fail: %s", requestParas.ChartName))
		return
	}

	curConfig := ""
	for _, element := range res.ReleaseElements {
		if requestParas.ChartName == element.ChartName {
			res, err := helm_client.GetValues(&helm_client.GetOptions{
				ReleaseName:   element.Name,
				ShowAllValues: true,
			})
			if err != nil {
				logger.Error(c.ClientIP(), "getSystemAppCurConfigHandler, get cur values fail:", requestParas.ChartName)
				JSONErr(c, http.StatusBadRequest, fmt.Sprintf("getSystemAppCurConfigHandler: get cur values fail: %s", requestParas.ChartName))
			}
			curConfig = res
		}
	}

	JSONSuccessWithData(c, "get cur config success", gin.H{"cur_config": curConfig})
}
