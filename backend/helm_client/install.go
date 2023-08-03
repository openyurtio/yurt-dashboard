package helm_client

import (
	"fmt"
	"time"

	"github.com/pkg/errors"
	"sigs.k8s.io/yaml"
	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/chart"
	"helm.sh/helm/v3/pkg/chart/loader"
)

type InstallOptions struct {
	Namespace   string `json:"namespace"`
	ReleaseName string `json:"release_name"`
	ChartString string `json:"chart_string"`
	Version     string `json:"version"`
	ValueFile   string `json:"value_file"`
}

func (c *baseClient) install(o *InstallOptions) error {
	client := action.NewInstall(c.cfg)
	client.ReleaseName = o.ReleaseName
	client.Namespace = c.settings.Namespace()
	client.Version = o.Version
	if client.Version == "" {
		client.Version = ">0.0.0-0"
	}

	start := time.Now()
	cp, err := client.ChartPathOptions.LocateChart(o.ChartString, c.settings)
	if err != nil {
		return err
	}
	fmt.Printf("install locateChart time:%v\n", time.Since(start))

	vals, err := MergeFileValues(o)
	if err != nil {
		return err
	}

	start = time.Now()
	chartRequested, err := loader.Load(cp)
	if err != nil {
		return err
	}
	fmt.Printf("install load chart time:%v\n", time.Since(start))

	if err := checkIfInstallable(chartRequested); err != nil {
		return err
	}

	if chartRequested.Metadata.Deprecated {
		// ToDo log warning("This chart is deprecated")
	}

	start = time.Now()
	if req := chartRequested.Metadata.Dependencies; req != nil {
		if err := action.CheckDependencies(chartRequested, req); err != nil {
			return err
		}
	}
	fmt.Printf("install check dependencies time:%v\n", time.Since(start))

	start = time.Now()
	fmt.Printf("install values:\n%v\n", vals)
	_, err = client.Run(chartRequested, vals)
	fmt.Printf("install install time:%v\n", time.Since(start))
	// ToDo log info install successful
	return err
}

func checkIfInstallable(ch *chart.Chart) error {
	switch ch.Metadata.Type {
	case "", "application":
		return nil
	}
	return errors.Errorf("%s charts are not installable", ch.Metadata.Type)
}

func mergeMaps(a, b map[string]interface{}) map[string]interface{} {
	out := make(map[string]interface{}, len(a))
	for k, v := range a {
		out[k] = v
	}
	for k, v := range b {
		if v, ok := v.(map[string]interface{}); ok {
			if bv, ok := out[k]; ok {
				if bv, ok := bv.(map[string]interface{}); ok {
					out[k] = mergeMaps(bv, v)
					continue
				}
			}
		}
		out[k] = v
	}
	return out
}

func MergeFileValues(o *InstallOptions) (map[string]interface{}, error) {
	base := map[string]interface{}{}
	if o.ValueFile != "" {
		currentMap := map[string]interface{}{}
		if err := yaml.Unmarshal([]byte(o.ValueFile), &currentMap); err != nil {
			return nil, errors.Wrapf(err, "failed to parse install value config from file")
		}
		base = mergeMaps(base, currentMap)
	}
	return base, nil
}
