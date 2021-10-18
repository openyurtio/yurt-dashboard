package main

type User struct {
	KubeConfig string `json:"kubeConfig"`
	Namespace  string `json:"namespace"`
}
