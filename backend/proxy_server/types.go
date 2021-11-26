package main

import (
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

var adminKubeConfig = client.GetAdminKubeConfig()

func getWorkPressDeploymentConfig(name, namespace string, replicas int) interface{} {
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
									Value: "localhost:3306",
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

func getServiceConfig(appName, namespace string, port int) interface{} {

	var targetPort = 80

	if appName == "RSSHub" {
		targetPort = 1200
	}

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
				Port: 80,
				TargetPort: intstr.IntOrString{
					Type:   intstr.Int,
					IntVal: int32(targetPort),
				},
				NodePort: int32(port),
			}},
			Selector: map[string]string{
				"app": appName,
			},
			Type: apiv1.ServiceTypeNodePort,
		},
	}
}

func getTTRssDeploymentConifg(name, namespace string, replicas int) interface{} {
	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: namespace,
			Name:      name,
			Labels: map[string]string{
				"app":  "TinyTinyRSS",
				"type": "lab",
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(int32(replicas)),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "TinyTinyRSS",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "TinyTinyRSS",
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  "ttrss",
							Image: "wangqiru/ttrss:latest",
							Ports: []apiv1.ContainerPort{
								{
									ContainerPort: 80,
									HostPort:      181,
								},
							},
							Env: []apiv1.EnvVar{
								{
									Name:  "DB_PASS",
									Value: "ttrss",
								},
								{
									Name:  "PUID",
									Value: "1000",
								},
								{
									Name:  "PGID",
									Value: "1000",
								},
								{
									Name:  "SELF_URL_PATH",
									Value: "http://localhost:181/",
								},
							},
							Stdin: true,
							TTY:   true,
						},
						{
							Name:  "postgres",
							Image: "postgres:13-alpine",
							Env: []apiv1.EnvVar{
								{
									Name:  "POSTGRES_PASSWORD",
									Value: "ttrss",
								},
							},
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "db",
									MountPath: "/var/lib/postgresql/data",
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
