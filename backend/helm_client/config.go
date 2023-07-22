package helm_client

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/cli"
	"helm.sh/helm/v3/pkg/helmpath"
)

var settings = createSettings()

const RootHelmEnvVar = "HELM_ROOT_HOME"

func checkAndSetPath(helmEnvVar string, setValue string) {
	if os.Getenv(helmEnvVar) == "" {
		os.Setenv(helmEnvVar, setValue)
	}
}

func initEnvPath() {
	rootPath := os.Getenv(RootHelmEnvVar)
	if rootPath == "" {
		rootPath = "/"
	}
	checkAndSetPath(helmpath.DataHomeEnvVar, filepath.Join(rootPath, "data"))
	checkAndSetPath(helmpath.ConfigHomeEnvVar, filepath.Join(rootPath, "config"))
	checkAndSetPath(helmpath.CacheHomeEnvVar, filepath.Join(rootPath, "cache"))
}

func createSettings() *cli.EnvSettings {
	initEnvPath()

	newsettings := cli.New()
	// Set extra configuration
	newsettings.KubeConfig = helmpath.ConfigPath("kubeconfig")

	return newsettings
}

func debug(format string, v ...interface{}) {
	if settings.Debug {
		format = fmt.Sprintf("[debug] %s\n", format)
		log.Output(2, fmt.Sprintf(format, v...))
	}
}

func createActionConfig(namespace string) (*action.Configuration, error) {
	settings.SetNamespace(namespace)
	cfg := new(action.Configuration)

	if err := cfg.Init(settings.RESTClientGetter(), settings.Namespace(), "", debug); err != nil {
		return nil, err
	}
	return cfg, nil
}

func getAllEnv() map[string]string {
	return settings.EnvVars()
}
