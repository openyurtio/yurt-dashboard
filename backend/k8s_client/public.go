/*
public.go exposes out-of-the-box function used by proxy_server
*/
package client

// get all Pods from a namespace
func GetRawPod(kubeConfig, namespace string) ([]byte, error) {
	return getRaw(kubeConfig, namespace, &PodConfig)
}

// get all deployments from a namespace
func GetRawDeployment(kubeConfig, namespace string) ([]byte, error) {
	return getRaw(kubeConfig, namespace, &DeploymentConfig)
}

// get nodes which belong to one user (based on the kubeconfig)
func GetRawNode(kubeConfig, namespace string) ([]byte, error) { // namespace is used for compatity
	return getRaw(kubeConfig, "", &NodeConfig)
}

// get statefulsets which belong to one user (based on the kubeconfig)
func GetRawStatefulset(kubeConfig, namespace string) ([]byte, error) {
	return getRaw(kubeConfig, namespace, &StatefulsetConfig)
}

// get all jobs from a namespace
func GetRawJob(kubeConfig, namespace string) ([]byte, error) {
	return getRaw(kubeConfig, namespace, &JobConfig)
}

// get all nodepool
func GetRawNodepool(kubeConfig, namespace string) ([]byte, error) { // namespace is used for compatity
	return getRaw(kubeConfig, "", &NodepoolConfig)
}

// get cluster overview
func GetClusterOverview(kubeConfig, namespace string) (res []*ResourceStatus, err error) {

	// initialize res
	res = make([]*ResourceStatus, 0)
	ch := make(chan *ResourceStatus)

	clientList := []ResourceClient{&PodClient{}, &NodeClient{}, &StatefulsetClient{}, &JobClient{}, &DeploymentClient{}}

	for _, client := range clientList {

		// assign each get task into one goroutine
		go func(client ResourceClient) {

			err := client.InitClient(kubeConfig)
			if err != nil {
				ch <- &ResourceStatus{
					Status: false,
					Info:   err.Error(),
				}
				return
			}

			status, err := client.GetStatus(namespace)
			if err != nil {
				ch <- &ResourceStatus{
					Status: false,
					Info:   err.Error(),
				}
				return
			}

			// push res into channel
			ch <- status
		}(client)
	}

	for i := 0; i < len(clientList); i += 1 {
		// read res from channel
		res = append(res, <-ch)
	}

	return res, nil
}
