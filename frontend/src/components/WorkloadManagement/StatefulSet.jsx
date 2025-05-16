import { getStatefulSets } from '../../utils/request';
import Workload from './WorkloadTemplate';

export default function StatefulSet() {
  return (
    <Workload
      title="StatefulSet"
      table={{
        fetchData: getStatefulSets,
      }}
    ></Workload>
  );
}
