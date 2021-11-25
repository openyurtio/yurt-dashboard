import { Select } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Option } = Select;

/**
 * a Select whose options can be refreshed
 * @param {Object} config.style
 * @param {string} config.value
 * @param {Function} handleChange   called when selected option change
 * @param {Function} handleRefresh  called when refresh button change
 */
export default function RSelect({
  config,
  handleRefresh: getOptions,
  handleChange,
}) {
  const [spin, setSpin] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      setOptions(await getOptions());
      setSpin(false);
    }
    setSpin(true);
    fetchOptions();
  }, [getOptions]);

  const resetSelect = (options) => {
    setOptions(options);
    handleChange(options.length > 0 ? options[0] : config.value);
  };

  return (
    <div style={{ display: "inline-block", margin: "0 5px" }}>
      <Select
        value={config.value}
        style={config.style}
        onChange={handleChange}
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
        onClick={async () => {
          setSpin(true);
          resetSelect(await getOptions());
          setTimeout(() => setSpin(false), 1000);
        }}
      />
    </div>
  );
}
