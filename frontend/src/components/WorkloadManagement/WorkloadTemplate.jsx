import STable from "../Utils/SelectableTable";
import { Input } from "antd";
import { renderDictCell } from "../../utils/utils";
import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useResourceState } from "../../utils/hooks";

const columns = [
  {
    title: "名称",
    dataIndex: "title",
  },
  {
    title: "标签",
    dataIndex: "tag",
    render: (dp) => renderDictCell(dp),
  },
  {
    title: "容器组数量",
    dataIndex: "status",
    render: (status) => {
      return (
        <div>
          {status.readyReplicas ? status.readyReplicas : 0}/{status.replicas}
        </div>
      );
    },
  },
  {
    title: "镜像",
    dataIndex: "image",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
  },
  // {
  //   title: "操作",
  //   dataIndex: "operation",
  //   render: () => (
  //     <div>
  //       <a>详情</a> |<a>编辑</a> |<a>伸缩</a> |<a>监控</a> | <a>更多</a>
  //     </div>
  //   ),
  // },
];

/**
 * Workload is a template component for all workload management panels
 * @param {String} title: display title
 * @param {Object}    table.columns: if not specified use default columns
 * @param {Function}  table.fetchData: called when component is constructed or refresh button is clicked
 */
export default function Workload({ title, table }) {
  const [tableData, onRefresh] = useResourceState(table && table.fetchData);

  // filter components
  const [inputVal, setInput] = useState("");
  const filterComponents = (
    <div style={{ display: "inline-block" }}>
      <Input
        placeholder="search title"
        value={inputVal}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: 180 }}
        suffix={<SearchOutlined />}
      />
    </div>
  );

  return (
    <div>
      <div>
        <h2>{title}</h2>
      </div>

      <STable
        config={{
          columns: table && table.columns ? table.columns : columns,
          data:
            tableData &&
            tableData.filter((row) =>
              typeof row.title === "string"
                ? row.title.indexOf(inputVal) >= 0
                : JSON.stringify(row.title).indexOf(inputVal) >= 0
            ),
          filterComponents,
          onRefresh: () => {
            setInput("");
            onRefresh();
          },
        }}
      />
    </div>
  );
}
