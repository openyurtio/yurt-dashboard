import { Button } from "antd";
import { copy2clipboard } from "../../utils/utils";

export default function Certificate({ content, time }) {
  const handleClick = () => copy2clipboard(content);

  return (
    <div>
      <div>将以下内容复制到计算机 $HOME/.kube/config 文件下</div>
      <div>凭证过期时间： {time}</div>
      <pre>
        <Button
          type="primary"
          size="small"
          className="copy-button"
          onClick={handleClick}
        >
          Copy
        </Button>
        <code>{content}</code>
      </pre>
    </div>
  );
}
