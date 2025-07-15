import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { Card, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { sendUserRequest } from '../../utils/request';
import { HalfPieChart, PieChart } from '../Utils/PieCharts';

const { Link } = Typography;

function getResourceStatus(clusterStatus, resourceName) {
  if (clusterStatus) {
    const res = clusterStatus.filter(item => item.Kind === resourceName && item.Status === true);
    return res.length > 0 ? res[0] : null;
  }
  return null;
}

export function Dashboard({ setConnStatus }) {
  const { _ } = useLingui();
  const [clusterStatus, setClusterStatus] = useState(null);

  useEffect(() => {
    sendUserRequest('/getOverview').then(res => {
      setClusterStatus(res);
      setConnStatus(res);
      const nodeStatus = getResourceStatus(res, 'nodes');
      if (nodeStatus && nodeStatus.TotalNum === 0) {
        message.info(
          <span>
            集群还空空如也？不如马上去<Link href="/nodes">添加一个节点</Link>吧
          </span>,
          5
        );
      }
    });
  }, [setConnStatus]);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      <Card
        className="cluster-card"
        style={{ maxWidth: 800, minWidth: 500 }}
        loading={clusterStatus == null}
      >
        <h3>
          <Trans>Application Status</Trans>
        </h3>
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
          }}
        >
          <PieChart name="Pod" status={getResourceStatus(clusterStatus, 'pods')}></PieChart>
          <PieChart
            name="Deployment"
            status={getResourceStatus(clusterStatus, 'deployments')}
          ></PieChart>

          <PieChart
            name="StatefulSet"
            status={getResourceStatus(clusterStatus, 'statefulsets')}
          ></PieChart>
        </div>
      </Card>
      <Card className="cluster-card" style={{ minWidth: 210 }} loading={clusterStatus == null}>
        <h3>
          <Trans>Node Status</Trans>
        </h3>
        <HalfPieChart status={getResourceStatus(clusterStatus, 'nodes')}></HalfPieChart>
      </Card>
    </div>
  );
}
