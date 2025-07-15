import { Trans } from '@lingui/react/macro';
import { Button, Checkbox, message } from 'antd';
import { useState } from 'react';
import { sendRequest } from '../../../utils/request';

const compareApps = (a, b) => {
  if (a.required === b.required) {
    return a.name.localeCompare(b.name);
  }
  if (a.required) {
    return -1;
  }
  return 1;
};

const getAllChecked = appList => {
  const a = [];
  appList.forEach(item => {
    a.push(item.name);
  });
  return a;
};

const getDefaultChecked = appList => {
  const a = [];
  appList.forEach(item => {
    if (item.required) {
      a.push(item.name);
    }
  });
  return a;
};

// Step: Openyurt component installation.
const OpenYurtAppGuide = ({ guideInfo, onStepFinish }) => {
  const [installFailed, setInstallFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tips, setTipsContent] = useState('');
  const [isErrorTip, setIsErrorTip] = useState(false);
  const [appDesc, setAppDesc] = useState('');

  const allChecked = getAllChecked(guideInfo.openyurt_apps);
  const defaultChecked = getDefaultChecked(guideInfo.openyurt_apps);
  const [checkedList, setCheckedList] = useState(defaultChecked);
  const [indeterminate, setIndeterminate] = useState(
    defaultChecked.length && defaultChecked.length < allChecked.length
  );
  const [checkAll, setCheckAll] = useState(defaultChecked.length === allChecked.length);

  const setErrorTips = msg => {
    setIsErrorTip(true);
    setTipsContent(msg);
  };
  const setTips = msg => {
    setIsErrorTip(false);
    setTipsContent(msg);
  };

  const onChange = list => {
    setCheckedList(list);
    setIndeterminate(list.length && list.length < allChecked.length);
    setCheckAll(list.length === allChecked.length);
  };

  const onCheckAllChange = e => {
    setCheckedList(e.target.checked ? allChecked : defaultChecked);
    setIndeterminate(!e.target.checked && defaultChecked.length);
    setCheckAll(e.target.checked);
  };

  const installOpenYurtApp = () => {
    setLoading(true);
    setTips(
      <Trans>
        Installation process is affected by network environment, estimated to take 2 minutes.
      </Trans>
    );
    sendRequest('/system/appInstallFromGuide', { apps_name: checkedList }).then(
      res => {
        message.success(<Trans>Installation Successful! Installed Components:</Trans> + res.msg);
        onStepFinish();
      },
      err => {
        console.log(err);
        setErrorTips(<Trans>Installation Failed:</Trans> + err.message);
        setInstallFailed(true);
        setLoading(false);
      }
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', height: 200 }}>
        <div style={{ width: 150 }}>
          <div style={{ display: 'flex' }}>
            <p>
              <Trans>Total</Trans>
              {guideInfo.openyurt_apps.length}
              <Trans>items</Trans>
            </p>
            <Checkbox
              style={{ marginLeft: 10 }}
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              <Trans>Select All</Trans>
            </Checkbox>
          </div>
          <Checkbox.Group
            style={{ display: 'grid', gridGap: '10px' }}
            options={guideInfo.openyurt_apps.sort(compareApps).map(info => ({
              label: (
                <button
                  type="button"
                  onClick={() => setAppDesc(info.desc)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setAppDesc(info.desc);
                    }
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {info.name}
                </button>
              ),
              value: info.name,
              disabled: info.required,
            }))}
            value={checkedList}
            onChange={onChange}
          />
        </div>
        <div
          style={{
            flex: 1,
            border: '1px solid #000',
            textAlign: 'left',
            padding: 10,
            display: 'flex',
            flexWrap: 'wrap',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            marginLeft: 20,
          }}
        >
          {appDesc}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            color: isErrorTip ? 'red' : 'grey',
          }}
        >
          {tips}
        </div>
        {installFailed ? (
          <div>
            <Button
              style={{ marginRight: 10 }}
              type="primary"
              onClick={installOpenYurtApp}
              loading={loading}
            >
              <Trans>Retry Installation</Trans>
            </Button>
            <Button onClick={onStepFinish}>
              <Trans>Skip</Trans>
            </Button>
          </div>
        ) : (
          <Button type="primary" loading={loading} onClick={installOpenYurtApp}>
            <Trans>Install Components</Trans>
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpenYurtAppGuide;
