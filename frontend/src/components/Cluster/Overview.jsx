import { message, Select } from 'antd';
import './cluster.css';
import { Dashboard } from './Dashboard';
// import { EventTable } from "./EventTable";
import { Trans } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { useLocationMsg, useUserProfile } from '../../utils/hooks';
import { Status } from '../Utils/Status';

const { Option } = Select;

export default function ClusterOverview() {
  // display welcome msg if it's the first entrance
  useLocationMsg();

  const [userProfile] = useUserProfile();
  const namespace = !userProfile
    ? 'NULL'
    : userProfile.spec.namespace
      ? userProfile.spec.namespace
      : 'ALL';

  const [connStatus, setStatus] = useState('Loading');
  const setConnStatus = useCallback(res => {
    // if any res item is in False Status
    if (res && res.some(item => 'Status' in item && item.Status === false)) {
      message.error('request cluster overview has some problems!');
      setStatus('Fail');
    } else setStatus('Ready');
  }, []);

  return (
    <div>
      <div>
        <Trans>Namespace</Trans>
        <Select defaultValue={namespace} style={{ width: 135, margin: '0 5px' }} disabled>
          <Option value={namespace}>{namespace}</Option>
        </Select>
        <div style={{ float: 'right', display: 'inline-block' }}>
          <Status status={connStatus}></Status>
        </div>
      </div>

      <div style={{ margin: '20px 20px 0' }}>
        <Dashboard setConnStatus={setConnStatus} />
        {/* <EventTable /> */}
      </div>
    </div>
  );
}
