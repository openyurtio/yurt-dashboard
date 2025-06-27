import { Trans } from '@lingui/react/macro';
import { getJobs } from '../../utils/request';
import { renderDictCell } from '../../utils/utils';
import { Status } from '../Utils/Status';
import Workload from './WorkloadTemplate';

const columns = [
  {
    title: <Trans>名称</Trans>,
    dataIndex: 'title',
  },
  {
    title: <Trans>标签</Trans>,
    dataIndex: 'tag',
  },
  {
    title: <Trans>状态</Trans>,
    dataIndex: 'jobStatus',
    render: state => <Status status={state}></Status>,
  },
  {
    title: <Trans>Pod状态</Trans>,
    dataIndex: 'podStatus',
    render: job => renderDictCell(job),
  },
  {
    title: <Trans>镜像</Trans>,
    dataIndex: 'image',
  },
  {
    title: <Trans>创建时间</Trans>,
    dataIndex: 'createTime',
  },
  {
    title: <Trans>完成时间</Trans>,
    dataIndex: 'completeTime',
  },
  // {
  //   title: "操作",
  //   dataIndex: "operation",
  //   render: () => (
  //     <div>
  //       <a><Trans>详情</Trans></a> |<a><Trans>编辑</Trans></a> | <a><Trans>更多</Trans></a>
  //     </div>
  //   ),
  // },
];

// const mockData = [
//   {
//     key: "1",
//     title: "dataset-controller",
//     tag: "control-plane:default-nodepool",
//     jobStatus: "正常",
//     podStatus: {
//       succeeded: 2,
//       failed: 0,
//       active: 1,
//     },
//     image:
//       "registry-vpc.cn-beijing.aliyuncs.com/fluid/alluxioruntime-controller:vO.6.0-1c250b2",
//     createTime: "2021-08-10 19:19:22",
//     completeTime: "2021-08-10 19:20:22",
//     operation: "",
//   },
//   {
//     key: "2",
//     title: "dataset-controller",
//     tag: "control-plane:default-nodepool",
//     jobStatus: "正常",
//     podStatus: "正常",
//     image:
//       "registry-vpc.cn-beijing.aliyuncs.com/fluid/alluxioruntime-controller:vO.6.0-1c250b2",
//     createTime: "2021-08-10 19:19:22",
//     completeTime: "2021-08-10 19:20:22",
//     operation: "",
//   },
// ];

export default function Job() {
  return <Workload title="Job" table={{ columns, fetchData: getJobs }}></Workload>;
}
