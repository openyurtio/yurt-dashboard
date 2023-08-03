package helm_client

import (
	"net/url"
	"path"
)

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

	return c.installFromURL(res.ContentURL, o.ReleaseName)
}

func (c *baseClient) installFromURL(packageURL string, releaseName string) error {
	u, err := url.Parse(packageURL)
	if err != nil {
		return nil
	}
	fileName := path.Base(u.Path)

	err = downloadUrl(packageURL, c.settings.RepositoryCache, fileName)
	if err != nil {
		return err
	}

	return c.install(&InstallOptions{
		ReleaseName: releaseName,
		ChartString: path.Join(c.settings.RepositoryCache, fileName),
	})
}
