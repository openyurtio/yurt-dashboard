/*
client.go defines resourceClient used to perform actions for a specific kind of resource
*/

package client

import (
	"context"
	"fmt"

	"k8s.io/client-go/rest"
)

type StatusReader interface {
	GetStatus(namespace string) (*ResourceStatus, error)
}

type RawReader interface {
	GetRaw(namespace string) ([]byte, error)
}

type ResourceClient interface {
	InitClient(kubeConfig string) error
	RawReader
	StatusReader
}

type ResourceStatus struct {
	// resource kind
	Kind string

	// number of all resources
	TotalNum int

	// number of healthy resources
	HealthyNum int

	// Status == false means status retrieve fail
	Status bool
	// Info tell about the err msg
	Info string
}

// baseClient is responsible for performing actions for a specific kind of resource.
// It is a wrapper for RESTClient in client-go
type baseClient struct {
	client       *rest.RESTClient
	resourceName string
}

func (c *baseClient) InitClient(kubeConfig string, resourceConfig *ResourceConfig) (err error) {
	c.resourceName = resourceConfig.ResourceName
	c.client, err = getRESTClient(&ClientConfig{
		KubeConfig:     kubeConfig,
		ResourceConfig: resourceConfig,
	})
	if err != nil {
		return fmt.Errorf("init %s client fail: %v", c.resourceName, err)
	}
	return nil
}

// return raw resp body received from k8s api
func (c *baseClient) GetRaw(namespace string) ([]byte, error) {
	return doGetReq(c.client, namespace, c.resourceName).
		DoRaw(context.TODO())
}

type PodClient struct {
	baseClient
}

func (c *PodClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &PodConfig)
}

func (c *PodClient) GetStatus(namespace string) (*ResourceStatus, error) {
	return getPodStatus(c.client, namespace)
}

type NodeClient struct {
	baseClient
}

func (c *NodeClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &NodeConfig)
}

func (c *NodeClient) GetStatus(namespace string) (*ResourceStatus, error) {
	return getNodeStatus(c.client, namespace)
}

type DeploymentClient struct {
	baseClient
}

func (c *DeploymentClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &DeploymentConfig)
}

func (c *DeploymentClient) GetStatus(namespace string) (*ResourceStatus, error) {
	return getDeploymentStatus(c.client, namespace)
}

type StatefulsetClient struct {
	baseClient
}

func (c *StatefulsetClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &StatefulsetConfig)
}

func (c *StatefulsetClient) GetStatus(namespace string) (*ResourceStatus, error) {
	return getStatefulSetsStatus(c.client, namespace)
}

type JobClient struct {
	baseClient
}

func (c *JobClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &JobConfig)
}

func (c *JobClient) GetStatus(namespace string) (*ResourceStatus, error) {
	return getJobStatus(c.client, namespace)
}
