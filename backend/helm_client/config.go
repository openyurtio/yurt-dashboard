package helm_client

import (
	"os"
	"path/filepath"

	"helm.sh/helm/v3/pkg/cli"
	"helm.sh/helm/v3/pkg/helmpath"
)

const HelmUserAgent = "Helm/v3.11"

const RootHelmEnvVar = "HELM_ROOT_HOME"
const HelmDriverEnv = "HELM_DRIVER"
const RootHelmPath = "/openyurt/helm/"
const KubeConfigPath = "../config/kubeconfig.conf"

var helmKubeConfig = getKubeConfigString(KubeConfigPath)

func initEnvPath() {
	rootPath := os.Getenv(RootHelmEnvVar)
	if rootPath == "" {
		rootPath = RootHelmPath
	}
	if _, err := os.Stat(rootPath); os.IsNotExist(err) {
		os.MkdirAll(rootPath, os.ModePerm)
	}

	checkAndSetPath(helmpath.DataHomeEnvVar, filepath.Join(rootPath, "data"))
	checkAndSetPath(helmpath.ConfigHomeEnvVar, filepath.Join(rootPath, "config"))
	checkAndSetPath(helmpath.CacheHomeEnvVar, filepath.Join(rootPath, "cache"))
}

func createSettings() *cli.EnvSettings {
	initEnvPath()
	return cli.New()
}
