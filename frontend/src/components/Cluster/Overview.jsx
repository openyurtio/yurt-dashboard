import { message, Select } from "antd";
import "./cluster.css";
import { Dashboard } from "./Dashborad";
// import { EventTable } from "./EventTable";
import { Status } from "../Utils/Status";
import { useCallback, useState } from "react";
import { getUserProfile } from "../../utils/utils";
import { useLocationMsg } from "../../utils/hooks";

const { Option } = Select;

export default function ClusterOverview() {
  // display welcome msg while entering
  useLocationMsg();

  const [connStatus, setStatus] = useState("Loading");
  const setConnStatus = useCallback((res) => {
    // if any res item is in False Status
    if (res && res.some((item) => "Status" in item && item.Status === false)) {
      message.error("request cluster overview has some problems!");
      setStatus("Fail");
    } else setStatus("Ready");
  }, []);

  const userProfile = getUserProfile(true);
  const namespace = userProfile ? userProfile.spec.namespace : "NULL";

  return (
    <div>
      <div>
        命名空间
        <Select
          defaultValue={namespace}
          style={{ width: 135, margin: "0 5px" }}
          disabled
        >
          <Option value={namespace}>{namespace}</Option>
        </Select>
        <div style={{ float: "right", display: "inline-block" }}>
          <Status status={connStatus}></Status>
        </div>
      </div>

      <div style={{ margin: "20px 0" }}>
        <Dashboard setConnStatus={setConnStatus} />
        {/* <EventTable /> */}
      </div>
    </div>
  );
}
