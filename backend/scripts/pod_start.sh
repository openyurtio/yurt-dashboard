
mkdir -p /openyurt/backend/
mkdir -p /openyurt/config/

server=https://kubernetes
ca=$(base64 -w 0 /run/secrets/kubernetes.io/serviceaccount/ca.crt)
token=$(cat /run/secrets/kubernetes.io/serviceaccount/token)

echo "
apiVersion: v1
kind: Config
clusters:
- name: default-cluster
  cluster:
    certificate-authority-data: ${ca}
    server: ${server}
contexts:
- name: default-context
  context:
    cluster: default-cluster
    namespace: default
    user: default-user
current-context: default-context
users:
- name: default-user
  user:
    token: ${token}
" > /openyurt/config/kubeconfig.conf

cd /openyurt/backend/
./apiserver