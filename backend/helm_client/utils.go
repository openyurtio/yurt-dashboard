package helm_client

import (
	"io/ioutil"
	"log"
	"os"

	"github.com/pkg/errors"
)

func getKubeConfigString(kubeconfigPath string) string {
	contentBytes, err := ioutil.ReadFile(kubeconfigPath)
	if err != nil {
		panic("read kubeconfig file failed")
	}
	return string(contentBytes)
}

func checkAndSetPath(envVar string, setValue string) {
	if os.Getenv(envVar) == "" {
		if err := os.Setenv(envVar, setValue); err != nil {
			log.Printf("Failed to set environment variable %s: %v", envVar, err)
		}
	}
}

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
