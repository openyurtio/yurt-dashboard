import { Tabs } from "antd";
import Certificate from "./Certificate";
import { getUserExpireTime, getUserProfile } from "../../utils/utils";

export default function ConnectionInfo() {
  const userProfile = getUserProfile();
  const kubeConfig = userProfile ? userProfile.spec.kubeConfig : "NULL";
  const effectiveTime = userProfile ? userProfile.status.effectiveTime : 0;

  return (
    <div>
      <div>通过 kubectl 连接 Kubernetes 集群</div>
      <div style={{ padding: "15px", position: "relative" }}>
        <div>
          1. 安装和设置kubectl客户端， 有关详细信息请参考
          <a
            target="_blank"
            href="https://kubernetes.io/docs/tasks/tools/"
            rel="noreferrer"
          >
            相关文档
          </a>
          安装和设置 kubectl
        </div>
        <div>2. 配置集群凭据：</div>
        <Tabs
          defaultActiveKey="1"
          onChange={(e) => {
            console.log(e);
          }}
        >
          <Tabs.TabPane tab="公网访问" key="1">
            <Certificate
              content={kubeConfig}
              time={getUserExpireTime(effectiveTime, 7)}
            ></Certificate>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}
