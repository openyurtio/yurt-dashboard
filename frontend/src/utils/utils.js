import { message } from "antd";

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

const msPerDay = 1000 * 24 * 3600;
// Calculate how much time this user have left
export function getUserLastTime(effectiveTime) {
  return 7 - Math.floor((Date.now() - Date.parse(effectiveTime)) / msPerDay);
}

export function getUserExpireTime(effectiveTime, days) {
  const timestamp = Date.parse(effectiveTime) + days * msPerDay;
  return new Date(timestamp).toLocaleString("zh-cn");
}

let firstUse = true; // in case same prompt message show up several times
export function getUserProfile() {
  let userStr = sessionStorage.getItem("user");
  if (!userStr) {
    userStr = localStorage.getItem("user");
  }

  // check if user exist in cache
  if (!userStr) {
    return null;
  }

  const user = JSON.parse(userStr);
  const lastTime = getUserLastTime(user.status.effectiveTime);

  // if account has expired
  if (firstUse && lastTime <= 0) {
    firstUse = false;
    const delayMsg = message.error(
      "对不起，您的试用账号已满7天，平台将清空账号下资源。您可以选择重新注册一个账号，继续体验OpenYurt的能力。",
      0
    );
    // Dismiss manually and asynchronously
    setTimeout(delayMsg, 5000);
    return null;
  }

  // if the account is about to expire
  if (firstUse && lastTime <= 3) {
    message.warn(`您的账户将在${lastTime}日后过期`, 5);
    firstUse = false;
  }

  return user;
}

export function setUserProfile(isRemember, userObj) {
  let userStr = JSON.stringify(userObj);
  sessionStorage.setItem("user", userStr);
  if (isRemember) {
    localStorage.setItem("user", userStr);
  }
}

// used when log out
export function clearUserProfile() {
  sessionStorage.removeItem("user");
  localStorage.removeItem("user");
}
