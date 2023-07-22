package helm_client

import (
	"helm.sh/helm/v3/pkg/repo"
)

type ListRepoRsp struct {
	RepoElments []RepoElement `json:"repo_elements"`
}

type RepoElement struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

func repoList() (*ListRepoRsp, error) {
	result := &ListRepoRsp{}

	f, err := repo.LoadFile(settings.RepositoryConfig)
	if isNotExist(err) || len(f.Repositories) == 0 {
		return result, nil
	}

	for _, one := range f.Repositories {
		element := RepoElement{
			Name: one.Name,
			URL:  one.URL,
		}
		result.RepoElments = append(result.RepoElments, element)
	}
	return result, nil
}
