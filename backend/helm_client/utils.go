package helm_client

import (
	"io"
	"net/http"
	"os"
	"path"
	"strings"

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

func downloadFromUrlToFile(url string, dest string) (string, error) {
	tokens := strings.Split(url, "/")
	fileName := tokens[len(tokens)-1]
	destFile := path.Join(dest, fileName)

	_, err := os.Stat(destFile)
	if err == nil {
		// File exists
		return destFile, nil
	} else if !isNotExist(err) {
		return "", err
	}

	tempFile, err := os.CreateTemp(dest, fileName)
	if err != nil {
		return "", err
	}
	tempName := tempFile.Name()
	defer tempFile.Close()

	res, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	_, err = io.Copy(tempFile, res.Body)
	if err != nil {
		return "", err
	}

	if err := os.Chmod(tempName, 0644); err != nil {
		return "", err
	}

	return destFile, os.Rename(tempName, destFile)
}
