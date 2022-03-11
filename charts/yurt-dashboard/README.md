
## Prepare Image

### Modify baseURL

Currently as `yurt-dashboard` not support custom backend url. We need to modify file `frontend/src/config.js`.
If you want expose the dashboard domain as `dashboard.yurt.epaas.domain`, you need to change the value as below:

```javascript
export const baseURL = "http://dashboard.yurt.epaas.domain:80/api";
```

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