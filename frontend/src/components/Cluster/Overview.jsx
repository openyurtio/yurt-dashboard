import { Select } from "antd";
import "./cluster.css";
import { Dashboard } from "./Dashborad";
import { EventTable } from "./EventTable";
import { Status } from "../Utils/Status";
import { useState } from "react";

const { Option } = Select;

export default function ClusterOverview() {
  const [connStatus, setStatus] = useState("Loading");

  return (
    <div>
      <div>
        命名空间
        <Select
          defaultValue="lucy"
          style={{ width: 200, margin: "0 5px" }}
          disabled
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>
            Disabled
          </Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
        <div style={{ float: "right", display: "inline-block" }}>
          <Status status={connStatus}></Status>
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <Dashboard
          setConnStatus={(res) => {
            if (!("status" in res)) {
              setStatus("Ready");
            } else {
              setStatus("Connection Lost");
            }
          }}
        />
        <EventTable />
      </div>
    </div>
  );
}
