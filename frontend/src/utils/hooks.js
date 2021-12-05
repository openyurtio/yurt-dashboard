// customized hooks
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { message } from "antd";

// use sessionStorage to cache state
export function useSessionState(cache_key, default_val) {
  return useCacheState(cache_key, default_val, sessionStorage);
}

// use localStorage to cache state
export function useLocalState(cache_key, default_val) {
  return useCacheState(cache_key, default_val, localStorage);
}

// useState with cache in storage
// cache has higher priority than val
function useCacheState(key, val, storage) {
  if (storage !== sessionStorage && storage !== localStorage) {
    throw new Error("Storage must be either sessionStorage or localStorage");
  }

  const cache_val = storage.getItem(key);
  const [state, setState] = useState(cache_val ? JSON.parse(cache_val) : val);
  return [
    state,
    (new_val) => {
      setState(new_val);
      storage.setItem(key, JSON.stringify(new_val));
    },
  ];
}

// resource components state
export function useResourceState(fetchData) {
  // rows contains the table data
  const [rows, setRows] = useState(null);
  // onRefresh used when page refresh or refresh button is clicked
  const onRefresh = useCallback(
    () => fetchData().then((res) => setRows(res)),
    [fetchData]
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return [rows, onRefresh];
}

// display information passed by router from last page
export function useLocationMsg() {
  const location = useLocation();
  if (location.state && location.state.msg) {
    message[location.state.type](location.state.msg, location.state.duration);
    location.state = {}; // clear msg after displaying
  }
  return location;
}
