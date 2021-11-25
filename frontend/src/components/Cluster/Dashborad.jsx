import { useEffect, useState } from "react";
import { sendRequest } from "../../utils/request";
import { PieChart, HalfPieChart } from "../Utils/PieCharts";
import { Card } from "antd";

function getResourceStatus(clusterStatus, resourceName) {
  if (clusterStatus) {
    let res = clusterStatus.filter(
      (item) => item.Kind === resourceName && item.Status === true
    );
    return res.length > 0 ? res[0] : null;
  }
  return null;
}

export function Dashboard({ setConnStatus }) {
  const [clusterStatus, setClusterStatus] = useState(null);

  useEffect(() => {
    sendRequest("/getOverview").then((res) => {
      setClusterStatus(res);
      setConnStatus(res);
    });
  }, []);

  return (
    <div>
      <Card
        className="cluster-card"
        style={{ width: "73%" }}
        bodyStyle={{ width: "100%" }}
        loading={clusterStatus == null}
      >
        <h3>应用状态</h3>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <PieChart
            name="部署"
            status={getResourceStatus(clusterStatus, "deployments")}
          ></PieChart>
          <PieChart
            name="任务"
            status={getResourceStatus(clusterStatus, "jobs")}
          ></PieChart>
          <PieChart
            name="有状态副本集"
            status={getResourceStatus(clusterStatus, "statefulsets")}
          ></PieChart>
        </div>
      </Card>
      <Card
        className="cluster-card"
        style={{ width: "25%", marginLeft: "2%" }}
        bodyStyle={{ width: "100%" }}
        loading={clusterStatus == null}
      >
        <h3>节点状态</h3>
        <HalfPieChart
          status={getResourceStatus(clusterStatus, "nodes")}
        ></HalfPieChart>
      </Card>
    </div>
  );
}
