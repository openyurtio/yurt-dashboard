import { Trans } from '@lingui/react/macro';
import { Table, Typography } from 'antd';
import { useResourceState } from '../../utils/hooks';
import { getNodepools } from '../../utils/request';
import { RefreshButton } from '../Utils/RefreshButton';

const { Paragraph, Link } = Typography;

const columns = [
  { title: <Trans>Name</Trans>, dataIndex: 'title' },
  { title: <Trans>Type</Trans>, dataIndex: 'type' },
  // {
  //   title: "状态",
  //   dataIndex: "state",
  //   render: (state) => (
  //     <div>
  //       <div
  //         className="cluster-status"
  //         style={{ backgroundColor: "#62CB35" }}
  //       />
  //       {state}
  //     </div>
  //   ),
  // },
  {
    title: <Trans>Node Count</Trans>,
    dataIndex: 'nodeStatus',
    render: nums => (
      <div>
        <span>
          <Trans>Total</Trans>:{nums['ready'] + nums['unready']}
        </span>{' '}
        &nbsp;
        <span>
          <Trans>Normal</Trans>:{nums['ready']}
        </span>{' '}
        &nbsp;
        <span>
          <Trans>Failed</Trans>:{nums['unready']}
        </span>
      </div>
    ),
  },
  { title: <Trans>Creation Time</Trans>, dataIndex: 'createTime' },
  // {
  //   title: "操作",
  //   dataIndex: "operations",
  //   render: () => (
  //     <div>
  //       <a>详情</a>|<a>添加已有节点</a>|<a>删除</a>
  //     </div>
  //   ),
  // },
];

// const mockDataItem = {
//   name: "default-nodepool",
//   type: "默认节点池",
//   state: "已激活",
//   nodeStatus: {
//     ready: 1,
//     unready: 0,
//   },
//   os: "AliyunLinux",
//   updateTime: "2021-08-10 19:19:22",
//   operations: "",
// };

const NodePool = () => {
  const [nps, handleRefresh] = useResourceState(getNodepools);

  return (
    <div>
      <h2>NodePool</h2>
      <Paragraph>
        <Trans>
          Node Pool is a capability designed by OpenYurt for edge resource management scenarios.
          Edge site resources can be classified according to geographical distribution and divided
          into different node pools.
        </Trans>
        <br />
        <Trans>
          At the application management level, OpenYurt has designed a complete application
          deployment model around node pools, such as:
        </Trans>
        <ul>
          <li>
            <Trans>Unitized Deployment:</Trans>
            <Link
              href="https://github.com/openyurtio/openyurt/blob/master/docs/enhancements/20201211-nodepool_uniteddeployment.md"
              target="_blank"
            >
              YurtAppSet
            </Link>
          </li>
          <li>
            <Trans>Unitized DaemonSet:</Trans>
            <Link
              href="https://github.com/openyurtio/openyurt/blob/master/docs/enhancements/20210729-yurtappdaemon.md"
              target="_blank"
            >
              YurtAppDaemon
            </Link>
          </li>
        </ul>
        <Trans>The experience center provides a simple</Trans>
        <Link
          href="https://openyurt.io/docs/installation/openyurt-experience-center/kubeconfig/#/"
          target="_blank"
        >
          <Trans>Example</Trans>
        </Link>
        <Trans>, demonstrating how to use node pools for unitized deployment.</Trans>
      </Paragraph>
      <RefreshButton refreshCallback={handleRefresh} />
      <Table
        loading={nps === null}
        columns={columns}
        dataSource={nps}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default NodePool;
