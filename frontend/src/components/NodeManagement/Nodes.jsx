import { Input, Select } from "antd";
import { useEffect, useState } from "react";
import { getNodes, getNodepools } from "../../utils/request";
import RSelect from "../Utils/RefreshableSelect";
import STable from "../Utils/SelectableTable";
import { renderDictCell } from "../../utils/utils";
import { Status } from "../Utils/Status";

const { Option } = Select;
const { Search } = Input;

const columns = [
  {
    title: "名称/IP地址/实例 ID",
    dataIndex: "title",
    render: (node) => {
      return (
        <div>
          <div>{node.Name}</div>
          <div>{node.IP}</div>
          <div>{node.uid}</div>
        </div>
      );
    },
  },
  {
    title: "所属节点池",
    dataIndex: "nodePool",
  },
  {
    title: "角色/状态",
    dataIndex: "role",
    render: (node) => (
      <div>
        {node.role}
        <Status status={node.condition} />
      </div>
    ),
  },
  {
    title: "节点配置",
    dataIndex: "config",
    render: (node) => renderDictCell(node),
  },
  {
    title: "节点状态",
    dataIndex: "status",
    render: (node) => renderDictCell(node),
  },
  {
    title: "Kubelet版本/Runtime版本/OS版本",
    dataIndex: "version",
    render: (node) => renderDictCell(node),
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
  //       <a>监控</a> | <a>更多</a>
  //     </div>
  //   ),
  // },
];

const options = [
  { content: "名称", dataIndex: "title" },
  { content: "标签", dataIndex: "labels" },
  { content: "标注", dataIndex: "annotations" },
];

export default function Nodes() {
  // for filter components
  const [searchOption, setOption] = useState("title");
  const [searchValue, setSearchVal] = useState("");
  const [selectedNp, setNp] = useState("所有节点池");

  const [allNodes, setAllNodes] = useState(null);
  const [nodes, setNodes] = useState(allNodes); // display nodes

  // refresh the whole table, reset all filter options
  function onRefresh() {
    setSearchVal("");
    setOption("title");
    setNp("所有节点池");
    getNodes().then((nodes) => {
      setAllNodes(nodes);
      setNodes(nodes);
    });
  }

  useEffect(() => {
    onRefresh();
  }, []);

  const filterNodes = (searchContent, selectedNodePool) => {
    let filterValue = searchContent ? searchContent : searchValue;
    let filterNp = selectedNodePool ? selectedNodePool : selectedNp;

    setNodes(
      allNodes &&
        allNodes
          .filter(
            // filter by search value
            (node) =>
              JSON.stringify(node[searchOption]).indexOf(filterValue) >= 0
          )
          .filter(
            // filter by selected nodepool
            (node) => filterNp === "所有节点池" || node.nodePool === filterNp
          )
    );
  };

  const onSearch = (searchContent) => {
    filterNodes(searchContent);
  };

  const filterComponents = (
    <div style={{ display: "inline-block" }}>
      <Select
        defaultValue={searchOption}
        style={{ width: 80 }}
        onChange={(val) => setOption(val)}
      >
        {options.map((e, i) => (
          <Option key={i} value={e.dataIndex}>
            {e.content}
          </Option>
        ))}
      </Select>
      <Search
        placeholder="input search text"
        onSearch={onSearch}
        style={{ width: 200 }}
        value={searchValue}
        onChange={(e) => setSearchVal(e.target.value)}
      />

      <RSelect
        config={{
          style: { width: 120 },
          value: selectedNp,
          handleChange: (selectedNodePool) => {
            setNp(selectedNodePool);
            filterNodes(null, selectedNodePool);
          },
          handleRefresh: async () => {
            return getNodepools().then((nps) => [
              "所有节点池",
              ...nps.map((np) => np.name),
            ]);
          },
        }}
      />
    </div>
  );

  return (
    <div className="content">
      <div>
        <h2>Node</h2>
      </div>

      <STable
        config={{
          columns: columns,
          data: nodes,
          filterComponents: filterComponents,
          onRefresh: onRefresh,
        }}
      />
    </div>
  );
}
