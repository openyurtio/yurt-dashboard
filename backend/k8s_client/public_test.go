package client

import (
	"testing"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func assertNoErr(err error, t testing.TB) {
	t.Helper()
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestGetRaw(t *testing.T) {
	t.Run("get jobs in kube-system", func(t *testing.T) {
		_, err := GetRawJob(kubeConfig, "kube-system")
		assertNoErr(err, t)
	})

	t.Run("get deployments in kube-system", func(t *testing.T) {
		_, err := GetRawDeployment(kubeConfig, "kube-system")
		assertNoErr(err, t)
	})

	t.Run("get nodepool", func(t *testing.T) {
		_, err := GetRawNodepool(kubeConfig, "")
		assertNoErr(err, t)
	})

	t.Run("get service", func(t *testing.T) {
		_, err := GetRawService(kubeConfig, "default")
		assertNoErr(err, t)
	})

}

func TestWriteRaw(t *testing.T) {
	t.Run("create deployment", func(t *testing.T) {

		demoDeployment := &appsv1.Deployment{
			ObjectMeta: metav1.ObjectMeta{
				Name: "demo-deployment",
			},
			Spec: appsv1.DeploymentSpec{
				Replicas: int32Ptr(1),
				Selector: &metav1.LabelSelector{
					MatchLabels: map[string]string{
						"app": "demo",
					},
				},
				Template: apiv1.PodTemplateSpec{
					ObjectMeta: metav1.ObjectMeta{
						Labels: map[string]string{
							"app": "demo",
						},
					},
					Spec: apiv1.PodSpec{
						Containers: []apiv1.Container{
							{
								Name:  "web",
								Image: "nginx:1.12",
								Ports: []apiv1.ContainerPort{
									{
										Name:          "http",
										Protocol:      apiv1.ProtocolTCP,
										ContainerPort: 80,
									},
								},
							},
						},
					},
				},
			},
		}
		err := CreateDeployment(kubeConfig, "18321778186", demoDeployment)
		assertNoErr(err, t)
	})

	t.Run("delete deployment", func(t *testing.T) {
		err := DeleteDeployment(kubeConfig, "18321778186", "demo-deployment")
		assertNoErr(err, t)
	})

	t.Run("delete not exist deployment", func(t *testing.T) {
		err := DeleteDeployment(kubeConfig, "18321778186", "demo-deployment-nonexist")
		if !kerrors.IsNotFound(err) {
			t.Errorf("expect not found error got others, err: %v", err.Error())
		}
	})

	t.Run("create service", func(t *testing.T) {

		demoService := &apiv1.Service{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "demo-service",
				Namespace: "18321778186",
				Labels: map[string]string{
					"app": "demo",
				},
			},
			Spec: apiv1.ServiceSpec{
				Ports: []apiv1.ServicePort{{
					Name:     "http",
					Port:     8080,
					NodePort: 30080,
				}},
				Selector: map[string]string{
					"app": "demo",
				},
				Type: apiv1.ServiceTypeNodePort,
			},
		}
		err := CreateService(kubeConfig, "18321778186", demoService)
		assertNoErr(err, t)

	})

	t.Run("delete service", func(t *testing.T) {
		err := DeleteService(kubeConfig, "18321778186", "demo-service")
		assertNoErr(err, t)
	})
}

func TestGetOverview(t *testing.T) {
	_, err := GetClusterOverview(kubeConfig, "kube-system")
	assertNoErr(err, t)
}

func TestPatchNode(t *testing.T) {

	patchData := map[string]interface{}{"metadata": map[string]map[string]string{"annotations": {
		"node.beta.alibabacloud.com/autonomy": "false",
	}}}
	nodeName := "node1"

	_, err := PatchNode(kubeConfig, nodeName, patchData)
	assertNoErr(err, t)
}

func TestUser(t *testing.T) {

	t.Run("post user format not allowed: invalid phonenumber", func(t *testing.T) {

		err := CreateUser(kubeConfig, &UserSpec{
			Email:        "132@qq.com",
			Mobilephone:  "+1",
			Organization: "Tongji",
		})

		if !kerrors.IsInvalid(err) {
			t.Errorf("expect invalid error got others, err: %v", err.Error())
		}
	})

	t.Run("post existing user", func(t *testing.T) {

		err := CreateUser(kubeConfig, &UserSpec{
			Email:        "132@qq.com",
			Mobilephone:  "18321778186",
			Organization: "openyurt",
		})

		if !kerrors.IsAlreadyExists(err) {
			t.Errorf("expect already exist error got others, err: %v", err.Error())
		}
	})

	t.Run("post regular user", func(t *testing.T) {

		err := CreateUser(kubeConfig, &UserSpec{
			Email:        "132@qq.com",
			Mobilephone:  "18321778185",
			Organization: "openyurt",
		})

		assertNoErr(err, t)
	})

	t.Run("get user", func(t *testing.T) {
		_, err := GetUser(kubeConfig, "18321778186")
		assertNoErr(err, t)
	})

	t.Run("get non-exist user", func(t *testing.T) {
		_, err := GetUser(kubeConfig, "non")
		if !kerrors.IsNotFound(err) {
			t.Errorf("expect not found error got others, err: %v", err.Error())
		}
	})

	t.Run("delete user", func(t *testing.T) {
		err := DeleteUser(kubeConfig, "user-18321778185")
		assertNoErr(err, t)
	})
}
