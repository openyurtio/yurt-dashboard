package helm_client

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"

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

func searchHub(o *HubSearchOptions) (*HubSearchRsp, error) {
	searchURL, err := url.JoinPath(HelmHubURL, "search")
	if err != nil {
		return nil, err
	}
	p, err := url.Parse(searchURL)
	if err != nil {
		return nil, err
	}
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
	p.RawQuery = v.Encode()
	// ToDo fmt.Printf("Url: %s\n", p.String())
	req, err := http.NewRequest(http.MethodGet, p.String(), nil)
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

func valueHub(o *HubValueOptions) (*HubSearchElement, error) {
	valueURL, err := url.JoinPath(HelmHubURL, "helm", o.RepoName, o.PackageName)
	if err != nil {
		return nil, err
	}
	if o.Version != "" {
		valueURL, err = url.JoinPath(valueURL, o.Version)
		if err != nil {
			return nil, err
		}
	}

	p, err := url.Parse(valueURL)
	if err != nil {
		return nil, err
	}

	// ToDo fmt.Printf("Url: %s\n", p.String())
	req, err := http.NewRequest(http.MethodGet, p.String(), nil)
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
