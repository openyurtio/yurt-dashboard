import { message } from "antd";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Currently, Experience center only support large screen (width >= 630)
if (window.innerWidth < 800) {
  message.warn(
    "体验中心UI还未完全适配移动端设备，在大屏上访问会有更好的体验😉！",
    10
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
