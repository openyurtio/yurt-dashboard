package helm_client

import (
	"fmt"
	"strconv"

	"helm.sh/helm/v3/pkg/action"
)

type ListReleaseRsp struct {
	ReleaseElements []ReleaseElement `json:"release_elements"`
}

type ReleaseElement struct {
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
	Revision   string `json:"revision"`
	Status     string `json:"status"`
	Chart      string `json:"chart"`
	AppVersion string `json:"app_version"`
}

func list(cfg *action.Configuration) (*ListReleaseRsp, error) {
	client := action.NewList(cfg)

	res, err := client.Run()
	if err != nil {
		return nil, err
	}

	result := &ListReleaseRsp{}
	for _, one := range res {
		element := ReleaseElement{
			Name:       one.Name,
			Namespace:  one.Namespace,
			Revision:   strconv.Itoa(one.Version),
			Status:     one.Info.Status.String(),
			Chart:      fmt.Sprintf("%s-%s", one.Chart.Name(), one.Chart.Metadata.Version),
			AppVersion: one.Chart.AppVersion(),
		}

		result.ReleaseElements = append(result.ReleaseElements, element)
	}
	return result, nil
}
