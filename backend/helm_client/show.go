package helm_client

import "helm.sh/helm/v3/pkg/action"

type ShowOptions struct {
	ChartString string `json:"chart_string"`
	Version     string `json:"version"`
}

func (c *baseClient) showValues(o *ShowOptions) (string, error) {
	client := action.NewShowWithConfig(action.ShowValues, c.cfg)
	client.Version = o.Version
	if client.Version == "" && client.Devel {
		client.Version = ">0.0.0-0"
	}

	cp, err := client.LocateChart(o.ChartString, c.settings)
	if err != nil {
		return "", err
	}
	return client.Run(cp)
}
