import { Trans } from '@lingui/react/macro';
import { getPods } from '../../utils/request';
import { renderDictCell } from '../../utils/utils';
import { Status } from '../Utils/Status';
import Workload from './WorkloadTemplate';

const columns = [
  {
    title: <Trans>Name/IP Address/Instance ID</Trans>,
    dataIndex: 'title',
    render: pod => {
      return (
        <div>
          <div>{pod.Name}</div>
          <div>{pod.IP}</div>
          <div>{pod.uid}</div>
        </div>
      );
    },
  },
  {
    title: <Trans>Labels</Trans>,
    dataIndex: 'tag',
    render: pod => renderDictCell(pod),
  },
  {
    title: <Trans>Status</Trans>,
    dataIndex: 'podStatus',
    render: state => <Status status={state}></Status>,
  },
  {
    title: <Trans>Node</Trans>,
    dataIndex: 'node',
    render: pod => renderDictCell(pod),
  },
  {
    title: <Trans>Image</Trans>,
    dataIndex: 'containers',
  },
  {
    title: <Trans>Creation Time</Trans>,
    dataIndex: 'createTime',
  },
];

export default function Pod() {
  return (
    <Workload
      title="Pod"
      table={{
        columns,
        fetchData: getPods,
      }}
    />
  );
}
