package main

import "os"

const OpenYurtRepoName = "openyurt"
const OpenYurtRepoURL = "https://openyurtio.github.io/openyurt-helm"
const OpenYurtNamespace = "kube-system"
const EnableOldNamesEnv = "ENABLE_OLD_APPS"

// Required: Indicates whether the component is forced to be checked during installation guidance.
type OpenYurtAppInfo struct {
	Name     string `json:"name"`
	Required bool   `json:"required"`
	Desc     string `json:"desc"`
}

// A collection of components that provide complete control, including installation, uninstallation, and upgrades
var FullySupportedOpenYurtApps = []OpenYurtAppInfo{
	{
		"yurt-manager", 
		true, 
		"Yurt-Manager 组件由多个控制器和 webhook 组成，用于确保 Kubernetes 在云边协同场景下像在正常数据中心一样工作，例如轻松管理多区域工作负载，为边缘工作负载（DaemonSet 和静态 Pod）提供 AdvancedRollingUpdate 和 OTA 升级等功能。 建议将 Yurt-Manager 组件与 Kubernetes 控制平面组件（如 Kube-Controller-Manager）共同定位。Yurt-Manager 作为一个 Deployment 部署，通常包括两个实例，一个master和一个slave。",
	},
	{
		"yurt-coordinator", 
		false, 
		`Yurt-Coordinator可以为边缘节点池提供以下功能：
1. 缘节点心跳代理
2. 节点池维度资源的缓存和复用`,
	},
	{
		"yurthub", 
		true, 
		`YurtHub 作为 OpenYurt 中的一个重要组件，在云边场景下为边缘侧提供了许多扩展能力:
1. 边缘自治
2. 流量闭环
3. Pod 无缝迁移
4. 多云端地址支持
5. 节点证书管理`,
	},
	{
		"raven-agent", 
		false, 
		`在边缘计算中，边-边和边-云通信是常见的网络通信场景，在OpenYurt中，我们开发了Raven项目提供边-边、边-云容器网络与主机网络通信的解决方案。 在OpenYurt集群中，位于不同物理区域的Pod可能需要使用Pod IP、Service IP 或Service name与其他Pod通信，虽然这些Pod位于单个K8s集群中，但它们处于不同物理区域（网络域）中，无法直接通信。因此，Raven项目被开发来解决这一问题。
Raven Agent以DaemonSet的方式部署，运行在集群的每一个节点，它根据每个节点的角色（gateway or non-gateway）在节点上配置路由信息或VPN隧道信息。`,
	},
}

// A collection of components that only provide uninstallation
var notFullySupportedOpenYurtAppNames = []string{
	"openyurt",
	"pool-coordinator",
	"yurt-app-manager",
	"yurt-controller-manager",
	"raven-controller-manager",
}

func getNotFullySupportedOpenYurtNames() []string {
	return notFullySupportedOpenYurtAppNames
}

func getFullySupportedOpenYurtNames() []string {
	var names []string
	for _, one := range FullySupportedOpenYurtApps {
		names = append(names, one.Name)
	}
	return names
}

func getAllOpenYurtNames() []string {
	res := getFullySupportedOpenYurtNames()
	if os.Getenv(EnableOldNamesEnv) == "yes" {
		res = append(res, getNotFullySupportedOpenYurtNames()...)
	}
	return res
}
