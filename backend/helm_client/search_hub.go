package helm_client

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"path"

	"github.com/google/go-querystring/query"
)

const HelmHubURL = "https://artifacthub.io/api/v1/packages"

type HubSearchElementRepo struct {
	URL         string `json:"url"`
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
}

type HubSearchAvailableVersion struct {
	Version string `json:"version"`
}

type HubSearchElement struct {
	ID                string                      `json:"package_id"`
	Name              string                      `json:"name"`
	NormalizedName    string                      `json:"normalized_name"`
	ImageID           string                      `json:"logo_image_id"`
	Description       string                      `json:"description"`
	Version           string                      `json:"version"`
	AppVersion        string                      `json:"app_version"`
	ContentURL        string                      `json:"content_url"`
	AvailableVersions []HubSearchAvailableVersion `json:"available_versions"`
	Repo              HubSearchElementRepo        `json:"repository"`
}

type HubSearchRsp struct {
	HubSearchElements []HubSearchElement `json:"packages"`
}

type HubSearchOptions struct {
	Name   string `json:"name"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}

type HubValueOptions struct {
	RepoName    string `json:"repo_name"`
	PackageName string `json:"package_name"`
	Version     string `json:"version"`
}

func (c *baseClient) searchHub(o *HubSearchOptions) (*HubSearchRsp, error) {
	searchURL, err := url.Parse(HelmHubURL)
	if err != nil {
		return nil, err
	}
	searchURL.Path = path.Join(searchURL.Path, "search")
	v, err := query.Values(struct {
		Name       string `url:"ts_query_web"`
		Limit      int    `url:"limit"`
		Offset     int    `url:"offset"`
		Facets     bool   `url:"facets"`
		Sort       string `url:"sort"`
		Kind       int    `url:"kind"`
		Deprecated bool   `url:"deprecated"`
	}{
		o.Name,
		o.Limit,
		o.Offset,
		false,
		"relevance",
		0,
		false})
	if err != nil {
		return nil, err
	}
	searchURL.RawQuery = v.Encode()
	req, err := http.NewRequest(http.MethodGet, searchURL.String(), nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, errors.New("search request get error code")
	}

	result := &HubSearchRsp{}
	json.NewDecoder(res.Body).Decode(result)
	return result, nil
}

func (c *baseClient) valueHub(o *HubValueOptions) (*HubSearchElement, error) {
	valueURL, err := url.Parse(HelmHubURL)
	if err != nil {
		return nil, err
	}
	valueURL.Path = path.Join(valueURL.Path, "helm", o.RepoName, o.PackageName)
	if o.Version != "" {
		valueURL.Path = path.Join(valueURL.Path, o.Version)
	}

	req, err := http.NewRequest(http.MethodGet, valueURL.String(), nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, errors.New("value request get error code")
	}

	result := &HubSearchElement{}
	json.NewDecoder(res.Body).Decode(result)
	return result, nil
}
