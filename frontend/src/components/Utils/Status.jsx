import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const colorState = {
  success: "#62CB35",
  ready: "#62CB35",
  正常: "#62CB35",
  fail: "#F74336",
  loading: "#27e844",
  running: "#62CB35",
  on: "#62CB35",
};

export function Status({ status, tips }) {
  let statusKey = status && status.toLowerCase();
  return (
    <div>
      <div
        className="cluster-status"
        style={{
          backgroundColor:
            statusKey in colorState ? colorState[statusKey] : colorState.fail,
        }}
      ></div>

      <Tooltip title={tips}>
        <div
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          <span> {status} </span>
          {tips ? <InfoCircleOutlined /> : null}
        </div>
      </Tooltip>
    </div>
  );
}
