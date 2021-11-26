import { Card, Avatar } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { Status } from "../Utils/Status";

const { Meta } = Card;

export default function App({
  title,
  desc,
  setConfig: openModal,
  img,
  avatar,
  status,
}) {
  return (
    <Card
      style={{ minWidth: 300, maxWidth: 350, margin: "20px 10px" }}
      cover={<img alt="example" src={img} />}
      hoverable={true}
      bordered={true}
      actions={[
        <Status status={status ? "ON" : "OFF"} />,
        <SettingOutlined key="setting" onClick={openModal} />, // setting modals
      ]}
    >
      <Meta avatar={<Avatar src={avatar} />} title={title} description={desc} />
    </Card>
  );
}
