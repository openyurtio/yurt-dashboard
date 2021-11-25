import { getDeployments } from "../../utils/request";
import { useResourceState } from "../../utils/utils";
import Workload from "./WorkloadTemplate";

export default function Deployment() {
  const [dps, onRefresh] = useResourceState(getDeployments);

  return (
    <Workload
      title="Deployment"
      table={{
        data: dps,
        onRefresh: onRefresh,
      }}
    ></Workload>
  );
}
