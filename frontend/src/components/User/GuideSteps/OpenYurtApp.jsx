import { Button, Checkbox, message } from "antd";
import { useState } from "react";
import { sendRequest } from "../../../utils/request";

const transformApps = (info) => ({
  label: info.name,
  value: info.name,
  disabled: info.required,
});

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

const OpenYurtAppGuide = ({ guideInfo, onStepFinish }) => {
  const [installFailed, setInstallFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState("");

  let allChecked = getAllChecked(guideInfo.openyurt_apps);
  let defaultChecked = getDefaultChecked(guideInfo.openyurt_apps);
  const [checkedList, setCheckedList] = useState(defaultChecked);
  const [indeterminate, setIndeterminate] = useState(
    defaultChecked.length === 0 ||
      defaultChecked.length === guideInfo.openyurt_apps.length
      ? false
      : true
  );
  const [checkAll, setCheckAll] = useState(
    defaultChecked.length === guideInfo.openyurt_apps.length
  );

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(
      list.length && list.length < guideInfo.openyurt_apps.length
    );
    setCheckAll(list.length === guideInfo.openyurt_apps.length);
  };

  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? allChecked : defaultChecked);
    setIndeterminate(false);
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
      <div style={{ display: "inline-block" }}>
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
          style={{ marginTop: 10, display: "grid", gridGap: "10px" }}
          options={guideInfo.openyurt_apps.map(transformApps)}
          value={checkedList}
          onChange={onChange}
        />
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
