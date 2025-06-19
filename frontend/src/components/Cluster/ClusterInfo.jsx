import { Tabs } from 'antd';
import { useUserProfile } from '../../utils/hooks';
import ClusterOverview from './Overview';
import ConnectionInfo from './ConnectionInfo';
import { Trans } from '@lingui/react/macro';

const ClusterInfo = () => {
  const [userProfile] = useUserProfile();

  const tabItems = [
    {
      key: '1',
      label: '概览',
      children: <ClusterOverview></ClusterOverview>,
    },
    ...(userProfile && userProfile.metadata.name !== 'admin' ? [
      {
        key: '3',
        label: '连接信息',
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
