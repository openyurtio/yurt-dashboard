package helm_client

import (
	"helm.sh/helm/v3/pkg/action"
)

type UninstallOptions struct {
	Namespace string   `json:"namespace"`
	Names     []string `json:"names"`
}

func (c *baseClient) uninstall(o *UninstallOptions) error {
	client := action.NewUninstall(c.cfg)

	for i := 0; i < len(o.Names); i++ {
		_, err := client.Run(o.Names[i])
		if err != nil {
			return err
		}
	}
	return nil
}
