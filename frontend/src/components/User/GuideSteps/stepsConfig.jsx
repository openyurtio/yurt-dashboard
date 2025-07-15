import { Trans } from '@lingui/react/macro';
import CompleteGuide from './Complete';
import ConnectClusterGuide from './ConnectCluster';
import OpenYurtAppGuide from './OpenYurtApp';

export const GuideSteps = [
  {
    key: 'ConnectCluster',
    title: <Trans>Cluster Access</Trans>,
    Content: attr => <ConnectClusterGuide {...attr} />,
  },
  {
    key: 'OpenYurtApp',
    title: <Trans>Component Installation</Trans>,
    Content: attr => <OpenYurtAppGuide {...attr} />,
  },
  {
    key: 'Complete',
    title: <Trans>Complete</Trans>,
    Content: attr => <CompleteGuide {...attr} />,
  },
];
