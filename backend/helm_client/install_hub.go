package helm_client

type HubInstallOptions struct {
	RepoName    string `json:"repo_name"`
	PackageName string `json:"package_name"`
	Version     string `json:"version"`
	ReleaseName string `json:"release_name"`
	Namespace	string `json:"namespace"`
}

func installHubPackage(o *HubInstallOptions) error {
	res, err := valueHub(&HubValueOptions{
		RepoName:    o.RepoName,
		PackageName: o.PackageName,
		Version:     o.Version,
	})
	if err != nil {
		return err
	}

	df, err := downloadFromUrlToFile(res.ContentURL, settings.RepositoryCache)
	if err != nil {
		return err
	}

	cfg, err := createActionConfig(o.Namespace)
	if err != nil {
		return err
	}

	return install(cfg, o.ReleaseName, df)
}
