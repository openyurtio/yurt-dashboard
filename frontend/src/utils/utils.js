import { useCallback, useEffect, useState } from "react";
import { message } from "antd";

// use sessionStorage to cache state
export function useCacheState(cache_key, default_val) {
  const cache_val = sessionStorage.getItem(cache_key);
  const [state, setState] = useState(
    cache_val ? JSON.parse(cache_val) : default_val
  );
  return [
    state,
    (new_val) => {
      setState(new_val);
      sessionStorage.setItem(cache_key, JSON.stringify(new_val));
    },
  ];
}

// reource components state
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

export function tableData2txt(
  columns,
  dataSource,
  colDelimiter = ";",
  lineDelimiter = "\n"
) {
  let txtHeaders = columns.map((header) => header.title).join(colDelimiter);
  let txtContens = dataSource
    .map((line) => columns.map((col) => line[col.dataIndex]).join(colDelimiter))
    .join(lineDelimiter);
  return txtHeaders + lineDelimiter + txtContens;
}

export function downloadTable(content, fileName) {
  let blob = new Blob(["\ufeff" + content], {
    type: "text/txt;charset=utf-8;",
  }); // add prefix BOM
  let downloadLink = document.createElement("a");
  if ("download" in downloadLink) {
    // check if browser support H5 download attribute
    let url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.hidden = true;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } else {
    console.log("H5 download not supported");
  }
}

export function copy2clipboard(content) {
  let clipboardWriter;
  if (navigator.clipboard && window.isSecureContext) {
    clipboardWriter = navigator.clipboard.writeText(content);
  } else {
    // for non-secure connection
    // text area method
    let textArea = document.createElement("textarea");
    textArea.value = content;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    clipboardWriter = new Promise((res, rej) => {
      // use the old API instead
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
  }

  clipboardWriter.then(
    () => message.success("Copy success"),
    () => message.error("Copy fail")
  );
}

export function getCurrentTime() {
  return new Date().toLocaleTimeString();
}

export function toPercentagePresentation(num, decimal = 2) {
  return String(num.toFixed(decimal + 2) * 100) + "%";
}

// render obj as multiline cell
export function renderDictCell(dict) {
  return (
    <div>
      {dict &&
        Object.keys(dict).map((key, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            {key} : {dict[key]}
          </div>
        ))}
    </div>
  );
}

export function formatTime(ISOString) {
  const timestamp = Date.parse(ISOString);
  if (timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-cn");
  }
}
