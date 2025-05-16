import { DownloadOutlined } from '@ant-design/icons';
import { tableData2txt, downloadTable } from '../../utils/utils';
import { useState } from 'react';
import { Select, Card, Table, Button } from 'antd';

const { Option } = Select;

const columns = [
  {
    title: '类型',
    dataIndex: 'type',
  },
  {
    title: '对象',
    dataIndex: 'object',
  },
  {
    title: '信息',
    dataIndex: 'info',
  },
  {
    title: '内容',
    dataIndex: 'content',
  },
  {
    title: '时间',
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
      <h3>事件</h3>
      <div style={{ float: 'right', margin: '5px 0' }}>
        <Select
          defaultValue={downloadLimit}
          style={{ width: 120, marginRight: '5px' }}
          onChange={handleChange}
        >
          <Option value="100">100条</Option>
          <Option value="200">200条</Option>
          <Option value="500">500条</Option>
        </Select>
        <Button onClick={handleClick}>
          <DownloadOutlined />
          下载
        </Button>
      </div>

      <Table style={{ marginTop: '15px' }} columns={columns} dataSource={mockData} />
    </Card>
  );
}
