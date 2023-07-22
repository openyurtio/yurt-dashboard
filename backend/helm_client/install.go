package helm_client

import (
	"github.com/pkg/errors"
	"helm.sh/helm/v3/pkg/action"
	"helm.sh/helm/v3/pkg/chart"
	"helm.sh/helm/v3/pkg/chart/loader"
)

func checkIfInstallable(ch *chart.Chart) error {
	switch ch.Metadata.Type {
	case "", "application":
		return nil
	}
	return errors.Errorf("%s charts are not installable", ch.Metadata.Type)
}

func install(cfg *action.Configuration, releaseName string, chartString string) error {
	client := action.NewInstall(cfg)
	client.ReleaseName = releaseName
	client.Namespace = settings.Namespace()

	cp, err := client.ChartPathOptions.LocateChart(chartString, settings)
	if err != nil {
		return err
	}

	chartRequested, err := loader.Load(cp)
	if err != nil {
		return err
	}

	if err := checkIfInstallable(chartRequested); err != nil {
		return err
	}

	if chartRequested.Metadata.Deprecated {
		// ToDo log warning("This chart is deprecated")
	}

	if req := chartRequested.Metadata.Dependencies; req != nil {
		if err := action.CheckDependencies(chartRequested, req); err != nil {
			return err
		}
	}

	_, err = client.Run(chartRequested, nil)
	// ToDo log info install successful
	return err
}
