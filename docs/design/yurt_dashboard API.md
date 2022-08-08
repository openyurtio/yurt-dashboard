> 注意：该文档中的设计在实现中可能有修改

文档中尚不明确的地方

1. `集群事件`展示哪些内容，使用哪个 API Server 接口
2. `nodepool` 中的`操作系统`, `状态` 字段含义

**_本文档由 Rap2 (https://github.com/thx/rap2-delos) 生成_**

**_本项目仓库：[http://rap2.taobao.org/repository/editor?id=290341](http://rap2.taobao.org/repository/editor?id=290341) _**

# openyurt_frontend (前端访问后端接口)

## 模块：Cluster

### 接口：集群状态综述

- 地址：/clusterOverview
- 类型：GET
- 状态码：200
- 简介："集群信息"界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476785&itf=2076198](http://rap2.taobao.org/repository/editor?id=290341&mod=476785&itf=2076198)
- 请求接口格式：

```
└─ namespace: String  (账户对应namespace)

```

- 返回接口格式：

```
└─ clusterStatus: Array
   ├─ kind: String  (资源类型)
   ├─ totalNum: Number  (资源总量)
   └─ healthyNum: Number  (正常资源数量)

```

### 接口：集群事件（含义不明确）

- 地址：/clusterEvents
- 类型：GET
- 状态码：200
- 简介：功能待定
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476785&itf=2077065](http://rap2.taobao.org/repository/editor?id=290341&mod=476785&itf=2077065)
- 请求接口格式：

```

```

- 返回接口格式：

```

```

## 模块：User

### 接口：注册

- 地址：/register
- 类型：POST
- 状态码：200
- 简介：创建用户 CR（用时可能较长）
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476786&itf=2076199](http://rap2.taobao.org/repository/editor?id=290341&mod=476786&itf=2076199)
- 请求接口格式：

```
├─ email: String
├─ phone: String
└─ organization: String

```

- 返回接口格式：

```
└─ token: String

```

### 接口：登录

- 地址：/login
- 类型：GET
- 状态码：200
- 简介：获取用户 CR，并校验 token
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476786&itf=2076575](http://rap2.taobao.org/repository/editor?id=290341&mod=476786&itf=2076575)
- 请求接口格式：

```
├─ email: String  (用户输入邮箱)
└─ token: String  (用户注册获取的token)

```

- 返回接口格式：

```
├─ spec: Object
│  ├─ kubeConfig: String  (连接集群的kubeConfig)
│  ├─ nodeAddScript: String  (节点加入集群脚本)
│  ├─ validPeriod: Number  (账户有效期)
│  ├─ maxNodeNum: Number  (账户最大拥有节点数)
│  └─ namespace: String  (账户对应namespace)
└─ status: Object
   ├─ nodeNum: Number  (账户已加入节点数)
   ├─ effectiveTime: String  (账户生效时间)
   └─ expired: Boolean  (账户是否过期)

```

## 模块：Node

### 接口：展示所有节点

- 地址：/nodes
- 类型：GET
- 状态码：200
- 简介：Node 界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476787&itf=2076200](http://rap2.taobao.org/repository/editor?id=290341&mod=476787&itf=2076200)
- 请求接口格式：

```
└─ token: String  (用户身份token)

```

- 返回接口格式：

```
├─ allNodes: Array (节点列表)
│  ├─ name: String  (node名称)
│  ├─ uid: String  (node实例ID)
│  ├─ ip: String  (node IP地址)
│  ├─ nodePool: String  (node所属节点池)
│  ├─ role: String  (node角色)
│  ├─ status: String  (node状态（通过conditions字段得到）)
│  ├─ nodeInfo: Object
│  │  ├─ kernelVersion: String
│  │  ├─ containerRuntimeVersion: String
│  │  ├─ osImage: String
│  │  ├─ operatingSystem: String
│  │  ├─ kubeletVersion: String
│  │  ├─ kubeProxyVersion: String
│  │  └─ atchitecture: String
│  ├─ nodeStatus: Object
│  │  ├─ cpu: String  (CPU 请求 限制 使用量)
│  │  └─ memory: String  (内存 请求 限制 使用量)
│  ├─ configuration: String  (node 配置)
│  └─ containerGroup: String  (容器组（预留字段，暂不支持）)
└─ createTime: String  (创建时间)

```

### 接口：展示所有节点池

- 地址：/nodepools
- 类型：GET
- 状态码：200
- 简介：NodePool 界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476787&itf=2077149](http://rap2.taobao.org/repository/editor?id=290341&mod=476787&itf=2077149)
- 请求接口格式：

```
└─ token: String  (用户身份token)

```

- 返回接口格式：

```
└─ items: Array
   ├─ name: String  (名称)
   ├─ type: String  (类型)
   ├─ nodeStatus: Object (节点信息)
   │  ├─ totalNum: Number
   │  └─ healthyNum: Number
   ├─ createTime: String  (创建时间)
   ├─ status: String  (节点池状态 （含义不明确）)
   └─ os: String  (操作系统（含义不明确）)

```

## 模块：Workload

### 接口：展示所有 deployments

- 地址：/deployments
- 类型：GET
- 状态码：200
- 简介：用于 工作负载-无状态 界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476936&itf=2076991](http://rap2.taobao.org/repository/editor?id=290341&mod=476936&itf=2076991)
- 请求接口格式：

```
├─ token: String  (用户身份token)
└─ namespace: String  (账户对应namespace)

```

- 返回接口格式：

```
└─ items: Array
   ├─ name: String  (名称)
   ├─ labels: String  (标签)
   ├─ createTime: String  (创建时间)
   ├─ image: Array (镜像)
   │  └─ image: String
   └─ status: Object (容器组数量)
      ├─ replicas: Number  (Total number of non-terminated pods targeted by this deployment (their labels match the selector).)
      └─ readyReplicas: Number  (Total number of ready pods targeted by this deployment.)

```

### 接口：展示所有 statefulsets

- 地址：/statefulsets
- 类型：GET
- 状态码：200
- 简介：用于 工作负载-有状态 界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476936&itf=2077216](http://rap2.taobao.org/repository/editor?id=290341&mod=476936&itf=2077216)
- 请求接口格式：

```
├─ token: String  (用户身份token)
└─ namespace: String  (用户对应namespace)

```

- 返回接口格式：

```
└─ items: Array
   ├─ name: String  (名称)
   ├─ labels: String  (标签)
   ├─ createTime: String  (创建时间)
   ├─ images: Array (镜像)
   │  └─ image: String
   └─ status: Object (容器组数量)
      ├─ replicas: Number  (replicas is the number of Pods created by the StatefulSet controller.)
      └─ readyReplicas: Number  (readyReplicas is the number of Pods created by the StatefulSet controller that have a Ready Condition.)

```

### 接口：展示所有 jobs

- 地址：/jobs
- 类型：GET
- 状态码：200
- 简介：用于 工作负载-任务 界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290341&mod=476936&itf=2077978](http://rap2.taobao.org/repository/editor?id=290341&mod=476936&itf=2077978)
- 请求接口格式：

```
├─ token: String  (用户身份token)
└─ namespace: String  (用户对应namespace)

```

- 返回接口格式：

```
└─ items: Array
   ├─ name: String  (Job 名称)
   ├─ tags: String  (标签)
   ├─ status: String  (状态 （由condition 得到）)
   ├─ podStatus: Object
   │  ├─ active: Number  (The number of actively running pods.)
   │  ├─ failed: Number  (The number of pods which reached phase Failed.)
   │  └─ succeeded: Number  (The number of pods which reached phase Succeeded.)
   ├─ images: Array (镜像)
   │  └─ image: String
   ├─ startTime: String  (创建时间)
   └─ completionTime: String  (完成时间)

```

---

**_本文档由 Rap2 (https://github.com/thx/rap2-delos) 生成_**

**_本项目仓库：[http://rap2.taobao.org/repository/editor?id=290344](http://rap2.taobao.org/repository/editor?id=290344) _**

# openyurt_backend （后端访问 API Server 接口）

## 模块：build-in resource

### 接口：list deployments

- 地址：/apis/apps/v1/namespaces/{namespace}/deployments
- 类型：GET
- 状态码：200
- 简介：Cluster Overview 界面、workload 详情界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076264](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076264)
- 请求接口格式：

```
└─ namespace: String  (账户对应namespace)

```

- 返回接口格式：

```
├─ kind: String
├─ apiVersion: String
├─ metadata: Object : Object
└─ items: Array
   ├─ kind: String
   ├─ apiVersion: String
   ├─ metadata: Object
   │  ├─ name: String
   │  ├─ namespace: String
   │  ├─ selfLink: String
   │  ├─ uid: String
   │  ├─ resourceVersion: String
   │  ├─ generation: Number
   │  ├─ creationTimestamp: String
   │  ├─ labels: Object
   │  │  └─ run: String
   │  └─ annotations: Object
   │     ├─ deployment.kubernetes.io/revision: String
   │     └─ replicatingperfection.net/push-image: String
   ├─ spec: Object
   │  ├─ replicas: Number
   │  ├─ selector: Object
   │  │  └─ matchLabels: Object
   │  │     └─ run: String
   │  ├─ template: Object
   │  │  ├─ metadata: Object
   │  │  │  ├─ creationTimestamp: Null
   │  │  │  └─ labels: Object
   │  │  │     ├─ auto-pushed-image-pwittrock/api-docs: String
   │  │  │     └─ run: String
   │  │  └─ spec: Object
   │  │     ├─ containers: Array
   │  │     │  ├─ name: String
   │  │     │  ├─ image: String
   │  │     │  ├─ resources: Object : Object
   │  │     │  ├─ terminationMessagePath: String
   │  │     │  └─ imagePullPolicy: String
   │  │     ├─ restartPolicy: String
   │  │     ├─ terminationGracePeriodSeconds: Number
   │  │     ├─ dnsPolicy: String
   │  │     └─ securityContext: Object : Object
   │  └─ strategy: Object
   │     ├─ type: String
   │     └─ rollingUpdate: Object
   │        ├─ maxUnavailable: Number
   │        └─ maxSurge: Number
   └─ status: Object
      ├─ observedGeneration: Number
      ├─ replicas: Number
      ├─ updatedReplicas: Number
      ├─ availableReplicas: Number
      └─ readyReplicas: Number

```

### 接口：list jobs

- 地址：/apis/batch/v1/namespaces/{namespace}/jobs
- 类型：GET
- 状态码：200
- 简介：Cluster Overview 界面、workload 详情界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076268](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076268)
- 请求接口格式：

```
└─ namespace: String

```

- 返回接口格式：

```
├─ kind: String
├─ apiVersion: String
├─ metadata: Object
│  ├─ selfLink: String
│  └─ resourceVersion: String
└─ items: Array
   ├─ metadata: Object
   │  ├─ name: String
   │  ├─ namespace: String
   │  ├─ selfLink: String
   │  ├─ uid: String
   │  ├─ resourceVersion: String
   │  └─ creationTimestamp: String
   ├─ spec: Object
   │  ├─ parallelism: Number
   │  ├─ completions: Number
   │  ├─ selector: Object
   │  │  └─ matchLabels: Object
   │  │     └─ controller-uid: String
   │  └─ template: Object
   │     ├─ metadata: Object
   │     │  ├─ name: String
   │     │  ├─ creationTimestamp: Null
   │     │  └─ labels: Object
   │     │     ├─ controller-uid: String
   │     │     └─ job-name: String
   │     └─ spec: Object
   │        ├─ containers: Array
   │        │  ├─ name: String
   │        │  ├─ image: String
   │        │  ├─ command: Array : Array
   │        │  ├─ resources: Object : Object
   │        │  ├─ terminationMessagePath: String
   │        │  └─ imagePullPolicy: String
   │        ├─ restartPolicy: String
   │        ├─ terminationGracePeriodSeconds: Number
   │        ├─ dnsPolicy: String
   │        └─ securityContext: Object : Object
   └─ status: Object
      ├─ startTime: String
      ├─ active: Number
      ├─ completionTime: String
      ├─ conditions: String  (JobCondition array)
      ├─ failed: Number
      └─ succeeded: Number

```

### 接口：list nodes

- 地址：/api/v1/nodes
- 类型：GET
- 状态码：200
- 简介：Cluster Overview 界面、Node 展示界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076270](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076270)
- 请求接口格式：

```

```

- 返回接口格式：

```
├─ kind: String
├─ apiVersion: String
├─ metadata: Object
│  ├─ selfLink: String
│  └─ resourceVersion: String
└─ items: Array
   ├─ metadata: Object
   │  ├─ name: String
   │  ├─ selfLink: String
   │  ├─ uid: String
   │  ├─ resourceVersion: String
   │  ├─ creationTimestamp: String
   │  ├─ labels: Object
   │  │  ├─ apps.openyurt.io/desired-nodepool: String
   │  │  ├─ apps.openyurt.io/nodepool: String
   │  │  ├─ beta.kubernetes.io/arch: String
   │  │  ├─ beta.kubernetes.io/os: String
   │  │  ├─ kubernetes.io/arch: String
   │  │  ├─ kubernetes.io/hostname: String
   │  │  ├─ kubernetes.io/os: String
   │  │  ├─ node-role.kubernetes.io/master: String
   │  │  └─ openyurt.io/is-edge-worker: String
   │  └─ annotations: Object
   │     ├─ flannel.alpha.coreos.com/backend-data: String
   │     ├─ flannel.alpha.coreos.com/backend-type: String
   │     ├─ flannel.alpha.coreos.com/kube-subnet-manager: String
   │     ├─ flannel.alpha.coreos.com/public-ip: String
   │     ├─ kubeadm.alpha.kubernetes.io/cri-socket: String
   │     ├─ node.alpha.kubernetes.io/ttl: String
   │     ├─ nodepool.openyurt.io/previous-attributes: String
   │     └─ volumes.kubernetes.io/controller-managed-attach-detach: String
   ├─ spec: Object
   │  ├─ podCIDR: String
   │  └─ podCIDRs: Array : Array
   └─ status: Object
      ├─ capacity: Object
      │  ├─ cpu: String
      │  ├─ ephemeral-storage: String
      │  ├─ hugepages-1Gi: String
      │  ├─ hugepages-2Mi: String
      │  ├─ memory: String
      │  └─ pods: String
      ├─ allocatable: Object
      │  ├─ cpu: String
      │  ├─ ephemeral-storage: String
      │  ├─ hugepages-1Gi: String
      │  ├─ hugepages-2Mi: String
      │  ├─ memory: String
      │  └─ pods: String
      ├─ conditions: Array
      │  ├─ type: Array : Array
      │  ├─ status: Array : Array
      │  ├─ lastHeartbeatTime: Array : Array
      │  ├─ lastTransitionTime: Array : Array
      │  ├─ reason: Array : Array
      │  └─ message: Array : Array
      ├─ addresses: Array
      │  ├─ type: Array : Array
      │  └─ address: Array : Array
      ├─ daemonEndpoints: Object
      │  └─ kubeletEndpoint: Object
      │     └─ Port: Number
      ├─ nodeInfo: Object
      │  ├─ machineID: String
      │  ├─ systemUUID: String
      │  ├─ bootID: String
      │  ├─ kernelVersion: String
      │  ├─ osImage: String
      │  ├─ containerRuntimeVersion: String
      │  ├─ kubeletVersion: String
      │  ├─ kubeProxyVersion: String
      │  ├─ operatingSystem: String
      │  └─ architecture: String
      └─ images: Array
         ├─ names: Array : Array
         └─ sizeBytes: Number

```

### 接口：list nodepools

- 地址：/apis/apps.openyurt.io/v1alpha1/nodepools
- 类型：GET
- 状态码：200
- 简介：NodePool 展示界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076271](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076271)
- 请求接口格式：

