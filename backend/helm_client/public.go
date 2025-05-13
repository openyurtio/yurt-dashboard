package helm_client

// helm list
func List(o *ListReleaseOptions) (*ListReleaseRsp, error) {
	c, err := CreateClient(o.Namespace)
	if err != nil {
		return nil, err
	}
	return c.list(o)
}

// helm install
func Install(o *InstallOptions) error {
	c, err := CreateClient(o.Namespace)
	if err != nil {
		return err
	}
	return c.install(o)
}

// helm uninstall
func Uninstall(o *UninstallOptions) error {
	c, err := CreateClient(o.Namespace)
	if err != nil {
		return err
	}
	return c.uninstall(o)
}

func SearchHub(o *HubSearchOptions) (*HubSearchRsp, error) {
	c, err := CreateClient("")
	if err != nil {
		return nil, err
	}
	return c.searchHub(o)
}

func ValueHub(o *HubValueOptions) (*HubSearchElement, error) {
	c, err := CreateClient("")
	if err != nil {
		return nil, err
	}
	return c.valueHub(o)
}

func InstallHubPackage(o *HubInstallOptions) error {
	c, err := CreateClient(o.Namespace)
	if err != nil {
		return err
	}
	return c.installHubPackage(o)
}

// helm search repo
func SearchRepo(o *RepoSearchOptions) (*RepoSearchRsp, error) {
	c, err := CreateClient("")
	if err != nil {
		return nil, err
	}
	return c.searchRepo(o)
}

// helm env
func ListEnv() (map[string]string, error) {
	c, err := CreateClient("")
	if err != nil {
		return nil, err
	}
	return c.getAllEnv(), nil
}

// helm repo add
func RepoAdd(o *RepoAddOptions) error {
	c, err := CreateClient("")
	if err != nil {
		return err
	}
	return c.repoAdd(o)
}

// hlem repo remove
func RepoRemove(o *RepoRemoveOptions) error {
	c, err := CreateClient("")
	if err != nil {
		return err
	}
	return c.repoRemove(o)
}

// helm repo update
func RepoUpdate(o *RepoUpdateOptions) error {
	c, err := CreateClient("")
	if err != nil {
		return err
	}
	return c.repoUpdate(o)
}

// helm repo list
func RepoList() (*ListRepoRsp, error) {
	c, err := CreateClient("")
	if err != nil {
		return nil, err
	}
	return c.repoList()
}

// helm show values
func ShowValues(o *ShowOptions) (string, error) {
	c, err := CreateClient("")
	if err != nil {
		return "", err
	}
	return c.showValues(o)
}

// helm get values
func GetValues(o *GetOptions) (string, error) {
	c, err := CreateClient("")
	if err != nil {
		return "", err
	}
	return c.getValues(o)
}
