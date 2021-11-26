/*
utils.go contains wrapper function of client-go for ease of use
*/
package client

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"

	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"

	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// create a RESTClient based on configuration
func getRESTClient(config *ClientConfig) (*rest.RESTClient, error) {
	restConfig, err := clientcmd.RESTConfigFromKubeConfig([]byte(config.KubeConfig))
	if err != nil {
		return nil, fmt.Errorf("get RestClient from kubeconfig failed: %v", err)
	}

	// initialize restConfig
	restConfig.APIPath = config.APIPath
	restConfig.GroupVersion = config.GroupVersion
	restConfig.NegotiatedSerializer = scheme.Codecs
	restConfig.ContentType = "application/json"

	return rest.RESTClientFor(restConfig)
}

// read kubeconfig string from a local file
func getKubeConfigString(kubeconfigPath string) string {
	contentBytes, err := ioutil.ReadFile(kubeconfigPath)
	if err != nil {
		panic("read kubeconfig file failed")
	}
	return string(contentBytes)
}

func doGetReq(client *rest.RESTClient, namespace, resourceType string) *rest.Request {
	req := client.Get()
	// namespace can be left blank
	if namespace != "" {
		req = req.Namespace(namespace)
	}
	return req.
		Resource(resourceType)
}

// listRaw create a resourceClient and uses it to get raw resp from k8s API
func listRaw(kubeConfig, namespace string, resourceConfig *ResourceConfig) ([]byte, error) {
	rawClient := &baseClient{}
	err := rawClient.InitClient(kubeConfig, resourceConfig)
	if err != nil {
		return nil, fmt.Errorf("list raw %s fail: %w", rawClient.resourceName, err)
	}

	return rawClient.ListRaw(namespace)
}

// createRaw create a resourceClient and uses it to create a resource
func createRaw(kubeConfig, namespace string, resourceConfig *ResourceConfig, obj interface{}) error {
	rawClient := &baseClient{}
	err := rawClient.InitClient(kubeConfig, resourceConfig)
	if err != nil {
		return fmt.Errorf("create raw %s init client fail: %w", rawClient.resourceName, err)
	}

	return rawClient.CreateRaw(namespace, obj)
}

func deleteRaw(kubeConfig, namespace string, resourceConfig *ResourceConfig, name string) error {
	rawClient := &baseClient{}
	err := rawClient.InitClient(kubeConfig, resourceConfig)
	if err != nil {
		return fmt.Errorf("delete raw %s init client fail: %w", rawClient.resourceName, err)
	}

	return rawClient.DeleteRaw(namespace, name)
}

func getPodStatus(client *rest.RESTClient, namespace string) (status *ResourceStatus, err error) {
	// get pods into podList
	podList := &corev1.PodList{}
	err = doGetReq(client, namespace, PodConfig.ResourceName).
		Do(context.TODO()).
		Into(podList)
	if err != nil {
		return nil, fmt.Errorf("request pods fail: %v", err)
	}

	// audit podList
	status = &ResourceStatus{
		Kind:       "pods",
		TotalNum:   len(podList.Items),
		HealthyNum: 0,
		Status:     true,
	}

	for _, pod := range podList.Items {
		// "Running", "Succeeded" -> healthy
		// "Pending", "Failed", "Unknown" -> unhealthy
		if pod.Status.Phase == "Running" || pod.Status.Phase == "Succeeded" {
			status.HealthyNum += 1
		}
	}

	return status, nil
}

func getNodeStatus(client *rest.RESTClient, namespace string) (status *ResourceStatus, err error) {
	// get nodes into nodeList
	nodeList := &corev1.NodeList{}
	err = doGetReq(client, "", NodeConfig.ResourceName).
		Do(context.TODO()).
		Into(nodeList)
	if err != nil {
		return nil, fmt.Errorf("request nodes fail: %v", err)
	}

	// audit nodeList
	status = &ResourceStatus{
		Kind:       "nodes",
		TotalNum:   len(nodeList.Items),
		HealthyNum: 0,
		Status:     true,
	}

	for _, node := range nodeList.Items {
		for _, condition := range node.Status.Conditions {
			if condition.Type == "Ready" && condition.Status == "True" {
				status.HealthyNum += 1
			}
		}
	}

	return status, nil
}

func getDeploymentStatus(client *rest.RESTClient, namespace string) (status *ResourceStatus, err error) {
	// get deployments into list
	dpList := &appsv1.DeploymentList{}
	err = doGetReq(client, namespace, DeploymentConfig.ResourceName).
		Do(context.TODO()).
		Into(dpList)
	if err != nil {
		return nil, fmt.Errorf("request deployments fail: %v", err)
	}

	status = &ResourceStatus{
		Kind:       "deployments",
		TotalNum:   len(dpList.Items),
		HealthyNum: 0,
		Status:     true,
	}

	for _, dp := range dpList.Items {
		if dp.Status.Replicas == dp.Status.ReadyReplicas {
			status.HealthyNum += 1
		}
	}

	return status, nil
}

func getStatefulSetsStatus(client *rest.RESTClient, namespace string) (status *ResourceStatus, err error) {

	ssList := &appsv1.StatefulSetList{}
	err = doGetReq(client, namespace, StatefulsetConfig.ResourceName).
		Do(context.TODO()).
		Into(ssList)
	if err != nil {
		return nil, fmt.Errorf("request statefulsets fail: %v", err)
	}

	status = &ResourceStatus{
		Kind:       "statefulsets",
		TotalNum:   len(ssList.Items),
		HealthyNum: 0,
		Status:     true,
	}

	for _, ss := range ssList.Items {
		if ss.Status.Replicas == ss.Status.ReadyReplicas {
			status.HealthyNum += 1
		}
	}

	return status, nil
}

func getJobStatus(client *rest.RESTClient, namespace string) (status *ResourceStatus, err error) {

	jobList := &batchv1.JobList{}
	err = doGetReq(client, namespace, JobConfig.ResourceName).
		Do(context.TODO()).
		Into(jobList)
	if err != nil {
		return nil, fmt.Errorf("request jobs fail: %v", err)
	}

	status = &ResourceStatus{
		Kind:       "jobs",
		TotalNum:   len(jobList.Items),
		HealthyNum: 0,
		Status:     true,
	}

	for _, ss := range jobList.Items {
		if ss.Status.Failed == 0 {
			status.HealthyNum += 1
		}
	}

	return
}

func createUser(user *UserSpec) []byte {

	payload := User{
		Spec: *user,
	}
	payload.APIVersion = "user.openyurt.io/v1alpha1"
	payload.Kind = "User"
	payload.Name = fmt.Sprintf("user-%s", user.Mobilephone)

	res, _ := json.Marshal(payload)

	return res
}

func int32Ptr(i int32) *int32 { return &i }
