import {
  Button,
  Input,
  Modal,
  Select,
  Menu,
  Dropdown,
  Switch,
  message,
  Typography,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { getNodes, getNodepools, sendUserRequest } from "../../utils/request";
import RSelect from "../Utils/RefreshableSelect";
import STable from "../Utils/SelectableTable";
import {
  getUserProfile,
  renderDictCell,
  copy2clipboard,
} from "../../utils/utils";
import { Status } from "../Utils/Status";

const { Option } = Select;
const { Search } = Input;
const { Paragraph, Link } = Typography;

// the Node panel
export default function Nodes() {
  // table columns
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
      render: (node) => {
        return (
          <div>
            {node.role}
            <Status
              status={node.condition.status === "True" ? "Ready" : "Unready"}
              tips={node.condition.message}
            />
          </div>
        );
      },
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
    {
      title: "操作",
      dataIndex: "operations",
      render: ({ Autonomy, NodeName }) => (
        <Dropdown
          placement="bottomCenter"
          overlay={
            <Menu>
              <Menu.Item key="1">
                节点自治：
                <Switch
                  size="small"
                  defaultChecked={Autonomy === "true"}
                  onChange={(checked) => {
                    sendUserRequest("/setNodeAutonomy", {
                      NodeName,
                      Autonomy: String(checked),
                    }).then((res) => {
                      // if autonomy set fail, refresh the whole table
                      if (res.status === "error") {
                        message.info("节点自治设置失败：刷新Node列表");
                        onRefresh();
                      } else {
                        message.info(
                          `节点自治设置成功: ${checked ? "ON" : "OFF"}`
                        );
                      }
                    });
                  }}
                />
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined style={{ cursor: "pointer", width: "100%" }} />
        </Dropdown>
      ),
    },
  ];

  // filtering
  // for filter components
  const [searchOption, setOption] = useState("title");
  const [searchValue, setSearchVal] = useState("");
  const [selectedNp, setNp] = useState("所有节点池");

  const [allNodes, setAllNodes] = useState(null); // all nodes
  const [nodes, setNodes] = useState(allNodes); // display nodes after filtering

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
            // searchOptions could be an Object
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

  // filter options
  const options = [
    { content: "名称", dataIndex: "title" },
    { content: "标签", dataIndex: "tag" },
    { content: "标注", dataIndex: "annotations" },
  ];

  // refresh the whole table and reset all filter options
  // Note: this won't update nodepool options ( this may cause problems )
  async function onRefresh() {
    setNodes(null);
    setSearchVal("");
    setOption("title");
    setNp("所有节点池");
    return getNodes().then((nodes) => {
      setAllNodes(nodes);
      setNodes(nodes);
    });
  }

  useEffect(() => {
    onRefresh();
  }, []);

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
        handleRefresh={useCallback(async () => {
          // add "所有节点池" in select options anyway
          return getNodepools().then((nps) => {
            return ["所有节点池", ...nps.map((np) => np.title)];
          });
        }, [])}
        handleChange={(selectedNodePool) => {
          setNp(selectedNodePool);
          filterNodes(null, selectedNodePool);
        }}
        config={{
          style: { width: 120 },
          value: selectedNp,
        }}
      />
    </div>
  );

  // nodeaddscript modal
  const [visible, setVisible] = useState(false);
  const userProfile = getUserProfile();
  const nodeAddScript = userProfile
    ? userProfile.spec.nodeAddScript
    : "获取接入脚本失败，出现了一些问题";
  const onCancel = () => {
    setVisible(false);
  };

  return (
    <div className="content">
      <div>
        <h2 style={{ display: "inline-block" }}>Node</h2>
        <Button
          type="default"
          style={{ float: "right" }}
          onClick={() => {
            setVisible(true);
          }}
        >
          添加已有节点
        </Button>
        {
          // display help information for users has no nodes joined
          allNodes && allNodes.length === 0 ? (
            <Paragraph>
              <blockquote>
                不知道如何添加节点😕?参考
                <Link
                  href="https://openyurt.io/docs/installation/openyurt-experience-center/web_console"
                  target="_blank"
                >
                  文档➡️
                </Link>
                快速上手体验中心
              </blockquote>
            </Paragraph>
          ) : null
        }
      </div>

      <Modal
        visible={visible}
        title="节点接入脚本"
        onCancel={onCancel}
        footer={[
          <Button
            onClick={() => {
              copy2clipboard(nodeAddScript);
              setVisible(false);
            }}
          >
            复制并关闭
          </Button>,
          <Button type="primary" onClick={onCancel}>
            关闭
          </Button>,
        ]}
      >
        {nodeAddScript}
      </Modal>

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
