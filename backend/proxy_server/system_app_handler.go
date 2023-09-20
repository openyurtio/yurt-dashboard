package main

import (
	"fmt"
	"net/http"
	"strings"
	helm_client "yurt_console_backend/helm_client"

	"github.com/gin-gonic/gin"
)

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

func checkAndAddSystemAppRepo(updateRepo bool) error {
	return helm_client.RepoAdd(&helm_client.RepoAddOptions{
		Name:              OpenYurtRepoName,
		URL:               OpenYurtRepoURL,
		NoRepoExsitsError: true,
		UpdateWhenExsits:  updateRepo,
	})
}

func checkHasName(names []string, name string) bool {
	hasName := false
	for _, n := range names {
		if n == name {
			hasName = true
			break
		}
	}
	return hasName
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

func fetchRepoPackagesInfo(packages *[]packageInfo) {
	fetchFakePackageInfo(packages)

	res, err := helm_client.SearchRepo(&helm_client.RepoSearchOptions{
		RepoNames: []string{OpenYurtRepoName},
	})
	if err != nil {
		// return the fake info
		return
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
}

func fetchInstalledPackagesInfo(packages *[]packageInfo) error {
	chartNames := getAllOpenYurtNames()
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
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
	fetchRepoPackagesInfo(&packages)

	err := fetchInstalledPackagesInfo(&packages)
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

	if !checkHasName(getFullySupportedOpenYurtNames(), requestParas.ChartName) {
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

func installSystemAppFromGuideHandler(c *gin.Context) {
	requestParas := &struct {
		AppsName []string `json:"apps_name"`
	}{}

	if err := c.BindJSON(requestParas); err != nil {
		logger.Error(c.ClientIP(), "installSystemAppFromGuideHandler, fail to parse request parameter:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppFromGuideHandler: parse parameters fail: %v", err))
		return
	}

	if err := checkAndAddSystemAppRepo(false); err != nil {
		logger.Error(c.ClientIP(), "installSystemAppFromGuideHandler, fail to init openyurt repo:", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppFromGuideHandler: fail to init openyurt repo: %v", err))
		return
	}

	supportedNames := getFullySupportedOpenYurtNames()
	for _, n := range requestParas.AppsName {
		if !checkHasName(supportedNames, n) {
			logger.Error(c.ClientIP(), "installSystemAppFromGuideHandler, not openyurt app:", n)
			JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppFromGuideHandler: not openyurt app: %s", n))
			return
		}
	}

	res, err := helm_client.List(&helm_client.ListReleaseOptions{
		FilterChartName: strings.Join(requestParas.AppsName, "|"),
		ShowOptions: helm_client.ListShowOptions{
			ShowDeployed: true,
			ShowPending:  true,
		},
	})
	if err != nil {
		logger.Error(c.ClientIP(), "installSystemAppFromGuideHandler, fail to connect cluster", err.Error())
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppFromGuideHandler: fail to connect cluster, err:%v", err))
		return
	}
	var installedApps []string
	for _, one := range res.ReleaseElements {
		installedApps = append(installedApps, one.ChartName)
	}

	for _, n := range requestParas.AppsName {
		if checkHasName(installedApps, n) {
			continue
		}
		err := helm_client.Install(&helm_client.InstallOptions{
			Namespace:   OpenYurtNamespace,
			ReleaseName: n,
			ChartString: OpenYurtRepoName + "/" + n,
		})
		if err != nil {
			logger.Error(c.ClientIP(), fmt.Sprintf("installSystemAppFromGuideHandler, fail to install app:%v", n), err.Error())
			JSONErr(c, http.StatusBadRequest, fmt.Sprintf("installSystemAppFromGuideHandler: fail to install app:%v, err:%v", n, err))
			return
		}
	}

	logger.Info("", fmt.Sprintf("install openyurt app %s from guide successsfully", strings.Join(requestParas.AppsName, ",")))
	JSONSuccess(c, fmt.Sprint(strings.Join(requestParas.AppsName, ",")))
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

	if !checkHasName(getAllOpenYurtNames(), requestParas.ChartName) {
		logger.Error(c.ClientIP(), "uninstallSystemAppHandler, not openyurt app:", requestParas.ChartName)
		JSONErr(c, http.StatusBadRequest, fmt.Sprintf("uninstallSystemAppHandler: not openyurt app: %s", requestParas.ChartName))
		return
	}

	// Find release by chart name, compatible with system apps installed by other means
	res, err := helm_client.List(&helm_client.ListReleaseOptions{
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

	if !checkHasName(getFullySupportedOpenYurtNames(), requestParas.ChartName) {
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
