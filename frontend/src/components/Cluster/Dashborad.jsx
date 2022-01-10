import { useEffect, useState } from "react";
import { sendUserRequest } from "../../utils/request";
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
    sendUserRequest("/getOverview").then((res) => {
      setClusterStatus(res);
      setConnStatus(res);
    });
  }, [setConnStatus]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      <Card
        className="cluster-card"
        style={{ maxWidth: 800, minWidth: 500 }}
        loading={clusterStatus == null}
      >
        <h3>应用状态</h3>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          <PieChart
            name="Pod"
            status={getResourceStatus(clusterStatus, "pods")}
          ></PieChart>
          <PieChart
            name="Deployment"
            status={getResourceStatus(clusterStatus, "deployments")}
          ></PieChart>

          <PieChart
            name="StatefulSet"
            status={getResourceStatus(clusterStatus, "statefulsets")}
          ></PieChart>
        </div>
      </Card>
      <Card
        className="cluster-card"
        style={{ minWidth: 210 }}
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
