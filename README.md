yurt-dashboard is the web console for OpenYurt Novice Trial Platform.

```
|- backend              // Golang backend
    |-- helm_client     // backend lib for requesting k8s using helm api
    |-- k8s_client      // backend lib for requesting k8s
    |-- proxy_server    // backend api service
|- config               // user controller setting files
|- doc
    |-- design          // project design doc
    |-- help            // how to use yurt-dashboard doc
|- frontend             // React frontend
    |-- public
    |-- src
|- scripts              // cluster setup scripts
```

## Get Started

### For dashboard developers

---

1. Prepare local development environment
   1. install yurt-dashboard dependencies
      - [Golang](https://go.dev/)
      - [Node.js](https://nodejs.dev/)
2. Install
   1. Start the backend server
      - The backend server needs a `kubeconfig` with admin privileges of your cluster set up in the last step, you need to provide it as a file located at `./backend/config/kubeconfig.conf`.
      - Start the backend server with `cd ./backend/proxy_server && go run .`
   2. How to play with the frontend
      - install frontend dependencies `cd ./frontend && npm install`
      - develop
        - if you want to modify frontend behavior
          - define environment variable `BASE_URL` (e.g. `http://ip:port`) for the backend service
          - (start a frontend dev server) `npm run start`
        - if you just want a web interface (don't need to debug frontend code), use
          `npm run build` to generate frontend files

### For dashboard users

---

1. Prepare local compilation environment
   - install dependencies
     - [Make](https://www.make.com/)
     - [Docker](https://www.docker.com/)
2. Build the image
   - Use `make docker-build` to build the image. The generated image defaults to `openyurt/yurt-dashboard:latest`.
3. Install
   1. Upload the image to the kubernetes node and label the node `openyurt.io/is-edge-worker: false`.
   2. Install. `helm upgrade --install yurt-dashboard ./charts/yurt-dashboard -n kube-system`.
4. Access
   - An ingress resource is automatically installed by default. If you already have an ingress-controller, you can access the dashboard through `dashboard.yurt.local`.
   - If you don't want to use ingress, you can simply set `dashboard.service.type` in the `values.yaml` to `NodePort` and add the `nodePort` configuration. You can then access the dashboard by accessing the cluster IP and the configured nodePort value. The configuration example is as follows:
      ```yaml
      # values.yaml
      dashboard:
         service:
            type: NodePort
            nodePort: 30000
            port: 80
      
      # Access through http://clusterip:30000
      ```
   - Or you can create a temporary service exposure by using `kubectl port-forward service/yurt-dashboard --address 0.0.0.0 30000:80 -n kube-system` and access the panel through `http://clusterip:30000`.

## Documentation

- [x] [OpenYurt Experience Center overall introduction](https://openyurt.io/docs/next/installation/openyurt-experience-center/overview)
- [x] [How to create an account in the experience center and get an out-of-box OpenYurt cluster](https://openyurt.io/docs/next/installation/openyurt-experience-center/user)
- [x] [How to join an user's node to the cluster and quickly deploy an app with one click](https://openyurt.io/docs/next/installation/openyurt-experience-center/web_console)
- [x] [How to use `kubeconfig` to experience OpenYurt capabilities](https://openyurt.io/docs/next/installation/openyurt-experience-center/kubeconfig)

## Todo List

The features which will be added into the yurt-dashboard are outlined here. Welcome to claim any of these!

| Task                                                                                               | Description                                                                                    | Assigned to | Current Status | priority (1-3) |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- | -------------- | -------------- |
| [Node status monitor](https://github.com/openyurtio/yurt-dashboard/issues/4)                       | display mem/CPU status of the node in the web interface Node panel                             |             | not assigned   | 1              |
| [Delete & Create resource from web console](https://github.com/openyurtio/yurt-dashboard/issues/6) |                                                                                                |             | not assigned   | 2              |
| [User experience optimization](https://github.com/openyurtio/yurt-dashboard/issues/8)              | e.g. display information about how many users or nodes are active                              |             | not assigned   | 2              |
| [Lab page refactor](https://github.com/openyurtio/yurt-dashboard/issues/9)                         | organize this page with OpenYurt's feature, e.g. Node autonomy; nodepool and united deployment |             | not assigned   | 3              |

## Contribute

You can pick any unassigned task in which you are interested and find the corresponding issue in this repository to let us know your interests. After that, you can follow the instructions from `Get Started` section to set up your local development environment.

By the way, we highly recommend to read the [contributing guide](https://github.com/openyurtio/openyurt/blob/master/CONTRIBUTING.md) through before making contributions.

## Contact

You can directly create an issue here or find the developer in the following group:

- Mailing List: openyurt@googlegroups.com
- Slack: [channel](https://join.slack.com/t/openyurt/shared_invite/zt-iw2lvjzm-MxLcBHWm01y1t2fiTD15Gw)
- Dingtalk Group (钉钉讨论群)

<div align="left">
    <img src="https://github.com/openyurtio/openyurt/blob/master/docs/img/ding.jpg" width=25% title="dingtalk">
</div>
