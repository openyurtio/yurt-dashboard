package helm_client

import (
	"helm.sh/helm/v3/pkg/action"
)

func uninstall(cfg *action.Configuration, releaseName string) error {
	client := action.NewUninstall(cfg)

	_, err := client.Run(releaseName)
	// ToDo info fmt.Println("Successfully removed release: ", res.Release.Name)
	return err
}
