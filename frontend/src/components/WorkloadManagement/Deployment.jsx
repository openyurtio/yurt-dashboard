import { getDeployments } from '../../utils/request';
import Workload from './WorkloadTemplate';

export default function Deployment() {
  return (
    <Workload
      title="Deployment"
      table={{
        fetchData: getDeployments,
      }}
    ></Workload>
  );
}
