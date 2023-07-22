package helm_client

import (
	"path/filepath"
	"strings"

	"github.com/Masterminds/semver/v3"
	"github.com/pkg/errors"
	"helm.sh/helm/v3/cmd/helm/search"
	"helm.sh/helm/v3/pkg/helmpath"
	"helm.sh/helm/v3/pkg/repo"
)

const searchMaxScore = 25

type RepoSearchOptions struct {
	RepoNames []string
	Names     []string
	Version   string
	Devel     bool
}

type RepoSearchElement struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	AppVersion  string `json:"app_version"`
	Description string `json:"description"`
}

type RepoSearchRsp struct {
	RepoSearchElements []RepoSearchElement `json:"repo_search_elements"`
}

func searchRepo(o *RepoSearchOptions) (*RepoSearchRsp, error) {
	o.setupSearchedVersion()

	index, err := o.buildIndex()
	if err != nil {
		return nil, err
	}

	searchRes, err := o.searchIndex(index)
	if err != nil {
		return nil, err
	}

	search.SortScore(searchRes)

	constraintRes, err := o.applyConstraint(searchRes)
	if err != nil {
		return nil, err
	}

	res := &RepoSearchRsp{}
	for _, r := range constraintRes {
		element := RepoSearchElement{
			Name:        r.Name,
			Version:     r.Chart.Version,
			AppVersion:  r.Chart.AppVersion,
			Description: r.Chart.Description,
		}
		res.RepoSearchElements = append(res.RepoSearchElements, element)
	}

	return res, nil
}

func (o *RepoSearchOptions) setupSearchedVersion() {
	if o.Version == "" {
		if o.Devel {
			o.Version = ">0.0.0-0"
		} else {
			o.Version = ">0.0.0"
		}
	}
}

func (o *RepoSearchOptions) buildIndex() (*search.Index, error) {
	repoFile := settings.RepositoryConfig
	repoCache := settings.RepositoryCache

	f, err := repo.LoadFile(repoFile)
	if isNotExist(err) || len(f.Repositories) == 0 {
		return nil, errors.New("no repositories configured")
	}

	searchAllRepos := len(o.RepoNames) == 0
	i := search.NewIndex()
	for _, re := range f.Repositories {
		n := re.Name
		if searchAllRepos || isRepoRequested(n, o.RepoNames) {
			indexf := filepath.Join(repoCache, helmpath.CacheIndexFile(n))
			ind, err := repo.LoadIndexFile(indexf)
			if err != nil {
				// ToDo log warning warning("Repo %q is corrupt or missing. Try 'helm repo update'.", n)
				// ToDo log warning warning("%s", err)
				continue
			}
			i.AddRepo(n, ind, true)
		}
	}

	return i, nil
}

func (o *RepoSearchOptions) searchIndex(i *search.Index) (res []*search.Result, err error) {
	if len(o.Names) == 0 {
		res = i.All()
	} else {
		q := strings.Join(o.Names, " ")
		res, err = i.Search(q, searchMaxScore, false)
		if err != nil {
			return nil, err
		}
	}

	return res, nil
}

func (o *RepoSearchOptions) applyConstraint(res []*search.Result) ([]*search.Result, error) {
	constraint, err := semver.NewConstraint(o.Version)
	if err != nil {
		return res, errors.Wrapf(err, "an invalid version/constraint format: %s", o.Version)
	}

	data := res[:0]
	for _, r := range res {
		v, err := semver.NewVersion(r.Chart.Version)
		if err != nil {
			continue
		}
		if constraint.Check(v) {
			data = append(data, r)
		}
	}

	return data, nil
}