```

```

- 返回接口格式：

```
├─ apiVersion: String
├─ kind: String
├─ metadata: Object
│  ├─ continue: String
│  ├─ resourceVersion: String
│  └─ selfLink: String
└─ items: Array
   ├─ apiVersion: String
   ├─ kind: String
   ├─ metadata: Object
   │  ├─ annotations: Object
   │  │  └─ kubectl.kubernetes.io/last-applied-configuration: String
   │  ├─ creationTimestamp: String
   │  ├─ generation: Number
   │  ├─ name: String
   │  ├─ resourceVersion: String
   │  ├─ selfLink: String
   │  └─ uid: String
   ├─ spec: Object
   │  ├─ selector: Object
   │  │  └─ matchLabels: Object
   │  │     └─ apps.openyurt.io/nodepool: String
   │  └─ type: String
   └─ status: Object
      ├─ nodes: Array : Array
      ├─ readyNodeNum: Number
      └─ unreadyNodeNum: Number

```

### 接口：get user

- 地址：/apis/user.openyurt.io/v1alpha1/users/{user_name}
- 类型：GET
- 状态码：200
- 简介：用户登录，进行账号密码比对
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076272](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076272)
- 请求接口格式：

```
└─ username: String

```

- 返回接口格式：

```
├─ apiVersion: String
├─ kind: String
├─ metadata: Object
│  ├─ annotations: Object
│  │  └─ kubectl.kubernetes.io/last-applied-configuration: String
│  ├─ creationTimestamp: String
│  ├─ generation: Number
│  ├─ name: String
│  ├─ resourceVersion: String
│  ├─ selfLink: String
│  └─ uid: String
├─ spec: Object
│  ├─ email: String  (账户邮箱)
│  ├─ kubeConfig: String  (连接集群的kubeConfig)
│  ├─ maxNodeNum: Number  (账户最大拥有节点数)
│  ├─ mobilephone: String  (账户手机号)
│  ├─ namespace: String  (账户有权使用的namespace)
│  ├─ nodeAddScript: String  (节点加入集群的脚本)
│  ├─ organization: String  (账户组织)
│  ├─ token: String  (账户登录密码)
│  └─ validPeriod: Number  (账户有效期)
└─ status: Object
   ├─ nodeNum: Number  (账户已加入的节点数)
   ├─ expired: Boolean  (账户是否过期)
   └─ effectiveTime: String  (账户生效时间)

```

