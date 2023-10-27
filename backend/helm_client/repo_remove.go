package helm_client

import (
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"helm.sh/helm/v3/pkg/helmpath"
	"helm.sh/helm/v3/pkg/repo"
)

type RepoRemoveOptions struct {
	Names []string `json:"names"`
}

func (c *baseClient) repoRemove(o * RepoRemoveOptions) error {
	repoFile := c.settings.RepositoryConfig
	repoCache := c.settings.RepositoryCache

	r, err := repo.LoadFile(repoFile)
	if isNotExist(err) || len(r.Repositories) == 0 {
		return errors.New("no repositories configured")
	}

	for _, name := range o.Names {
		if !r.Remove(name) {
			return errors.Errorf("no repo named %q found", name)
		}
		if err := r.WriteFile(repoFile, 0644); err != nil {
			return err
		}

		if err := removeRepoCache(repoCache, name); err != nil {
			return err
		}
	}

	return nil
}

func removeRepoCache(root, name string) error {
	idx := filepath.Join(root, helmpath.CacheChartsFile(name))
	if _, err := os.Stat(idx); err == nil {
		os.Remove(idx)
	}

	idx = filepath.Join(root, helmpath.CacheIndexFile(name))
	if _, err := os.Stat(idx); os.IsNotExist(err) {
		return nil
	} else if err != nil {
		return errors.Wrapf(err, "can't remove index file %s", idx)
	}
	return os.Remove(idx)
}
