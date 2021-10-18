import { getStatefulSets } from "../../utils/request";
import { useResourceState } from "../../utils/utils";
import Workload from "./WorkloadTemplate";

export default function StatefulSet() {
  const [ss, onRefresh] = useResourceState(getStatefulSets);

  return (
    <Workload
      title="StatefulSet"
      table={{
        data: ss,
        onRefresh: onRefresh,
      }}
    ></Workload>
  );
}
