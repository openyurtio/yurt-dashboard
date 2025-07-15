import { DownloadOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Button, Card, Select, Table } from 'antd';
import { useState } from 'react';
import { downloadTable, tableData2txt } from '../../utils/utils';

const { Option } = Select;

const columns = [
  {
    title: <Trans>Type</Trans>,
    dataIndex: 'type',
  },
  {
    title: <Trans>Object</Trans>,
    dataIndex: 'object',
  },
  {
    title: <Trans>Information</Trans>,
    dataIndex: 'info',
  },
  {
    title: <Trans>Content</Trans>,
    dataIndex: 'content',
  },
  {
    title: <Trans>Time</Trans>,
    dataIndex: 'timestamp',
  },
];

const mockDataItem = {
  key: 1,
  type: 'Info',
  object: 'Node',
  info: 'node info',
  content: 'event content',
  timestamp: '2021-08-10 19:19:22',
};

const mockData = Array(8)
  .fill(0)
  .map((val, i) => {
    return { ...mockDataItem, key: i };
  });

export function EventTable() {
  const [downloadLimit, setLimit] = useState('100');

  const handleChange = value => {
    setLimit(value);
  };

  const handleClick = () => {
    let downloadData = mockData.slice(0, Math.min(mockData.length, parseInt(downloadLimit)));
    downloadTable(tableData2txt(columns, downloadData), 'test.txt');
  };

  return (
    <Card style={{ margin: '20px 0' }}>
      <h3>
        <Trans>Events</Trans>
      </h3>
      <div style={{ float: 'right', margin: '5px 0' }}>
        <Select
          defaultValue={downloadLimit}
          style={{ width: 120, marginRight: '5px' }}
          onChange={handleChange}
        >
          <Option value="100">
            <Trans>100 items</Trans>
          </Option>
          <Option value="200">
            <Trans>200 items</Trans>
          </Option>
          <Option value="500">
            <Trans>500 items</Trans>
          </Option>
        </Select>
        <Button onClick={handleClick}>
          <DownloadOutlined />
          <Trans>Download</Trans>
        </Button>
      </div>

      <Table style={{ marginTop: '15px' }} columns={columns} dataSource={mockData} />
    </Card>
  );
}
