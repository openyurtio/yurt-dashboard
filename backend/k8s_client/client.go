/*
 client.go defines two types of clients
 - baseClient used to perform general purpose actions such as Create, Read, List
 - resourceClient used to perform actions corresponding to a specific kind of resource
*/

package client

import (
	"context"
	"encoding/json"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
)

type StatusReader interface {
	GetStatus(namespace string) (*ResourceStatus, error)
}

type RawReader interface {
	ListRaw(namespace string) ([]byte, error)
	GetRaw(namespace, name string) ([]byte, error)
}

type RawWriter interface {
	CreateRaw(namespace string, body interface{}) error
	DeleteRaw(namespace, name string) error
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

//// baseClient implementation

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

// return raw list resp body received from k8s api
func (c *baseClient) ListRaw(namespace string) ([]byte, error) {
	return doGetReq(c.client, namespace, c.resourceName).
		DoRaw(context.TODO())
}

// return raw obj resp body
func (c *baseClient) GetRaw(namespace string, name string) ([]byte, error) {
	return doGetReq(c.client, namespace, c.resourceName).Name(name).
		DoRaw(context.TODO())
}

// create raw obj resource in k8s
func (c *baseClient) CreateRaw(namespace string, obj interface{}) error {
	req := c.client.Post()
	if namespace != "" {
		req = req.Namespace(namespace)
	}
	_, err := req.
		Resource(c.resourceName).
		Body(obj).
		DoRaw(context.TODO())
	return err
}

// delete obj resource in k8s
func (c *baseClient) DeleteRaw(namespace, name string) error {
	req := c.client.Delete()
	if namespace != "" {
		req = req.Namespace(namespace)
	}

	_, err := req.Resource(c.resourceName).
		Name(name).
		DoRaw(context.TODO())

	return err
}

//// ResourceClient implementation

type UserClient struct {
	baseClient
}

func (c *UserClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &UserConfig)
}

func (c *UserClient) GetUser(name string) (user *User, err error) {
	user = &User{}
	err = doGetReq(c.client, userStoreNS, c.resourceName).Name(name).
		Do(context.TODO()).
		Into(user)
	if err != nil {
		return nil, fmt.Errorf("get user fail: %w", err)
	}
	return
}

type ResourceClient interface {
	InitClient(kubeConfig string) error
	RawReader
	RawWriter
	StatusReader
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

// PATCH /api/v1/nodes/{nodeName}
// patchData example: map[string]interface{}{"metadata": map[string]map[string]string{"annotations": {
// 	"node.beta.alibabacloud.com/autonomy": "false",
// }}}
func (c *NodeClient) Patch(nodeName string, patchData map[string]interface{}) ([]byte, error) {

	payload, err := json.Marshal(patchData)
	if err != nil {
		return nil, fmt.Errorf("Patch Node: json marshal patchData fail %w", err)
	}

	return c.client.Patch(types.MergePatchType).Resource(c.resourceName).Name(nodeName).
		Body(payload).
		DoRaw(context.TODO())
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

// get deployment list
func (c *DeploymentClient) Get(namespace string) (*appsv1.DeploymentList, error) {
	// get deployments into list
	dpList := &appsv1.DeploymentList{}
	err := doGetReq(c.client, namespace, DeploymentConfig.ResourceName).
		Do(context.TODO()).
		Into(dpList)

	if err != nil {
		return nil, fmt.Errorf("request deployments fail: %v", err)
	}

	return dpList, nil
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

type ServiceClient struct {
	baseClient
}

func (c *ServiceClient) InitClient(kubeConfig string) (err error) {
	return c.baseClient.InitClient(kubeConfig, &ServiceConfig)
}

// get service list
func (c *ServiceClient) Get(namespace string) (*corev1.ServiceList, error) {
	// get deployments into list
	svcList := &corev1.ServiceList{}
	err := doGetReq(c.client, namespace, ServiceConfig.ResourceName).
		Do(context.TODO()).
		Into(svcList)

	if err != nil {
		return nil, fmt.Errorf("request service fail: %v", err)
	}

	return svcList, nil
}
