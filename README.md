yurt-dashboard is the web console for OpenYurt Novice Trial Platform.

> Notice: This repo can not run directly on your computer, because we have excluded some secret files from git.

```
|- backend              // Golang backend
    |-- k8s_client      // backend lib for requesting k8s
    |-- proxy_server    // backend api service
|- doc                  // project design doc
|- frontend             // React frontend
    |-- public
    |-- src
|- scripts              // cluster setup scripts
```
