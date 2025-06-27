import { InfoCircleOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Tooltip } from 'antd';

const colorState = {
  success: '#62CB35',
  ready: '#62CB35',
  [<Trans>正常</Trans>]: '#62CB35',
  fail: '#F74336',
  loading: '#27e844',
  running: '#62CB35',
  on: '#62CB35',
};

export function Status({ status, tips }) {
  const statusKey = status ? status.toLowerCase() : 'unknown';
  return (
    <div>
      <div
        className="cluster-status"
        style={{
          backgroundColor: statusKey in colorState ? colorState[statusKey] : colorState.fail,
        }}
      ></div>

      <Tooltip title={tips}>
        <div
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
        >
          <span> {status} </span>
          {tips ? <InfoCircleOutlined /> : null}
        </div>
      </Tooltip>
    </div>
  );
}
