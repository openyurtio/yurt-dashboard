import { Button, Spin, Result } from "antd";
import "../Guide.css";
import { useEffect, useState } from "react";
import { sendRequest } from "../../../utils/request";

const ConnectClusterGuide = ({ onStepFinish }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(false);

  const checkConnectivity = () => {
    setLoading(true);
    sendRequest("/checkConnectivity").then(
      (res) => {
        if (res.data === undefined) {
          setResult(false);
          console.log("server responde nothing!!");
        } else {
          setResult(res.data.result);
          console.log(res.data.msg);
        }
        setLoading(false);
      },
      (err) => {
        console.log(err);
        setResult(false);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div>
      {loading ? (
        <Spin tip="正在测试集群连通性..." />
      ) : result ? (
        <Result
          style={{ padding: "40px auto" }}
          status="success"
          title="集群连接成功"
          subTitle="点击开始设置进行集群的初始化。"
          extra={[
            <Button
              key="confirm"
              disabled={loading ? true : !result}
              type="primary"
              onClick={onStepFinish}
            >
              开始设置
            </Button>,
          ]}
        />
      ) : (
        <Result
          style={{ padding: "40px auto" }}
          status="error"
          title="集群连接失败"
          subTitle="请检查集群设置后再重试操作。"
          extra={[
            <Button
              key="recheck"
              type="primary"
              style={{ marginRight: 10 }}
              onClick={checkConnectivity}
            >
              检查连通性
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default ConnectClusterGuide;
