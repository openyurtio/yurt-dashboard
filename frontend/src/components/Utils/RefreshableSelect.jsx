import { Select } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Option } = Select;

/**
 * a Select whose options can be refreshed
 * @param {Object} config.style
 * @param {Function} config.handleChange   called when selected option change
 * @param {Function} config.handleRefresh  called when refresh button change
 * @param {string} config.value
 */
export default function RSelect({ config }) {
  const [spin, setSpin] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(async () => {
    setSpin(true);
    setOptions(await config.handleRefresh());
    setSpin(false);
  }, []);

  const resetSelect = (options) => {
    setOptions(options);
    config.handleChange(options.length > 0 ? options[0] : config.value);
  };

  const handleSync = async () => {
    setSpin(true);
    resetSelect(await config.handleRefresh());
    setTimeout(() => setSpin(false), 1000);
  };

  return (
    <div style={{ display: "inline-block", margin: "0 5px" }}>
      <Select
        value={config.value}
        style={config.style}
        onChange={config.handleChange}
        disabled={spin}
      >
        {options.map((e, i) => (
          <Option key={i} value={e}>
            {e}
          </Option>
        ))}
      </Select>
      <SyncOutlined
        style={{ marginLeft: 5 }}
        spin={spin}
        onClick={handleSync}
      />
    </div>
  );
}
