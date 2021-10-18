import { baseURL, userProfile } from "../config";
import { message } from "antd";
import { toPercentagePresentation, formatTime } from "./utils";

export function sendRequest(path, data) {
  return fetch(baseURL + path, {
    body: JSON.stringify({ ...data, ...userProfile.spec }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then((res) => {
      if ("status" in res) {
        // throw failed resp error
        throw new Error(res["msg"]);
      }
      return res;
    })
    .catch((err) => {
      // catch request error
      message.error(err.message);
    })
    .then((res) => {
      if (res && !("status" in res)) {
        return res;
      } else {
        // return empty array to keep interface consistency
        return { items: [], filter: () => [], status: "failed" };
      }
    });
}

// transform common attributes of an object for presentation
const transformObject = (object, i) => ({
  key: i,
  title: object.metadata.name,
  tag: object.metadata.labels,
  createTime: formatTime(object.metadata.creationTimestamp),
  status: object.status,
  annotations: object.metadata.annotations,
});

export function getNodepools(paras) {
  const trasnform = (rawNodePool, i) => {
    return {
      ...transformObject(rawNodePool, i),
      type: rawNodePool.spec.type,
      nodeStatus: {
        ready: rawNodePool.status.readyNodeNum,
        unready: rawNodePool.status.unreadyNodeNum,
      },
    };
  };

  return sendRequest("/getNodepools", paras).then((nps) =>
    nps.items.map(trasnform)
  );
}

export function getNodes(paras) {
  const transform = (rawNode, i) => {
    const nodePoolKey = "apps.openyurt.io/nodepool";
    const nodeRoleKey = "node-role.kubernetes.io/master";
    const getNodeCondition = (rawNode) =>
      rawNode.status.conditions
        .filter((item) => item.status === "True")
        .map((item) => item.type)
        .join(",");

    return {
      ...transformObject(rawNode, i),
      // overwrite transformObject's title
      title: {
        Name: rawNode.metadata.name,
        IP: rawNode.status.addresses[0].address,
        uid: rawNode.metadata.uid,
      },
      nodePool:
        nodePoolKey in rawNode.metadata.labels
          ? rawNode.metadata.labels[nodePoolKey]
          : "无",
      role: {
        role: nodeRoleKey in rawNode.metadata.labels ? "master" : "node",
        condition: getNodeCondition(rawNode),
      },
      config: {
        CPU: rawNode.status.capacity.cpu,
        Mem: rawNode.status.capacity.memory,
        Storage: rawNode.status.capacity["ephemeral-storage"],
      },
      status: {
        CPU: toPercentagePresentation(
          parseFloat(rawNode.status.allocatable.cpu) /
            parseFloat(rawNode.status.capacity.cpu)
        ),
        Mem: toPercentagePresentation(
          parseFloat(rawNode.status.allocatable.memory) /
            parseFloat(rawNode.status.capacity.memory)
        ),
      },
      version: {
        Kubelet: rawNode.status.nodeInfo.kubeletVersion,
        Runtime: rawNode.status.nodeInfo.containerRuntimeVersion,
        OS: rawNode.status.nodeInfo.osImage,
      },
    };
  };

  return sendRequest("/getNodes", paras).then((nodes) =>
    nodes.items.map(transform)
  );
}

// customized transform for workloads
const transformWorkload = (workload, i) => ({
  ...transformObject(workload, i),
  image: workload.spec.template.spec.containers.map(
    (container) => container.image
  ),
});

export function getDeployments(paras) {
  return sendRequest("/getDeployments", paras).then((dps) =>
    dps.items.map(transformWorkload)
  );
}

export function getStatefulSets(paras) {
  return sendRequest("/getStatefulsets", paras).then((ss) =>
    ss.items.map(transformWorkload)
  );
}

export function getJobs(paras) {
  const transform = (job, i) => {
    return {
      ...transformWorkload(job, i),
      completeTime: formatTime(job.status.completionTime),
      podStatus: {
        succeeded: job.status.succeeded,
        failed: job.status.failed,
        active: job.status.active,
      },
      jobStatus: job.status.failed == 0 ? "正常" : "异常",
    };
  };

  return sendRequest("/getJobs", paras).then((jobs) =>
    jobs.items.map(transform)
  );
}

export function getPods(paras) {
  const transform = (pod, i) => ({
    ...transformObject(pod, i),
    containers: pod.spec.containers.map((container) => container.image),
    node: {
      Name: pod.spec.nodeName,
      IP: pod.status.hostIP,
    },
    title: {
      Name: pod.metadata.name,
      IP: pod.status.podIP,
      uid: pod.metadata.uid,
    },
    podStatus: pod.status.phase,
  });

  return sendRequest("/getPods", paras).then((pods) =>
    pods.items.map(transform)
  );
}
