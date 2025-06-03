import ConnectClusterGuide from './ConnectCluster';
import OpenYurtAppGuide from './OpenYurtApp';
import CompleteGuide from './Complete';

export const GuideSteps = [
  {
    key: 'ConnectCluster',
    title: '集群接入',
    Content: attr => <ConnectClusterGuide {...attr} />,
  },
  {
    key: 'OpenYurtApp',
    title: '组件安装',
    Content: attr => <OpenYurtAppGuide {...attr} />,
  },
  {
    key: 'Complete',
    title: '完成',
    Content: attr => <CompleteGuide {...attr} />,
  },
];
