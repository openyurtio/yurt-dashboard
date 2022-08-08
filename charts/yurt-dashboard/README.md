## Prepare Image

### Build Image

Execute command `make docker-build`, generate docker image.

### Push Image

Execute command `make docker-push`, push docker image to remote repository.

## Deploy Dashboard

```shell

cd charts

cat<<EOF > dashboard.yaml
dashboard:
  image:
    pullPolicy: IfNotPresent
    repository: huiwq1990/yurt-dashboard
    tag: latest
  ingress:
    host: dashboard.yurt.epaas.domain
EOF

helm template yurt-dashboard ./yurt-dashboard -f dashboard.yaml
```
