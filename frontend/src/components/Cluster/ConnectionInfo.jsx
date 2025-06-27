import { Trans } from '@lingui/react/macro';
import { Tabs } from 'antd';
import { useUserProfile } from '../../utils/hooks';
import { getUserExpireTime } from '../../utils/utils';
import Certificate from './Certificate';

export default function ConnectionInfo() {
  const [userProfile] = useUserProfile();
  const kubeConfig = userProfile ? userProfile.spec.kubeConfig : 'NULL';
  const effectiveTime = userProfile ? userProfile.status.effectiveTime : 0;

  return (
    <div>
      <div><Trans>通过 kubectl 连接 Kubernetes 集群</Trans></div>
      <div style={{ padding: '15px', position: 'relative' }}>
        <div>
          1. <Trans>安装和设置kubectl客户端， 有关详细信息请参考</Trans>
          <a target="_blank" href="https://kubernetes.io/docs/tasks/tools/" rel="noreferrer">
            <Trans>相关文档</Trans>
          </a>
          <Trans>安装和设置 kubectl</Trans>
        </div>
        <div>2. <Trans>配置集群凭据：</Trans></div>
        <Tabs
          defaultActiveKey="1"
          onChange={e => {
            console.log(e);
          }}
          items={[
            {
              key: '1',
              label: <Trans>公网访问</Trans>,
              children: (
                <Certificate
                  content={kubeConfig}
                  time={getUserExpireTime(effectiveTime, 7)}
                ></Certificate>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
