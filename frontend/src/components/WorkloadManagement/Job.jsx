import { getJobs } from '../../utils/request';
import { renderDictCell } from '../../utils/utils';
import { Status } from '../Utils/Status';
import Workload from './WorkloadTemplate';

const columns = [
  {
    title: '名称',
    dataIndex: 'title',
  },
  {
    title: '标签',
    dataIndex: 'tag',
  },
  {
    title: '状态',
    dataIndex: 'jobStatus',
    render: state => <Status status={state}></Status>,
  },
  {
    title: 'Pod状态',
    dataIndex: 'podStatus',
    render: job => renderDictCell(job),
  },
  {
    title: '镜像',
    dataIndex: 'image',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '完成时间',
    dataIndex: 'completeTime',
  },
  // {
  //   title: "操作",
  //   dataIndex: "operation",
  //   render: () => (
  //     <div>
  //       <a>详情</a> |<a>编辑</a> | <a>更多</a>
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
