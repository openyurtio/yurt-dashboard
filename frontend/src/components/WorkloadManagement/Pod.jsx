import { Trans } from '@lingui/react/macro';
import { getPods } from '../../utils/request';
import { renderDictCell } from '../../utils/utils';
import { Status } from '../Utils/Status';
import Workload from './WorkloadTemplate';

const columns = [
  {
    title: <Trans>名称/IP地址/实例 ID</Trans>,
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
    title: <Trans>标签</Trans>,
    dataIndex: 'tag',
    render: pod => renderDictCell(pod),
  },
  {
    title: <Trans>状态</Trans>,
    dataIndex: 'podStatus',
    render: state => <Status status={state}></Status>,
  },
  {
    title: <Trans>节点</Trans>,
    dataIndex: 'node',
    render: pod => renderDictCell(pod),
  },
  {
    title: <Trans>镜像</Trans>,
    dataIndex: 'containers',
  },
  {
    title: <Trans>创建时间</Trans>,
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
