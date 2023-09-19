import { useState, useEffect } from "react";
import { sendUserRequest } from "../../utils/request";

import {
  Typography,
  Input,
  Radio,
  List,
  Card,
  Popover,
  Space,
  Button,
  message,
} from "antd";
import {
  SearchOutlined,
  CheckCircleTwoTone,
  QuestionCircleTwoTone,
  LoadingOutlined,
  InfoCircleTwoTone,
  WarningTwoTone,
} from "@ant-design/icons";

import SystemAppInstallModal from "./Modals/SystemAppInstall";
import SystemAppManageModal from "./Modals/SystemAppManage";
import { getCurrentTime } from "../../utils/utils";

const { Paragraph, Link } = Typography;

export default function SystemApp() {
  // data
  const [originData, setOriginData] = useState(null);
  const [operationConfig, setOperationConfig] = useState([]);
  useEffect(() => {
    handleRefresh(false);
  }, []);

  // filter
  const [searchVal, setSearchVal] = useState("");
  const [selectVal, setSelectVal] = useState(1);
  const filterSearchVal = (item) => {
    return typeof item.title === "string"
      ? item.title.indexOf(searchVal) >= 0
      : JSON.stringify(item.title).indexOf(searchVal) >= 0;
  };
  const filterSelectVal = (item) => {
    switch (selectVal) {
      case 2:
        if (item.status !== "deployed") return false;
        break;
      case 3:
        if (item.status !== "undeployed") return false;
        break;
      default:
        break;
    }
    return true;
  };

  // modal
  const [installVisible, setInstallVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const openModal = (data) => {
    setOperationConfig(data);
    if (data.status) {
      switch (data.status) {
        case "deployed":
          setManageVisible(true);
          break;
        case "undeployed":
          setInstallVisible(true);
          break;
        default:
          break;
      }
    }
  };

  // refresh button
  const [lastUpdate, setLastUpdate] = useState(getCurrentTime());
  const [refreshLoading, setRefreshLoading] = useState(false);

  return (
    <div>
      <div>
        <h2>系统应用</h2>
        <Paragraph>
          <blockquote>
            管理集群中OpenYurt系统组件。不知道如何部署？请参考
            <Link
              href="https://openyurt.io/docs/installation/openyurt-experience-center/web_console"
              target="_blank"
            >
              文档➡️
            </Link>
            <br></br>
            更多组件即将上线，敬请期待😁！
          </blockquote>
        </Paragraph>
      </div>
      <div style={{ height: 40 }}>
        <Radio.Group
          style={{ marginTop: 10 }}
          onChange={(e) => {
            setSelectVal(e.target.value);
          }}
          value={selectVal}
        >
          <Radio value={1}>全部</Radio>
          <Radio value={2}>已安装</Radio>
          <Radio value={3}>未安装</Radio>
        </Radio.Group>
        <Input
          placeholder="search system app"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          style={{ width: 180 }}
          suffix={<SearchOutlined />}
        />
        <Space style={{ float: "right" }}>
          {"上次更新:" + lastUpdate}
          <Button
            loading={refreshLoading}
            onClick={() => {
              handleRefresh(true);
            }}
          >
            刷新列表
          </Button>
          <Button onClick={installSystemAppManually}>手动安装</Button>

          <Popover
            title="找不到所需组件？"
            placement="topRight"
            arrowPointAtCenter
            mouseEnterDelay={0.1}
            content={
              <div>
                <p>
                  请尝试刷新列表或者检查集群网络状态以确保能正确访问OpenYurt仓库。
                </p>
                <p>或者手动上传安装包进行安装。</p>
              </div>
            }
          >
            <QuestionCircleTwoTone />
          </Popover>
        </Space>
      </div>
      <div
        style={{
          width: "100%",
          overflow: "auto",
          height: 400,
        }}
      >
        <List
          style={{ margin: 10 }}
          grid={{ sm: 2, column: 4, gutter: 10 }}
          dataSource={
            originData
              ? originData.filter(filterSearchVal).filter(filterSelectVal)
              : []
          }
          loading={!originData}
          rowKey="key"
          renderItem={(data) => (
            <List.Item>
              <Card
                title={data.title}
                hoverable
                onClick={() => {
                  openModal(data);
                }}
                extra={[
                  <Popover
                    key="extra-install"
                    content="已安装"
                    mouseEnterDelay={0.1}
                  >
                    <CheckCircleTwoTone
                      twoToneColor="#52c41a"
                      style={{
                        float: "right",
                        display: data.status === "deployed" ? "" : "none",
                      }}
                    />
                  </Popover>,
                  <Popover
                    key="extra-dealing"
                    content="处理中"
                    mouseEnterDelay={0.1}
                  >
                    <LoadingOutlined
                      style={{
                        float: "right",
                        display:
                          data.status === "uninstalling" ||
                          data.status === "pending-install"
                            ? ""
                            : "none",
                      }}
                    />
                  </Popover>,
                  <Popover
                    key="extra-notsupport"
                    title="不完全支持组件"
                    content="此组件未受到完全支持，仅支持卸载操作"
                    mouseEnterDelay={0.1}
                  >
                    <WarningTwoTone
                      twoToneColor="#FFa631"
                      style={{
                        marginRight: 10,
                        float: "right",
                        display: data.supported ? "none" : "",
                      }}
                    />
                  </Popover>,
                  <Popover
                    key="extra-failinfo"
                    title="组件信息获取失败"
                    content="请检查网络并尝试刷新列表"
                    mouseEnterDelay={0.1}
                  >
                    <InfoCircleTwoTone
                      twoToneColor="#FF0000"
                      style={{
                        marginRight: 10,
                        float: "right",
                        display: data.status === "fakeinfo" ? "" : "none",
                      }}
                    />
                  </Popover>,
                ]}
              >
                <Popover content={data.desc} mouseEnterDelay={1}>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {data.desc === "" ? "No description" : data.desc}
                  </div>
                </Popover>
              </Card>
            </List.Item>
          )}
        ></List>
      </div>
      <SystemAppInstallModal
        data={operationConfig}
        visible={installVisible}
        onClose={() => {
          setInstallVisible(false);
        }}
        onDealing={() => {
          originData.forEach((item) => {
            if (item.title === operationConfig.title) {
              item.status = "pending-install";
            }
          });
        }}
        onSuccess={() => {
          handleRefresh(false);
        }}
      />
      <SystemAppManageModal
        data={operationConfig}
        visible={manageVisible}
        onClose={() => {
          setManageVisible(false);
        }}
        onDealing={() => {
          originData.forEach((item) => {
            if (item.title === operationConfig.title) {
              item.status = "uninstalling";
            }
          });
        }}
        onSuccess={() => {
          handleRefresh(false);
        }}
      />
    </div>
  );

  function handleRefresh(updateRepo) {
    setRefreshLoading(true);
    sendUserRequest("/system/appList", {
      update_repo: updateRepo,
    }).then((sal) => {
      if (sal.data) {
        setOriginData(sal.data.map(transformSysApp));
      } else {
        setOriginData([]);
      }
      setSearchVal("");
      setSelectVal(1);
      setLastUpdate(getCurrentTime());
      setRefreshLoading(false);
    });
  }

  function transformSysApp(element, i) {
    return {
      key: element.chart_name,
      title: element.chart_name,
      desc: element.description,
      version: element.version,
      versions: element.versions,
      status: element.status,
      supported: element.fully_supported,
    };
  }

  function installSystemAppManually() {
    message.info("功能正在开发中，敬请期待");
  }
}
