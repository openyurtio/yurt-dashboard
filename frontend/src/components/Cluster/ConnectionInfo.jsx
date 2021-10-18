import { Tabs } from "antd";
import Certificate from "./Certificate";
import { userProfile } from "../../config";

export default function ConnectionInfo() {
  return (
    <div>
      <div>通过 kubectl 连接 Kubernetes 集群</div>
      <div style={{ padding: "15px", position: "relative" }}>
        <div>
          1. 安装和设置kubectl客户端， 有关详细信息请参考 安装和设置 kubectl
        </div>
        <div>2. 配置集群凭据：</div>
        <Tabs
          defaultActiveKey="1"
          onChange={(e) => {
            console.log(e);
          }}
        >
          <Tabs.TabPane tab="公网访问" key="1">
            <Certificate content={userProfile.spec.kubeConfig}></Certificate>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}
