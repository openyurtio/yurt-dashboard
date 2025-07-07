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
      <div>
        <Trans>Connect to Kubernetes Cluster via kubectl</Trans>
      </div>
      <div style={{ padding: '15px', position: 'relative' }}>
        <div>
          1.{' '}
          <Trans>
            Install and configure kubectl client, for detailed information please refer to
          </Trans>
          <a target="_blank" href="https://kubernetes.io/docs/tasks/tools/" rel="noreferrer">
            <Trans>Related Documentation</Trans>
          </a>
          <Trans>Install and Configure kubectl</Trans>
        </div>
        <div>
          2. <Trans>Configure Cluster Credentials:</Trans>
        </div>
        <Tabs
          defaultActiveKey="1"
          onChange={e => {
            console.log(e);
          }}
          items={[
            {
              key: '1',
              label: <Trans>Public Network Access</Trans>,
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
