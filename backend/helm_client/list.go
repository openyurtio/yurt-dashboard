package helm_client

import (
	"regexp"
	"strconv"

	"helm.sh/helm/v3/pkg/action"
)

type ListReleaseRsp struct {
	ReleaseElements []ReleaseElement `json:"release_elements"`
}

type ReleaseElement struct {
	Name        string `json:"name"`
	ChartName   string `json:"chart_name"`
	Description string `json:"description"`
	Namespace   string `json:"namespace"`
	Revision    string `json:"revision"`
	Status      string `json:"status"`
	Version     string `json:"version"`
	AppVersion  string `json:"app_version"`
}

type ListShowOptions struct {
	ShowAll          bool `json:"all"`          // -a, --all
	ShowDeployed     bool `json:"deployed"`     // --deployed
	ShowFailed       bool `json:"failed"`       // --failed
	ShowPending      bool `json:"pending"`      // --pending
	ShowUninstalling bool `json:"uninstalling"` // --uninstalling
	ShowUninstalled  bool `json:"uninstalled"`  // --uninstalled
}

type ListReleaseOptions struct {
	Namespace       string          `json:"namespace"`
	FilterName      string          `json:"filter_name"` // -f, --filter string
	FilterChartName string          `json:"filter_chart_name"`
	Limit           int             `json:"limit"`  // -m, --max int
	Offset          int             `json:"offset"` // --offset int
	ShowOptions     ListShowOptions `json:"show_options"`
}

func (c *baseClient) list(o *ListReleaseOptions) (*ListReleaseRsp, error) {
	client := action.NewList(c.cfg)
	client.Filter = o.FilterName
	client.Limit = o.Limit
	client.Offset = o.Offset
	client.All = o.ShowOptions.ShowAll
	client.Deployed = o.ShowOptions.ShowDeployed
	client.Failed = o.ShowOptions.ShowFailed
	client.Pending = o.ShowOptions.ShowPending
	client.Uninstalled = o.ShowOptions.ShowUninstalled
	client.Uninstalling = o.ShowOptions.ShowUninstalling

	client.SetStateMask()
	res, err := client.Run()
	if err != nil {
		return nil, err
	}

	var filterChartName *regexp.Regexp
	if o.FilterChartName != "" {
		var err error
		filterChartName, err = regexp.Compile(o.FilterChartName)
		if err != nil {
			return nil, err
		}
	}

	result := &ListReleaseRsp{}
	for _, one := range res {
		if filterChartName != nil && !filterChartName.MatchString(one.Chart.Name()) {
			continue
		}
		element := ReleaseElement{
			Name:        one.Name,
			ChartName:   one.Chart.Name(),
			Description: one.Chart.Metadata.Description,
			Namespace:   one.Namespace,
			Revision:    strconv.Itoa(one.Version),
			Status:      one.Info.Status.String(),
			Version:     one.Chart.Metadata.Version,
			AppVersion:  one.Chart.AppVersion(),
		}

		result.ReleaseElements = append(result.ReleaseElements, element)
	}
	return result, nil
}
