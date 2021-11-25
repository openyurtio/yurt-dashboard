/*
utils.go contains wrapper function of client-go for ease of use
*/
package client

import (
	"context"
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

	return rest.RESTClientFor(restConfig)
}

// read kubeconfig string from a local file
func GetKubeConfigString(kubeconfigPath string) string {
	contentBytes, err := ioutil.ReadFile(kubeconfigPath)
	if err != nil {
		panic("read kubeconfig file failed")
	}
	return string(contentBytes)
}

func doGetReq(client *rest.RESTClient, namespace, resourceType string) *rest.Request {
	req := client.Get()
	if namespace != "" {
		req = req.Namespace(namespace)
	}
	return req.
		Resource(resourceType)
}

// getRaw create a resourceClient and uses it to get raw resp from k8s API
func getRaw(kubeConfig, namespace string, resourceConfig *ResourceConfig) ([]byte, error) {
	rawClient := &baseClient{}
	err := rawClient.InitClient(kubeConfig, resourceConfig)
	if err != nil {
		return nil, fmt.Errorf("get raw fail: %v", err)
	}

	return rawClient.GetRaw(namespace)
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
		// "Pending", "Running", "Succeeded" -> healthy
		// "Failed", "Unknown" -> unhealthy
		if pod.Status.Phase != "Failed" && pod.Status.Phase != "Unknown" {
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
