import { Tabs } from "antd";
import ConnectionInfo from "./ConnectionInfo";
import ClusterOverview from "./Overview";

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

const ClusterInfo = () => (
  <div className="content">
    <h2>Cluster Overview</h2>
    <div>
      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="概览" key="1">
          <ClusterOverview></ClusterOverview>
        </TabPane>
        <TabPane tab="连接信息" key="3">
          <ConnectionInfo></ConnectionInfo>
        </TabPane>
      </Tabs>
    </div>
  </div>
);

export default ClusterInfo;
