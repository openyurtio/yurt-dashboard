import { Trans } from '@lingui/react/macro';
import { Tabs } from 'antd';
import { useUserProfile } from '../../utils/hooks';
import ConnectionInfo from './ConnectionInfo';
import ClusterOverview from './Overview';

const ClusterInfo = () => {
  const [userProfile] = useUserProfile();

  const tabItems = [
    {
      key: '1',
      label: <Trans>概览</Trans>,
      children: <ClusterOverview></ClusterOverview>,
    },
    ...(userProfile && userProfile.metadata.name !== 'admin' ? [
      {
        key: '3',
        label: <Trans>连接信息</Trans>,
        children: <ConnectionInfo></ConnectionInfo>,
      }
    ] : []),
  ];

  return (
    <div className="content">
      <h3><Trans>集群概览</Trans></h3>
      <div>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
};

export default ClusterInfo;
