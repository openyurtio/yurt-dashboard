package helm_client

import (
	"fmt"

	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/cli"
)

type baseClient struct {
	settings *cli.EnvSettings
	cfg      *action.Configuration
}

func (c *baseClient) InitClient(namespace string) error {
	c.settings = createSettings()
	cfg, err := c.createActionConfig(namespace)
	if err != nil {
		return fmt.Errorf("init helm client fail: %v", err)
	}
	c.cfg = cfg
	return nil
}
