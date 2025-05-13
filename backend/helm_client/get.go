package helm_client

import (
	"helm.sh/helm/v3/pkg/action"
	"sigs.k8s.io/yaml"
)

type GetOptions struct {
	ReleaseName   string `json:"release_name"`
	ShowAllValues bool   `json:"show_all"` // values: -a --all
}

func (c *baseClient) getValues(o *GetOptions) (string, error) {
	// helm get values
	client := action.NewGetValues(c.cfg)
	client.AllValues = o.ShowAllValues

	res, err := client.Run(o.ReleaseName)
	if err != nil {
		return "", err
	}

	raw, err := yaml.Marshal(res)
	if err != nil {
		return "", err
	}
	return string(raw), nil
}
