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

const RootHelmEnvVar = "HELM_ROOT_HOME"

func checkAndSetPath(helmEnvVar string, setValue string) {
	if os.Getenv(helmEnvVar) == "" {
		os.Setenv(helmEnvVar, setValue)
	}
}

func initEnvPath() {
	rootPath := os.Getenv(RootHelmEnvVar)
	if rootPath == "" {
		rootPath = "/helm/"
	}
	checkAndSetPath(helmpath.DataHomeEnvVar, filepath.Join(rootPath, "data"))
	checkAndSetPath(helmpath.ConfigHomeEnvVar, filepath.Join(rootPath, "config"))
	checkAndSetPath(helmpath.CacheHomeEnvVar, filepath.Join(rootPath, "cache"))
}

func createSettings() *cli.EnvSettings {
	initEnvPath()

	newsettings := cli.New()
	// Set extra configuration
	newsettings.KubeConfig, _ = filepath.Abs("../config/kubeconfig.conf")

	return newsettings
}

func (c *baseClient) debug(format string, v ...interface{}) {
	if c.settings.Debug {
		format = fmt.Sprintf("[debug] %s\n", format)
		log.Output(2, fmt.Sprintf(format, v...))
	}
}

func (c *baseClient) createActionConfig(namespace string) (*action.Configuration, error) {
	c.settings.SetNamespace(namespace)
	cfg := new(action.Configuration)

	if namespace == "" {
		if err := cfg.Init(c.settings.RESTClientGetter(), "", "", c.debug); err != nil {
			return nil, err
		}
	} else {
		if err := cfg.Init(c.settings.RESTClientGetter(), c.settings.Namespace(), "", c.debug); err != nil {
			return nil, err
		}
	}
	return cfg, nil
}

func (c *baseClient) getAllEnv() map[string]string {
	return c.settings.EnvVars()
}
