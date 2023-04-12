###
# This script is used for initializing the configuration for a kubernetes cluster
# ./k8s_config.sh [hostname]
###

# disable swap
sed -i '/swap/d' /etc/fstab
sudo swapoff -a

# change hostname
hostnamectl set-hostname $1

# let ip_table see bridged network
sudo modprobe br_netfilter
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system

# open required ports
# firewall-cmd --reload
# firewall-cmd --list-ports

# install docker
sudo yum install -y yum-utils
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce-19.03.15 docker-ce-cli-19.03.15 containerd.io
sudo systemctl start  docker

# config cgroup driver
mkdir /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2",
  "registry-mirrors":["https://b9pmyelo.mirror.aliyuncs.com"]
}
EOF

# config docker proxy
mkdir /etc/systemd/system/docker.service.d && \
cat <<EOF | sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="NO_PROXY=localhost,127.0.0.0/8"
EOF

sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# install k8s components
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
# Set SELinux in permissive mode (effectively disabling it)
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
yum install -y kubelet-1.18.8 kubeadm-1.18.8 kubectl-1.18.8
systemctl enable kubelet && systemctl start kubelet


# install cluster containers
IMAGE_REPO=registry.aliyuncs.com/google_containers
TARGET_REPO=registry.k8s.io
Containers=("kube-apiserver:v1.18.8" "kube-controller-manager:v1.18.8" "kube-scheduler:v1.18.8" "kube-proxy:v1.18.8" "pause:3.2" "etcd:3.4.3-0" "coredns:1.6.7")

for container in ${Containers[*]}; do
  echo $IMAGE_REPO/$container
  docker pull $IMAGE_REPO/$container
  docker tag $IMAGE_REPO/$container $TARGET_REPO/$container
done