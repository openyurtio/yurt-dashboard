import { Trans } from '@lingui/react/macro';
import CompleteGuide from './Complete';
import ConnectClusterGuide from './ConnectCluster';
import OpenYurtAppGuide from './OpenYurtApp';

export const GuideSteps = [
  {
    key: 'ConnectCluster',
    title: <Trans>集群接入</Trans>,
    Content: attr => <ConnectClusterGuide {...attr} />,
  },
  {
    key: 'OpenYurtApp',
    title: <Trans>组件安装</Trans>,
    Content: attr => <OpenYurtAppGuide {...attr} />,
  },
  {
    key: 'Complete',
    title: <Trans>完成</Trans>,
    Content: attr => <CompleteGuide {...attr} />,
  },
];
