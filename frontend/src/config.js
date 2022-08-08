import ClusterInfo from "./components/Cluster/ClusterInfo";
import Deployment from "./components/WorkloadManagement/Deployment";
import Nodes from "./components/NodeManagement/Nodes";
import Login from "./components/User/Login";
import NodePool from "./components/NodeManagement/NodePool";
import StatefulSet from "./components/WorkloadManagement/StatefulSet";
import Job from "./components/WorkloadManagement/Job";
import Pod from "./components/WorkloadManagement/Pod";
import Lab from "./components/Lab/Lab";

export const routes = [
  {
    path: "/clusterInfo",
    main: () => <ClusterInfo></ClusterInfo>,
  },
  {
    path: "/deployment",
    main: () => <Deployment></Deployment>,
  },
  {
    path: "/nodes",
    main: () => <Nodes></Nodes>,
  },
  {
    path: "/login",
    main: () => <Login></Login>,
  },
  {
    path: "/nodepool",
    main: () => <NodePool></NodePool>,
  },
  {
    path: "/statefulset",
    main: () => <StatefulSet></StatefulSet>,
  },
  {
    path: "/job",
    main: () => <Job></Job>,
  },
  {
    path: "/pod",
    main: () => <Pod></Pod>,
  },
  {
    path: "/lab",
    main: () => <Lab></Lab>,
  },
];

// use baseurl defined by the environment variable  (Only for debug purpose)
// or use default (browser location url) if not defined
export const baseURL = process.env.BASE_URL
  ? process.env.BASE_URL
  : window.location.origin;
