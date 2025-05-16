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
        将以下内容复制到计算机 $HOME/.kube/config 文件下
        <span style={{ float: 'right' }}>
          凭证过期时间： <b>{time}</b>
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
