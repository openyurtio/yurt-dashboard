package helm_client

type HubInstallOptions struct {
	RepoName    string `json:"repo_name"`
	PackageName string `json:"package_name"`
	Version     string `json:"version"`
	ReleaseName string `json:"release_name"`
	Namespace   string `json:"namespace"`
}

func (c *baseClient) installHubPackage(o *HubInstallOptions) error {
	res, err := c.valueHub(&HubValueOptions{
		RepoName:    o.RepoName,
		PackageName: o.PackageName,
		Version:     o.Version,
	})
	if err != nil {
		return err
	}

	return c.install(&InstallOptions{
		ReleaseName: o.ReleaseName,
		ChartString: res.ContentURL,
	})
}
