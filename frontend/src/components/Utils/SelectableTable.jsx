import { Table, Button, message } from "antd";
import { useState } from "react";
import { RefreshButton } from "./RefreshButton";

/**
 * STable: Selectable Table
 * @param config.filterComponents
 * @param config.data       // table data
 * @param config.columns    // table columns
 * @param config.onRefresh  // refreshButton callback
 */
function STable({ config }) {
  const [selected, setSelected] = useState([]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {config.filterComponents}
        <RefreshButton refreshCallback={config.onRefresh}></RefreshButton>
      </div>
      <Table
        size="small"
        rowSelection={{
          type: "checkbox",
          onChange: (selectedRowKeys, selectedRows) => {
            console.log(
              `selectedRowKeys: ${selectedRowKeys}`,
              "selectedRows: ",
              selectedRows
            );
            setSelected(selectedRows);
          },
          getCheckboxProps: (record) => ({
            name: record.name,
          }),
        }}
        columns={config.columns}
        dataSource={config.data}
        loading={config.data === null}
      />

      {config.data && config.data.length > 0 ? (
        <div style={{ position: "relative", bottom: 42, width: "fit-content" }}>
          <Button
            onClick={() => {
              message.info("功能开发中，敬请期待");
            }}
            disabled={selected.length === 0}
          >
            批量移除
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default STable;
