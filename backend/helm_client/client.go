package helm_client

import (
	"fmt"
	"log"

	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/cli"
)

type baseClient struct {
	namespace string
	settings  *cli.EnvSettings
	cfg       *action.Configuration
}

func (c *baseClient) InitClient(namespace string) error {
	c.namespace = namespace
	c.settings = createSettings()
	err := c.createActionConfig()
	if err != nil {
		return fmt.Errorf("init helm client fail: %v", err)
	}
	return nil
}

func (c *baseClient) NewRESTClientGetter() *SimpleHelmRESTClientGetter {
	return &SimpleHelmRESTClientGetter{
		Namespace:  c.namespace,
		KubeConfig: helmKubeConfig,
		BurstLimit: c.settings.BurstLimit,
	}
}

func (c *baseClient) debug(format string, v ...interface{}) {
	if c.settings.Debug {
		format = fmt.Sprintf("[debug] %s\n", format)
		log.Output(2, fmt.Sprintf(format, v...))
	}
}

func (c *baseClient) createActionConfig() error {
	c.settings.SetNamespace(c.namespace)
	cfg := new(action.Configuration)
	restClientGetter := c.NewRESTClientGetter()

	if err := cfg.Init(restClientGetter, c.namespace, "", c.debug); err != nil {
		return err
	}

	c.cfg = cfg
	return nil
}

func (c *baseClient) getAllEnv() map[string]string {
	return c.settings.EnvVars()
}
