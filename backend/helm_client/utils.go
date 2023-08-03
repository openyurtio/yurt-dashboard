package helm_client

import (
	"io"
	"net/http"
	"net/url"
	"os"
	"path"

	"github.com/pkg/errors"
)

func isRepoRequested(repoName string, requestedRepos []string) bool {
	for _, requestedRepo := range requestedRepos {
		if repoName == requestedRepo {
			return true
		}
	}
	return false
}

func isNotExist(err error) bool {
	return os.IsNotExist(errors.Cause(err))
}

func downloadUrl(downloadURL string, dest string, fileName string) error {
	u, err := url.Parse(downloadURL)
	if err != nil {
		return err
	}

	if fileName == "" {
		fileName = path.Base(u.Path)
		if fileName == "" {
			return errors.New("Need to specify a download file name.")
		}
	}

	destFile := path.Join(dest, fileName)

	_, err = os.Stat(destFile)
	if err == nil {
		// File exists
		return nil
	} else if !isNotExist(err) {
		return err
	}

	tempFile, err := os.CreateTemp(dest, fileName)
	if err != nil {
		return err
	}
	tempName := tempFile.Name()
	defer tempFile.Close()

	res, err := http.Get(downloadURL)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	_, err = io.Copy(tempFile, res.Body)
	if err != nil {
		return err
	}

	if err := os.Chmod(tempName, 0644); err != nil {
		return err
	}

	return os.Rename(tempName, destFile)
}
