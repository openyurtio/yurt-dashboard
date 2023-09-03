import { Button, Result } from "antd";

const CompleteGuide = ({ onStepFinish }) => {
  return (
    <Result
      style={{ padding: "40px auto" }}
      status="success"
      title="初始化设置完成"
      subTitle="恭喜您设置成功，请开始体验吧!😀"
      extra={[
        <Button key="finish" type="primary" onClick={onStepFinish}>
          进入面板
        </Button>,
      ]}
    />
  );
};
export default CompleteGuide;
