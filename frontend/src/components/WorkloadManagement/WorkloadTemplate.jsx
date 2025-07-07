import { SearchOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Input } from 'antd';
import { useState } from 'react';
import { useResourceState } from '../../utils/hooks';
import { renderDictCell } from '../../utils/utils';
import STable from '../Utils/SelectableTable';

const columns = [
  {
    title: <Trans>名称</Trans>,
    dataIndex: 'title',
  },
  {
    title: <Trans>标签</Trans>,
    dataIndex: 'tag',
    render: dp => renderDictCell(dp),
  },
  {
    title: <Trans>容器组数量</Trans>,
    dataIndex: 'status',
    render: status => {
      return (
        <div>
          {status.readyReplicas ? status.readyReplicas : 0}/{status.replicas}
        </div>
      );
    },
  },
  {
    title: <Trans>镜像</Trans>,
    dataIndex: 'image',
  },
  {
    title: <Trans>创建时间</Trans>,
    dataIndex: 'createTime',
  },
  // {
  //   title: <Trans>操作</Trans>,
  //   dataIndex: "operation",
  //   render: () => (
  //     <div>
  //       <a><Trans>详情</Trans></a> |<a><Trans>编辑</Trans></a> |<a><Trans>伸缩</Trans></a> |<a><Trans>监控</Trans></a> | <a><Trans>更多</Trans></a>
  //     </div>
  //   ),
  // },
];

/**
 * Workload is a template component for all workload management panels
 * @param {String} title: display title
 * @param {Object}    table.columns: if not specified use default columns
 * @param {Function}  table.fetchData: called when component is constructed or refresh button is clicked
 */
export default function Workload({ title, table }) {
  const [tableData, onRefresh] = useResourceState(table && table.fetchData);

  // filter components
  const [inputVal, setInput] = useState('');
  const filterComponents = (
    <div style={{ display: 'inline-block' }}>
      <Input
        placeholder="search title"
        value={inputVal}
        onChange={e => setInput(e.target.value)}
        style={{ width: 180 }}
        suffix={<SearchOutlined />}
      />
    </div>
  );

  return (
    <div>
      <div>
        <h2>{title}</h2>
      </div>

      <STable
        config={{
          columns: table && table.columns ? table.columns : columns,
          data:
            tableData &&
            tableData.filter(row =>
              typeof row.title === 'string'
                ? row.title.indexOf(inputVal) >= 0
                : JSON.stringify(row.title).indexOf(inputVal) >= 0
            ),
          filterComponents,
          onRefresh: () => {
            setInput('');
            onRefresh();
          },
        }}
      />
    </div>
  );
}
