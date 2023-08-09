package helm_client

import (
	"os"

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
