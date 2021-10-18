import { Table } from "antd";
import { getNodepools } from "../../utils/request";
import { useResourceState } from "../../utils/utils";
import { RefreshButton } from "../Utils/RefreshButton";

const columns = [
  { title: "名称", dataIndex: "title" },
  { title: "类型", dataIndex: "type" },
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
    title: "节点数",
    dataIndex: "nodeStatus",
    render: (nums) => (
      <div>
        <span>总计:{nums["ready"] + nums["unready"]}</span> &nbsp;
        <span>正常:{nums["ready"]}</span> &nbsp;
        <span>失败:{nums["unready"]}</span>
      </div>
    ),
  },
  // { title: "操作系统", dataIndex: "os" },
  { title: "创建时间", dataIndex: "createTime" },
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

const mockDataItem = {
  name: "default-nodepool",
  type: "默认节点池",
  state: "已激活",
  nodeStatus: {
    ready: 1,
    unready: 0,
  },
  os: "AliyunLinux",
  updateTime: "2021-08-10 19:19:22",
  operations: "",
};

const NodePool = () => {
  const [nps, handleRefresh] = useResourceState(getNodepools);

  return (
    <div>
      <h2>NodePool</h2>
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
