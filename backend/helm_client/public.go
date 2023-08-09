package helm_client

func List(o *ListReleaseOptions) (*ListReleaseRsp, error) {
	c := &baseClient{}
	c.InitClient(o.Namespace)
	return c.list(o)
}

func Install(o *InstallOptions) error {
	c := &baseClient{}
	c.InitClient(o.Namespace)
	return c.install(o)
}

func Uninstall(o *UninstallOptions) error {
	c := &baseClient{}
	c.InitClient(o.Namespace)
	return c.uninstall(o)
}

func SearchHub(o *HubSearchOptions) (*HubSearchRsp, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.searchHub(o)
}

func ValueHub(o *HubValueOptions) (*HubSearchElement, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.valueHub(o)
}

func InstallHubPackage(o *HubInstallOptions) error {
	c := &baseClient{}
	c.InitClient(o.Namespace)
	return c.installHubPackage(o)
}

func SearchRepo(o *RepoSearchOptions) (*RepoSearchRsp, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.searchRepo(o)
}

func ListEnv() map[string]string {
	c := &baseClient{}
	c.InitClient("")
	return c.getAllEnv()
}

func RepoAdd(o *RepoAddOptions) error {
	c := &baseClient{}
	c.InitClient("")
	return c.repoAdd(o)
}

func RepoRemove(o *RepoRemoveOptions) error {
	c := &baseClient{}
	c.InitClient("")
	return c.repoRemove(o)
}

func RepoUpdate(o *RepoUpdateOptions) error {
	c := &baseClient{}
	c.InitClient("")
	return c.repoUpdate(o)
}

func RepoList() (*ListRepoRsp, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.repoList()
}

func ShowValues(o *ShowOptions) (string, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.showValues(o)
}

func GetValues(o *GetOptions) (string, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.getValues(o)
}
