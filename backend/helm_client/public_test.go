package helm_client

import (
	"fmt"
	"testing"
)

const TestRepoURL = "https://charts.bitnami.com/bitnami"
const TestRepoName = "bitnami"
const TestChartName = "nginx"
const TestChartVersion = "15.3.3"

func assertNoErr(err error, t testing.TB) {
	t.Helper()
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestHub(t *testing.T) {
	t.Run("search hub", func(t *testing.T) {
		rsp, err := SearchHub(&HubSearchOptions{
			Name:   TestChartName,
			Limit:  10,
			Offset: 0,
		})
		assertNoErr(err, t)

		fmt.Println("hub search: show in name, repo, repourl, version:")
		for _, one := range rsp.HubSearchElements {
			fmt.Printf("%s %s %s %s\n", one.Name, one.Repo.Name, one.Repo.URL, one.Version)
		}
	})

	t.Run("get hub package details", func(t *testing.T) {
		one, err := ValueHub(&HubValueOptions{
			RepoName:    TestRepoName,
			PackageName: TestChartName,
			Version:     TestChartVersion,
		})
		assertNoErr(err, t)

		fmt.Println("hub detail: show in name, contenturl:")
		fmt.Printf("%s %s\n", one.Name, one.ContentURL)
	})
}

func TestRepo(t *testing.T) {
	t.Run("add helm repo", func(t *testing.T) {
		err := RepoAdd(&RepoAddOptions{
			Name:              TestRepoName,
			URL:               TestRepoURL,
			NoRepoExsitsError: true,
			UpdateWhenExsits:  false,
		})
		assertNoErr(err, t)
	})

	t.Run("list helm repo", func(t *testing.T) {
		rsp, err := RepoList()
		assertNoErr(err, t)

		fmt.Println("repo list: show in name, url:")
		for _, one := range rsp.RepoElments {
			fmt.Printf("%s %s\n", one.Name, one.URL)
		}
	})

	t.Run("search helm repo", func(t *testing.T) {
		rsp, err := SearchRepo(&RepoSearchOptions{
			RepoNames: []string{TestRepoName},
			Names:     []string{TestChartName},
			Version:   TestChartVersion,
		})
		assertNoErr(err, t)

		fmt.Println("repo list: show in name, chart, version:")
		for _, one := range rsp.RepoSearchElements {
			fmt.Printf("%s %s %s\n", one.Name, one.ChartName, one.Version)
		}
	})

	t.Run("update helm repo", func(t *testing.T) {
		err := RepoUpdate(&RepoUpdateOptions{
			Names: []string{TestRepoName},
		})
		assertNoErr(err, t)
	})

	t.Run("remove helm repo", func(t *testing.T) {
		err := RepoRemove(&RepoRemoveOptions{
			Names: []string{TestRepoName},
		})
		assertNoErr(err, t)
	})
}

func TestChart(t *testing.T) {
	releaseName := "test-install-chart"

	t.Run("install chart", func(t *testing.T) {
		err := RepoAdd(&RepoAddOptions{
			Name:              TestRepoName,
			URL:               TestRepoURL,
			NoRepoExsitsError: true,
			UpdateWhenExsits:  false,
		})
		assertNoErr(err, t)

		err = Install(&InstallOptions{
			Namespace:   "default",
			ReleaseName: releaseName,
			ChartString: TestRepoName + "/" + TestChartName,
			Version:     TestChartVersion,
		})
		assertNoErr(err, t)
	})

	t.Run("list release", func(t *testing.T) {
		rsp, err := List(&ListReleaseOptions{
			Namespace: "default",
			ShowOptions: ListShowOptions{
				ShowAll: true,
			},
		})
		assertNoErr(err, t)

		fmt.Println("hub install list: show in releasename, chartname, version, namespace:")
		for _, one := range rsp.ReleaseElements {
			fmt.Printf("%s %s %s %s\n", one.Name, one.ChartName, one.Version, one.Namespace)
		}
	})

	t.Run("show chart value file", func(t *testing.T) {
		_, err := ShowValues(&ShowOptions{
			ChartString: TestRepoName + "/" + TestChartName,
			Version:     TestChartVersion,
		})
		assertNoErr(err, t)
	})

	t.Run("get release value file", func(t *testing.T) {
		_, err := GetValues(&GetOptions{
			ReleaseName:   releaseName,
			ShowAllValues: true,
		})
		assertNoErr(err, t)
	})

	t.Run("uninstall release", func(t *testing.T) {
		err := Uninstall(&UninstallOptions{
			Namespace: "default",
			Names:     []string{releaseName},
		})
		assertNoErr(err, t)

		err = RepoRemove(&RepoRemoveOptions{
			Names: []string{TestRepoName},
		})
		assertNoErr(err, t)
	})
}
