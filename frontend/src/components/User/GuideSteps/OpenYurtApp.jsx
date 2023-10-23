import { Button, Checkbox, message } from "antd";
import { useState } from "react";
import { sendRequest } from "../../../utils/request";

const compareApps = (a, b) => {
  if (a.required === b.required) {
    return a.name.localeCompare(b.name);
  }
  if (a.required) {
    return -1;
  }
  return 1;
};

const getAllChecked = (appList) => {
  let a = [];
  appList.forEach((item) => {
    a.push(item.name);
  });
  return a;
};

const getDefaultChecked = (appList) => {
  let a = [];
  appList.forEach((item) => {
    if (item.required) {
      a.push(item.name);
    }
  });
  return a;
};

// Step: Openyurt component installation.
const OpenYurtAppGuide = ({ guideInfo, onStepFinish }) => {
  const [installFailed, setInstallFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState("");
  const [appDesc, setAppDesc] = useState("");

  let allChecked = getAllChecked(guideInfo.openyurt_apps);
  let defaultChecked = getDefaultChecked(guideInfo.openyurt_apps);
  const [checkedList, setCheckedList] = useState(defaultChecked);
  const [indeterminate, setIndeterminate] = useState(
    defaultChecked.length && defaultChecked.length < allChecked.length
  );
  const [checkAll, setCheckAll] = useState(
    defaultChecked.length === allChecked.length
  );

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(list.length && list.length < allChecked.length);
    setCheckAll(list.length === allChecked.length);
  };

  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? allChecked : defaultChecked);
    setIndeterminate(!e.target.checked && defaultChecked.length);
    setCheckAll(e.target.checked);
  };

  const installOpenYurtApp = () => {
    setLoading(true);
    sendRequest("/system/appInstallFromGuide", { apps_name: checkedList }).then(
      (res) => {
        message.success("安装成功！已安装组件：" + res.msg);
        onStepFinish();
      },
      (err) => {
        console.log(err);
        setTips("安装失败：" + err.message);
        setInstallFailed(true);
        setLoading(false);
      }
    );
  };

  return (
    <div>
      <div style={{ display: "flex", height: 200 }}>
        <div style={{ width: 150 }}>
          <div style={{ display: "flex" }}>
            <p>共{guideInfo.openyurt_apps.length}项</p>
            <Checkbox
              style={{ marginLeft: 10 }}
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              全选
            </Checkbox>
          </div>
          <Checkbox.Group
            style={{ display: "grid", gridGap: "10px" }}
            options={guideInfo.openyurt_apps.sort(compareApps).map((info) => ({
              label: (
                <label onClick={() => setAppDesc(info.desc)}>{info.name}</label>
              ),
              value: info.name,
              disabled: info.required,
            }))}
            value={checkedList}
            onChange={onChange}
          />
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid #000",
            textAlign: "left",
            padding: 10,
            display: "flex",
            flexWrap: "wrap",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            marginLeft: 20,
          }}
        >
          {appDesc}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            color: "red",
          }}
        >
          {tips}
        </div>
        {installFailed ? (
          <div>
            <Button
              style={{ marginRight: 10 }}
              type="primary"
              onClick={installOpenYurtApp}
              loading={loading}
            >
              重试安装
            </Button>
            <Button onClick={onStepFinish}>跳过</Button>
          </div>
        ) : (
          <Button type="primary" loading={loading} onClick={installOpenYurtApp}>
            安装组件
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpenYurtAppGuide;
