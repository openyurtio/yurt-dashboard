package helm_client

func List(namespace string) (*ListReleaseRsp, error) {
	cfg, err := createActionConfig(namespace)
	if err != nil {
		return nil, err
	}

	return list(cfg)
}

func Install(namespace string, releaseName string, chartString string) error {
	cfg, err := createActionConfig(namespace)
	if err != nil {
		return err
	}

	return install(cfg, releaseName, chartString)
}

func Uninstall(namespace string, releaseName string) error {
	cfg, err := createActionConfig(namespace)
	if err != nil {
		return err
	}

	return uninstall(cfg, releaseName)
}

func SearchHub(o *HubSearchOptions) (*HubSearchRsp, error) {
	return searchHub(o)
}

func ValueHub(o *HubValueOptions) (*HubSearchElement, error) {
	return valueHub(o)
}

func InstallHubPackage(o *HubInstallOptions) error {
	return installHubPackage(o)
}

func SearchRepo(o *RepoSearchOptions) (*RepoSearchRsp, error) {
	return searchRepo(o)
}

func ListEnv() map[string]string {
	return getAllEnv()
}

func RepoAdd(o *RepoAddOptions) error {
	return repoAdd(o)
}

func RepoRemove(names []string) error {
	return repoRemove(names)
}

func RepoUpdate(names []string) error {
	return repoUpdate(names)
}

func RepoList() (*ListRepoRsp, error) {
	return repoList()
}
