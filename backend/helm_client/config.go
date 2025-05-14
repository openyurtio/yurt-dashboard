package helm_client

import (
	"log"
	"os"
	"path/filepath"

	"helm.sh/helm/v3/pkg/cli"
	"helm.sh/helm/v3/pkg/helmpath"
	"helm.sh/helm/v3/pkg/kube"
)

const HelmUserAgent = "Helm/v3.11"

const RootHelmEnvVar = "HELM_ROOT_HOME"
const HelmDriverEnvVar = "HELM_DRIVER"
const RootHelmPath = "/openyurt/helm/"
const KubeConfigPath = "../config/kubeconfig.conf"

var helmKubeConfig = getKubeConfigString(KubeConfigPath)

func initEnvPath() {
	// Set the storage path of local data of the helm client
	rootPath := os.Getenv(RootHelmEnvVar)
	if rootPath == "" {
		rootPath = RootHelmPath
	}
	if _, err := os.Stat(rootPath); os.IsNotExist(err) {
		if err := os.MkdirAll(rootPath, os.ModePerm); err != nil {
			log.Printf("Failed to create directory %s: %v", rootPath, err)
		}
	}

	checkAndSetPath(helmpath.DataHomeEnvVar, filepath.Join(rootPath, "data"))
	checkAndSetPath(helmpath.ConfigHomeEnvVar, filepath.Join(rootPath, "config"))
	checkAndSetPath(helmpath.CacheHomeEnvVar, filepath.Join(rootPath, "cache"))
}

func createSettings() *cli.EnvSettings {
	kube.ManagedFieldsManager = "helm"
	initEnvPath()
	return cli.New()
}
