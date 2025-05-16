import { Table, Typography } from 'antd';
import { getNodepools } from '../../utils/request';
import { useResourceState } from '../../utils/hooks';
import { RefreshButton } from '../Utils/RefreshButton';

const { Paragraph, Link } = Typography;

const columns = [
  { title: '名称', dataIndex: 'title' },
  { title: '类型', dataIndex: 'type' },
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
    title: '节点数',
    dataIndex: 'nodeStatus',
    render: nums => (
      <div>
        <span>总计:{nums['ready'] + nums['unready']}</span> &nbsp;
        <span>正常:{nums['ready']}</span> &nbsp;
        <span>失败:{nums['unready']}</span>
      </div>
    ),
  },
  { title: '创建时间', dataIndex: 'createTime' },
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
        节点池是OpenYurt为边缘资源管理场景设计的能力。边缘站点资源可以根据地域分布进行分类，划分到不同的节点池中。
        <br />
        在应用管理层面，OpenYurt围绕节点池设计了一整套应用部署模型，例如：
        <ul>
          <li>
            单元化部署：
            <Link
              href="https://github.com/openyurtio/openyurt/blob/master/docs/enhancements/20201211-nodepool_uniteddeployment.md"
              target="_blank"
            >
              YurtAppSet
            </Link>
          </li>
          <li>
            单元化DaemonSet：
            <Link
              href="https://github.com/openyurtio/openyurt/blob/master/docs/enhancements/20210729-yurtappdaemon.md"
              target="_blank"
            >
              YurtAppDaemon
            </Link>
          </li>
        </ul>
        体验中心提供了一个简单的
        <Link
          href="https://openyurt.io/docs/installation/openyurt-experience-center/kubeconfig/#/"
          target="_blank"
        >
          示例
        </Link>
        ，展示如何使用节点池来进行单元化部署。
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
