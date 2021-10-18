import Workload from "./WorkloadTemplate";
import { Status } from "../Utils/Status";
import { getPods } from "../../utils/request";
import { renderDictCell, useResourceState } from "../../utils/utils";

const columns = [
  {
    title: "名称/IP地址/实例 ID",
    dataIndex: "title",
    render: (pod) => {
      return (
        <div>
          <div>{pod.Name}</div>
          <div>{pod.IP}</div>
          <div>{pod.uid}</div>
        </div>
      );
    },
  },
  {
    title: "标签",
    dataIndex: "tag",
    render: (pod) => renderDictCell(pod),
  },
  {
    title: "状态",
    dataIndex: "podStatus",
    render: (state) => <Status status={state}></Status>,
  },
  {
    title: "节点",
    dataIndex: "node",
    render: (pod) => renderDictCell(pod),
  },
  {
    title: "镜像",
    dataIndex: "containers",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
];

export default function Pod() {
  const [pods, onRefresh] = useResourceState(getPods);

  return (
    <Workload
      title="Pod"
      table={{
        data: pods,
        columns,
        onRefresh: onRefresh,
      }}
    />
  );
}
