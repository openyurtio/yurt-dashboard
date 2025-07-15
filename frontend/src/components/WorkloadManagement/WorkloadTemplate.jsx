import { SearchOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Input } from 'antd';
import { useState } from 'react';
import { useResourceState } from '../../utils/hooks';
import { renderDictCell } from '../../utils/utils';
import STable from '../Utils/SelectableTable';

const columns = [
  {
    title: <Trans>Name</Trans>,
    dataIndex: 'title',
  },
  {
    title: <Trans>Labels</Trans>,
    dataIndex: 'tag',
    render: dp => renderDictCell(dp),
  },
  {
    title: <Trans>Pod Count</Trans>,
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
    title: <Trans>Image</Trans>,
    dataIndex: 'image',
  },
  {
    title: <Trans>Creation Time</Trans>,
    dataIndex: 'createTime',
  },
  // {
  //   title: <Trans>Operations</Trans>,
  //   dataIndex: "operation",
  //   render: () => (
  //     <div>
  //       <a><Trans>Details</Trans></a> |<a><Trans>Edit</Trans></a> |<a><Trans>Scale</Trans></a> |<a><Trans>Monitor</Trans></a> | <a><Trans>More</Trans></a>
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
