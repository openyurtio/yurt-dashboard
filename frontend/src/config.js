import SystemApp from './components/AppManagement/SystemApp';
import ClusterInfo from './components/Cluster/ClusterInfo';
import Lab from './components/Lab/Lab';
import NodePool from './components/NodeManagement/NodePool';
import Nodes from './components/NodeManagement/Nodes';
import Entry from './components/User/Entry';
import Deployment from './components/WorkloadManagement/Deployment';
import Job from './components/WorkloadManagement/Job';
import Pod from './components/WorkloadManagement/Pod';
import StatefulSet from './components/WorkloadManagement/StatefulSet';

export const routes = [
  {
    path: '/clusterInfo',
    main: () => <ClusterInfo />,
  },
  {
    path: '/deployment',
    main: () => <Deployment />,
  },
  {
    path: '/nodes',
    main: () => <Nodes />,
  },
  {
    path: '/login',
    main: () => <Entry />,
  },
  {
    path: '/nodepool',
    main: () => <NodePool />,
  },
  {
    path: '/statefulset',
    main: () => <StatefulSet />,
  },
  {
    path: '/job',
    main: () => <Job />,
  },
  {
    path: '/pod',
    main: () => <Pod />,
  },
  {
    path: '/lab',
    main: () => <Lab />,
  },
  {
    path: '/systemapp',
    type: 'admin',
    main: () => <SystemApp />,
  },
];

// use baseurl defined by the environment variable (Only for debug purpose)
// or use default (browser location url) if not defined
export const baseURL = import.meta.env.VITE_BASE_URL || window.location.origin;
