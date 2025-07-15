import { Trans } from '@lingui/react/macro';
import { getJobs } from '../../utils/request';
import { renderDictCell } from '../../utils/utils';
import { Status } from '../Utils/Status';
import Workload from './WorkloadTemplate';

const columns = [
  {
    title: <Trans>Name</Trans>,
    dataIndex: 'title',
  },
  {
    title: <Trans>Labels</Trans>,
    dataIndex: 'tag',
  },
  {
    title: <Trans>Status</Trans>,
    dataIndex: 'jobStatus',
    render: state => <Status status={state}></Status>,
  },
  {
    title: <Trans>Pod Status</Trans>,
    dataIndex: 'podStatus',
    render: job => renderDictCell(job),
  },
  {
    title: <Trans>Image</Trans>,
    dataIndex: 'image',
  },
  {
    title: <Trans>Creation Time</Trans>,
    dataIndex: 'createTime',
  },
  {
    title: <Trans>Completion Time</Trans>,
    dataIndex: 'completeTime',
  },
  // {
  //   title: "操作",
  //   dataIndex: "operation",
  //   render: () => (
  //     <div>
  //       <a><Trans>Details</Trans></a> |<a><Trans>Edit</Trans></a> | <a><Trans>More</Trans></a>
  //     </div>
  //   ),
  // },
];

// const mockData = [
//   {
//     key: "1",
//     title: "dataset-controller",
//     tag: "control-plane:default-nodepool",
//     jobStatus: <Trans>Normal</Trans>,
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
//     jobStatus: <Trans>Normal</Trans>,
//     podStatus: <Trans>Normal</Trans>,
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
