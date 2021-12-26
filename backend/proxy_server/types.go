package main

import (
	"fmt"
	client "yurt_console_backend/k8s_client"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

type User struct {
	KubeConfig string `json:"kubeConfig"`
	Namespace  string `json:"namespace"`
}

func (user *User) String() string {
	return fmt.Sprintf("kubeconfig: %s, namespace: %s", user.KubeConfig, user.Namespace)
}

var adminKubeConfig = client.GetAdminKubeConfig()

// the wordpress APP contains 2 parts (each has one deployment & one service)
// - MySQL database, storage service
// - WordPress Web app, wordpress web app needs mysql database service to run

const wordpress_mysql_delpoy_name string = "wordpress-mysql"

// get wordpress mysql deployment
func getWordPressMysqlDeployConfig(namespace string) interface{} {
	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: namespace,
			Name:      wordpress_mysql_delpoy_name,
			Labels: map[string]string{
				"app":  wordpress_mysql_delpoy_name,
				"type": "lab",
			},
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": wordpress_mysql_delpoy_name,
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": wordpress_mysql_delpoy_name,
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:            "mysql",
							Image:           "mysql:5.7",
							ImagePullPolicy: "IfNotPresent",
							Args: []string{
								"--default_authentication_plugin=mysql_native_password",
								"--character-set-server=utf8mb4",
								"--collation-server=utf8mb4_unicode_ci",
							},
							Ports: []apiv1.ContainerPort{
								{
									Name:          "dbport",
									ContainerPort: 3306,
								},
							},
							Env: []apiv1.EnvVar{
								{
									Name:  "MYSQL_ROOT_PASSWORD",
									Value: "rootPassW0rd",
								},
								{
									Name:  "MYSQL_DATABASE",
									Value: "wordpress",
								},
								{
									Name:  "MYSQL_USER",
									Value: "wordpress",
								},
								{
									Name:  "MYSQL_PASSWORD",
									Value: "wordpress",
								},
							},
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "db",
									MountPath: "/var/lib/mysql",
								},
							},
						},
					},
					Volumes: []apiv1.Volume{
						{
							Name: "db",
							VolumeSource: v1.VolumeSource{
								EmptyDir: &v1.EmptyDirVolumeSource{},
							},
						},
					},
				},
			},
		},
	}
}

// get wordpress web app deployment
func getWordPressDeploymentConfig(name, namespace string, replicas int) interface{} {
	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: namespace,
			Name:      name,
			Labels: map[string]string{
				"app":  "WordPress",
				"type": "lab",
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(int32(replicas)),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "WordPress",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "WordPress",
					},
				},
				Spec: apiv1.PodSpec{
					InitContainers: []apiv1.Container{
						{
							Name:  "init-db",
							Image: "busybox",
							Command: []string{
								"sh",
								"-c",
								fmt.Sprintf("until nslookup %s; do echo waiting for mysql service; sleep 2; done;", getAppServiceName(wordpress_mysql_delpoy_name)),
							},
						},
					},
					Containers: []apiv1.Container{
						{
							Name:  "wordpress",
							Image: "wordpress",
							Ports: []apiv1.ContainerPort{
								{
									Name:          "wdport",
									ContainerPort: 80,
								},
							},
							Env: []apiv1.EnvVar{
								{
									Name:  "WORDPRESS_DB_HOST",
									Value: fmt.Sprintf("%s:3306", getAppServiceName(wordpress_mysql_delpoy_name)),
								},
								{
									Name:  "WORDPRESS_DB_USER",
									Value: "wordpress",
								},
								{
									Name:  "WORDPRESS_DB_PASSWORD",
									Value: "wordpress",
								},
							},
						},
					},
				},
			},
		},
	}
}

// RSSHub app contains only one deployment & service

func getRsshubDeploymentConfig(name, namespace string, replicas int) interface{} {
	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: namespace,
			Name:      name,
			Labels: map[string]string{
				"app":  "RSSHub",
				"type": "lab",
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(int32(replicas)),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "RSSHub",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "RSSHub",
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  "rsshub",
							Image: "diygod/rsshub",
							Ports: []apiv1.ContainerPort{
								{
									ContainerPort: 1200,
								},
							},
						},
					},
				},
			},
		},
	}
}

// create a ClusterIP service based on the Lab appName
func getServiceConfig(appName, namespace string, port, targetPort int) interface{} {

	return &apiv1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      getAppServiceName(appName),
			Namespace: namespace,
			Labels: map[string]string{
				"type": "lab",
				"app":  appName,
			},
		},
		Spec: apiv1.ServiceSpec{
			Ports: []apiv1.ServicePort{{
				Name: "http",
				Port: int32(port),
				TargetPort: intstr.IntOrString{
					Type:   intstr.Int,
					IntVal: int32(targetPort),
				},
				Protocol: apiv1.ProtocolTCP,
			}},
			Selector: map[string]string{
				"app": appName,
			},
		},
	}
}
