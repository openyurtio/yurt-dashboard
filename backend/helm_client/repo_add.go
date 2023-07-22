package helm_client

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofrs/flock"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v2"
	"helm.sh/helm/v3/pkg/getter"
	"helm.sh/helm/v3/pkg/repo"
)

type RepoAddOptions struct {
	Name               string
	URL                string
	Username           string
	Password           string
	PassCredentialsAll bool

	CertFile              string
	KeyFile               string
	CaFile                string
	InsecureSkipTLSverify bool
}

func repoAdd(o *RepoAddOptions) error {
	repoFile := settings.RepositoryConfig
	repoCache := settings.RepositoryCache

	err := os.MkdirAll(filepath.Dir(repoFile), os.ModePerm)
	if err != nil && !os.IsExist(err) {
		return err
	}

	repoFileExt := filepath.Ext(repoFile)
	var lockPath string
	if len(repoFileExt) > 0 && len(repoFileExt) < len(repoFile) {
		lockPath = strings.TrimSuffix(repoFile, repoFileExt) + ".lock"
	} else {
		lockPath = repoFile + ".lock"
	}
	fileLock := flock.New(lockPath)
	lockCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	locked, err := fileLock.TryLockContext(lockCtx, time.Second)
	if err == nil && locked {
		defer fileLock.Unlock()
	}
	if err != nil {
		return err
	}

	b, err := os.ReadFile(repoFile)
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	var f repo.File
	if err := yaml.Unmarshal(b, &f); err != nil {
		return err
	}

	c := repo.Entry{
		Name:                  o.Name,
		URL:                   o.URL,
		Username:              o.Username,
		Password:              o.Password,
		PassCredentialsAll:    o.PassCredentialsAll,
		CertFile:              o.CertFile,
		KeyFile:               o.KeyFile,
		CAFile:                o.CaFile,
		InsecureSkipTLSverify: o.InsecureSkipTLSverify,
	}

	if strings.Contains(o.Name, "/") {
		return errors.Errorf("repository name (%s) contains '/', please specify a different name without '/'", o.Name)
	}

	if f.Has(o.Name) {
		existing := f.Get(o.Name)
		if c != *existing {
			return errors.Errorf("repository name (%s) already exists, please specify a different name", o.Name)
		}

		// The add is idempotent so do nothing
		return errors.Errorf("%q already exists with the same configuration, skipping\n", o.Name)
	}

	r, err := repo.NewChartRepository(&c, getter.All(settings))
	if err != nil {
		return err
	}

	if repoCache != "" {
		r.CachePath = repoCache
	}
	if _, err := r.DownloadIndexFile(); err != nil {
		return errors.Wrapf(err, "looks like %q is not a valid chart repository or cannot be reached", o.URL)
	}

	f.Update(&c)

	if err := f.WriteFile(repoFile, 0644); err != nil {
		return err
	}
	// ToDo log info fmt.Fprintf(out, "%q has been added to your repositories\n", o.name)
	return nil
}