### 接口：post user

- 地址：/apis/user.openyurt.io/v1alpha1/users
- 类型：POST
- 状态码：200
- 简介：用户注册
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076273](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076273)
- 请求接口格式：

```
├─ Content-Type: String (必选)
├─ apiVersion: String (必选)
├─ kind: String (必选)
├─ metadata: Object
│  └─ name: String (必选) (用户名（具体以哪个用户字段相同待定）)
└─ spec: Object
   ├─ email: String (必选) (用户邮箱)
   ├─ mobilephone: String (必选) (用户手机号)
   └─ organization: String (必选) (用户组织)

```

- 返回接口格式：

```

```

### 接口：list statefulsets

- 地址：/apis/apps/v1/namespaces/{namespace}/statefulsets
- 类型：GET
- 状态码：200
- 简介：Cluster Overview 界面、workload 详情界面
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076274](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2076274)
- 请求接口格式：

```
└─ namespace: String

```

- 返回接口格式：

```
├─ kind: String
├─ apiVersion: String
├─ metadata: Object
│  ├─ selfLink: String
│  └─ resourceVersion: String
└─ items: Array
   ├─ metadata: Object
   │  ├─ name: String
   │  ├─ namespace: String
   │  ├─ selfLink: String
   │  ├─ uid: String
   │  ├─ resourceVersion: String
   │  ├─ generation: Number
   │  ├─ creationTimestamp: String
   │  └─ annotations: Object
   │     └─ kubectl.kubernetes.io/last-applied-configuration: String
   ├─ spec: Object
   │  ├─ replicas: Number
   │  ├─ selector: Object
   │  │  └─ matchLabels: Object
   │  │     └─ app: String
   │  ├─ template: Object
   │  │  ├─ metadata: Object
   │  │  │  ├─ creationTimestamp: Null
   │  │  │  └─ labels: Object
   │  │  │     └─ app: String
   │  │  └─ spec: Object
   │  │     ├─ containers: Array
   │  │     │  ├─ name: String
   │  │     │  ├─ image: String
   │  │     │  ├─ ports: Array
   │  │     │  │  ├─ name: String
   │  │     │  │  ├─ containerPort: Number
   │  │     │  │  └─ protocol: String
   │  │     │  ├─ resources: Object : Object
   │  │     │  ├─ volumeMounts: Array
   │  │     │  │  ├─ name: String
   │  │     │  │  └─ mountPath: String
   │  │     │  ├─ terminationMessagePath: String
   │  │     │  ├─ terminationMessagePolicy: String
   │  │     │  └─ imagePullPolicy: String
   │  │     ├─ restartPolicy: String
   │  │     ├─ terminationGracePeriodSeconds: Number
   │  │     ├─ dnsPolicy: String
   │  │     ├─ securityContext: Object : Object
   │  │     └─ schedulerName: String
   │  ├─ volumeClaimTemplates: Array
   │  │  ├─ kind: String
   │  │  ├─ apiVersion: String
   │  │  ├─ metadata: Object
   │  │  │  ├─ name: String
   │  │  │  └─ creationTimestamp: Null
   │  │  ├─ spec: Object
   │  │  │  ├─ accessModes: Array : Array
   │  │  │  ├─ resources: Object
   │  │  │  │  └─ requests: Object
   │  │  │  │     └─ storage: String
   │  │  │  └─ volumeMode: String
   │  │  └─ status: Object
   │  │     └─ phase: String
   │  ├─ serviceName: String
   │  ├─ podManagementPolicy: String
   │  ├─ updateStrategy: Object
   │  │  ├─ type: String
   │  │  └─ rollingUpdate: Object
   │  │     └─ partition: Number
   │  └─ revisionHistoryLimit: Number
   └─ status: Object
      ├─ observedGeneration: Number
      ├─ replicas: Number
      ├─ currentReplicas: Number
      ├─ updatedReplicas: Number
      ├─ currentRevision: String
      ├─ updateRevision: String
      ├─ collisionCount: Number
      └─ readyReplicas: Number

```

### 接口：post exist user

- 地址：/apis/user.openyurt.io/v1alpha1/users
- 类型：GET
- 状态码：409
- 简介：状态码是 409，表示要创建的 user 已经存在
- Rap 地址：[http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2078412](http://rap2.taobao.org/repository/editor?id=290344&mod=476802&itf=2078412)
- 请求接口格式：

```
├─ Content-Type: String
├─ apiVersion: String
├─ kind: String
├─ metadata: Object
│  └─ name: String
└─ spec: Object
   ├─ email: String
   ├─ mobilephone: String
   └─ organization: String

```

- 返回接口格式：

```
├─ kind: String
├─ apiVersion: String
├─ metadata: Object : Object
├─ status: String
├─ message: String
├─ reason: String
├─ details: Object
│  ├─ name: String
│  ├─ group: String
│  └─ kind: String
└─ code: Number

```
