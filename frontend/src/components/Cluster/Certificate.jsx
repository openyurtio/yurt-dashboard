import { Trans } from '@lingui/react/macro';
import { Button } from 'antd';
import { copy2clipboard } from '../../utils/utils';

export default function Certificate({ content, time }) {
  const handleClick = () => copy2clipboard(content);

  return (
    <div>
      <div
        style={{
          marginBottom: 25,
        }}
      >
        <Trans>Copy the following content to your computer's $HOME/.kube/config file</Trans>
        <span style={{ float: 'right' }}>
          <Trans>Certificate Expiry Time:</Trans> <b>{time}</b>
        </span>
      </div>
      <pre>
        <code>
          <Button type="primary" size="small" className="copy-button" onClick={handleClick}>
            copy
          </Button>
          {content}
        </code>
      </pre>
    </div>
  );
}
