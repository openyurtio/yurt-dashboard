import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Select, Table } from 'antd';
import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { downloadTable, tableData2txt } from '../../utils/utils';

const { Option } = Select;

const columns = [
  {
    title: <Trans>类型</Trans>,
    dataIndex: 'type',
  },
  {
    title: <Trans>对象</Trans>,
    dataIndex: 'object',
  },
  {
    title: <Trans>信息</Trans>,
    dataIndex: 'info',
  },
  {
    title: <Trans>内容</Trans>,
    dataIndex: 'content',
  },
  {
    title: <Trans>时间</Trans>,
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
      <h3><Trans>事件</Trans></h3>
      <div style={{ float: 'right', margin: '5px 0' }}>
        <Select
          defaultValue={downloadLimit}
          style={{ width: 120, marginRight: '5px' }}
          onChange={handleChange}
        >
          <Option value="100"><Trans>100条</Trans></Option>
          <Option value="200"><Trans>200条</Trans></Option>
          <Option value="500"><Trans>500条</Trans></Option>
        </Select>
        <Button onClick={handleClick}>
          <DownloadOutlined />
          <Trans>下载</Trans>
        </Button>
      </div>

      <Table style={{ marginTop: '15px' }} columns={columns} dataSource={mockData} />
    </Card>
  );
}
