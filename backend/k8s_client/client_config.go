package client

import (
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// customized settings for RESTClient
type ClientConfig struct {
	// kubeconfig string
	KubeConfig string

	*ResourceConfig
}

// Resource request API settings
type ResourceConfig struct {
	// a sub-path that points to an API root
	APIPath string

	// API version to talk to
	GroupVersion *schema.GroupVersion

	// Resource name
	ResourceName string
}

var (
	// request path: /api/v1/nodes
	NodeConfig = ResourceConfig{
		APIPath:      "api",
		GroupVersion: &schema.GroupVersion{Group: "", Version: "v1"},
		ResourceName: "nodes",
	}

	// request path: /apis/apps/v1/namespaces/{namespace}/statefulsets
	StatefulsetConfig = ResourceConfig{
		APIPath:      "apis",
		GroupVersion: &schema.GroupVersion{Group: "apps", Version: "v1"},
		ResourceName: "statefulsets",
	}

	// request path: /apis/batch/v1/namespaces/{namespace}/jobs
	JobConfig = ResourceConfig{
		APIPath:      "apis",
		GroupVersion: &schema.GroupVersion{Group: "batch", Version: "v1"},
		ResourceName: "jobs",
	}

	// request path: /apis/v1/namespaces/{namespace}/pods
	PodConfig = ResourceConfig{
		APIPath:      "api",
		GroupVersion: &schema.GroupVersion{Group: "", Version: "v1"},
		ResourceName: "pods",
	}

	// request path: /apis/apps/v1/namespaces/{namespace}/deployments
	DeploymentConfig = ResourceConfig{
		APIPath:      "apis",
		GroupVersion: &schema.GroupVersion{Group: "apps", Version: "v1"},
		ResourceName: "deployments",
	}

	// request path: /apis/apps.openyurt.io/v1alpha1/nodepools
	NodepoolConfig = ResourceConfig{
		APIPath:      "apis",
		GroupVersion: &schema.GroupVersion{Group: "apps.openyurt.io", Version: "v1alpha1"},
		ResourceName: "nodepools",
	}

	// request path: /apis/user.openyurt.io/v1alpha1/users/
	UserConfig = ResourceConfig{
		APIPath:      "apis",
		GroupVersion: &schema.GroupVersion{Group: "user.openyurt.io", Version: "v1alpha1"},
		ResourceName: "users",
	}
)
