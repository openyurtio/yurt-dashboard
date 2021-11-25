import { Button } from "antd";
import { useState } from "react";
import { getCurrentTime } from "../../utils/utils";

export function RefreshButton({ refreshCallback }) {
  const [lastUpdate, setLastUpdate] = useState(getCurrentTime());
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    if (refreshCallback) {
      await refreshCallback();
    }
    setLastUpdate(getCurrentTime());
    setLoading(false);
  };

  return (
    <div style={{ float: "right", marginBottom: 3 }}>
      <span style={{ marginRight: 8, color: "#919CA4" }}>
        上次更新: {lastUpdate}
      </span>
      <Button
        aria-label="refresh"
        loading={loading}
        size="small"
        onClick={handleClick}
      >
        刷新
      </Button>
    </div>
  );
}
