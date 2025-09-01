import { Trans } from '@lingui/react/macro';
import { Button, message, Table } from 'antd';
import { useState } from 'react';
import { RefreshButton } from './RefreshButton';

/**
 * STable: Selectable Table
 * @param config.filterComponents  // filter UI components
 * @param config.data       // table data
 * @param config.columns    // table columns
 * @param config.onRefresh  // refreshButton callback
 * @param config.tableProps // additional table props
 */
function STable({ config }) {
  const [selected, setSelected] = useState([]);

  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{ marginBottom: 8 }}>
        {config.filterComponents}
        <RefreshButton refreshCallback={config.onRefresh}></RefreshButton>
      </div>
      <Table
        size="small"
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            setSelected(selectedRows);
          },
          getCheckboxProps: record => ({
            name: record.name,
          }),
        }}
        columns={config.columns}
        dataSource={config.data}
        loading={config.data === null}
        {...(config.tableProps || {})}
      />

      {config.data && config.data.length > 0 ? (
        <div style={{ position: 'relative', bottom: 42, width: 'fit-content' }}>
          <Button
            onClick={() => {
              message.info(<Trans>Feature under development, please stay tuned</Trans>);
            }}
            disabled={selected.length === 0}
          >
            <Trans>Batch Remove</Trans>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default STable;
