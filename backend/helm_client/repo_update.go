package helm_client

import (
	"fmt"
	"sync"

	"github.com/pkg/errors"
	"helm.sh/helm/v3/pkg/getter"
	"helm.sh/helm/v3/pkg/repo"
)

type RepoUpdateOptions struct {
}

func repoUpdate(names []string) error {
	repoFile := settings.RepositoryConfig
	repoCache := settings.RepositoryCache

	f, err := repo.LoadFile(repoFile)
	switch {
	case isNotExist(err),
		len(f.Repositories) == 0:
		return errors.New("no repositories found. You must add one before updating")
	case err != nil:
		return errors.Wrapf(err, "failed loading file: %s", repoFile)
	}

	var repos []*repo.ChartRepository
	updateAllRepos := len(names) == 0

	if !updateAllRepos {
		// Fail early if the user specified an invalid repo to update
		if err := checkRequestedRepos(names, f.Repositories); err != nil {
			return err
		}
	}

	for _, cfg := range f.Repositories {
		if updateAllRepos || isRepoRequested(cfg.Name, names) {
			r, err := repo.NewChartRepository(cfg, getter.All(settings))
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
				// ToDo log error fmt.Fprintf(out, "...Unable to get an update from the %q chart repository (%s):\n\t%s\n", re.Config.Name, re.Config.URL, err)
				repoFailList = append(repoFailList, re.Config.URL)
			} else {
				// ToDo log info fmt.Fprintf(out, "...Successfully got an update from the %q chart repository\n", re.Config.Name)
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
