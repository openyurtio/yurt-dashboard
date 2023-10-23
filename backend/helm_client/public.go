package helm_client

// helm list
func List(o *ListReleaseOptions) (*ListReleaseRsp, error) {
	c := &baseClient{}
	c.InitClient(o.Namespace)
	return c.list(o)
}

// helm install
func Install(o *InstallOptions) error {
	c := &baseClient{}
	c.InitClient(o.Namespace)
	return c.install(o)
}

// helm uninstall
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

// helm search repo
func SearchRepo(o *RepoSearchOptions) (*RepoSearchRsp, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.searchRepo(o)
}

// helm env
func ListEnv() map[string]string {
	c := &baseClient{}
	c.InitClient("")
	return c.getAllEnv()
}

// helm repo add
func RepoAdd(o *RepoAddOptions) error {
	c := &baseClient{}
	c.InitClient("")
	return c.repoAdd(o)
}

// hlem repo remove
func RepoRemove(o *RepoRemoveOptions) error {
	c := &baseClient{}
	c.InitClient("")
	return c.repoRemove(o)
}

// helm repo update
func RepoUpdate(o *RepoUpdateOptions) error {
	c := &baseClient{}
	c.InitClient("")
	return c.repoUpdate(o)
}

// helm repo list
func RepoList() (*ListRepoRsp, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.repoList()
}

// helm show values
func ShowValues(o *ShowOptions) (string, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.showValues(o)
}

// helm get values
func GetValues(o *GetOptions) (string, error) {
	c := &baseClient{}
	c.InitClient("")
	return c.getValues(o)
}
