import { Trans } from '@lingui/react/macro';
import { Table, Typography } from 'antd';
import { useResourceState } from '../../utils/hooks';
import { getNodepools } from '../../utils/request';
import { RefreshButton } from '../Utils/RefreshButton';

const { Paragraph, Link } = Typography;

const columns = [
  { title: <Trans>名称</Trans>, dataIndex: 'title' },
  { title: <Trans>类型</Trans>, dataIndex: 'type' },
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
    title: <Trans>节点数</Trans>,
    dataIndex: 'nodeStatus',
    render: nums => (
      <div>
        <span><Trans>总计</Trans>:{nums['ready'] + nums['unready']}</span> &nbsp;
        <span><Trans>正常</Trans>:{nums['ready']}</span> &nbsp;
        <span><Trans>失败</Trans>:{nums['unready']}</span>
      </div>
    ),
  },
  { title: <Trans>创建时间</Trans>, dataIndex: 'createTime' },
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
        <Trans>节点池是OpenYurt为边缘资源管理场景设计的能力。边缘站点资源可以根据地域分布进行分类，划分到不同的节点池中。</Trans>
        <br />
        <Trans>在应用管理层面，OpenYurt围绕节点池设计了一整套应用部署模型，例如：</Trans>
        <ul>
          <li>
            <Trans>单元化部署：</Trans>
            <Link
              href="https://github.com/openyurtio/openyurt/blob/master/docs/enhancements/20201211-nodepool_uniteddeployment.md"
              target="_blank"
            >
              YurtAppSet
            </Link>
          </li>
          <li>
            <Trans>单元化DaemonSet：</Trans>
            <Link
              href="https://github.com/openyurtio/openyurt/blob/master/docs/enhancements/20210729-yurtappdaemon.md"
              target="_blank"
            >
              YurtAppDaemon
            </Link>
          </li>
        </ul>
        <Trans>体验中心提供了一个简单的</Trans>
        <Link
          href="https://openyurt.io/docs/installation/openyurt-experience-center/kubeconfig/#/"
          target="_blank"
        >
          <Trans>示例</Trans>
        </Link>
        <Trans>，展示如何使用节点池来进行单元化部署。</Trans>
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
