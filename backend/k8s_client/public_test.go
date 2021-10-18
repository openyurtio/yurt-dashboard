package client

import (
	"testing"
)

var kubeConfig = GetKubeConfigString("./kubeconfig.conf")

func assertNoErr(err error, t testing.TB) {
	t.Helper()
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestGetRaw(t *testing.T) {
	t.Run("get jobs in kube-system", func(t *testing.T) {
		_, err := GetRawJob(kubeConfig, "kube-system")
		assertNoErr(err, t)
	})

	t.Run("get deployments in kube-system", func(t *testing.T) {
		_, err := GetRawDeployment(kubeConfig, "kube-system")
		assertNoErr(err, t)
	})

	t.Run("get nodepool", func(t *testing.T) {
		_, err := GetRawNodepool(kubeConfig, "")
		assertNoErr(err, t)
	})

}

func TestGetOverview(t *testing.T) {
	_, err := GetClusterOverview(kubeConfig, "kube-system")
	assertNoErr(err, t)
}
