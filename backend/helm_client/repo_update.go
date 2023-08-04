package helm_client

import (
	"fmt"
	"sync"

	"github.com/pkg/errors"
	"helm.sh/helm/v3/pkg/getter"
	"helm.sh/helm/v3/pkg/repo"
)

type RepoUpdateOptions struct {
	Names []string	`json:"names"`
}

func (c *baseClient) repoUpdate(o *RepoUpdateOptions) error {
	repoFile := c.settings.RepositoryConfig
	repoCache := c.settings.RepositoryCache

	f, err := repo.LoadFile(repoFile)
	switch {
	case isNotExist(err),
		len(f.Repositories) == 0:
		return errors.New("no repositories found. You must add one before updating")
	case err != nil:
		return errors.Wrapf(err, "failed loading file: %s", repoFile)
	}

	var repos []*repo.ChartRepository
	updateAllRepos := len(o.Names) == 0

	if !updateAllRepos {
		// Fail early if the user specified an invalid repo to update
		if err := checkRequestedRepos(o.Names, f.Repositories); err != nil {
			return err
		}
	}

	for _, cfg := range f.Repositories {
		if updateAllRepos || isRepoRequested(cfg.Name, o.Names) {
			r, err := repo.NewChartRepository(cfg, getter.All(c.settings))
			if err != nil {
				return err
			}
			if repoCache != "" {
				r.CachePath = repoCache
			}
			repos = append(repos, r)
		}
	}

	var wg sync.WaitGroup
	var repoFailList []string
	for _, re := range repos {
		wg.Add(1)
		go func(re *repo.ChartRepository) {
			defer wg.Done()
			if _, err := re.DownloadIndexFile(); err != nil {
				repoFailList = append(repoFailList, re.Config.URL)
			}
		}(re)
	}
	wg.Wait()

	if len(repoFailList) > 0 {
		return fmt.Errorf("Failed to update the following repositories: %s",
			repoFailList)
	}

	return nil
}

func checkRequestedRepos(requestedRepos []string, validRepos []*repo.Entry) error {
	for _, requestedRepo := range requestedRepos {
		found := false
		for _, repo := range validRepos {
			if requestedRepo == repo.Name {
				found = true
				break
			}
		}
		if !found {
			return errors.Errorf("no repositories found matching '%s'.  Nothing will be updated", requestedRepo)
		}
	}
	return nil
}
