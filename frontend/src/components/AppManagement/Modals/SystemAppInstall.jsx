import { Modal, Button, Form, message, Select } from "antd";
import { useEffect, useState } from "react";
import {
  getNodes,
  sendUserRequest,
  sendUserRequestWithTimeout,
} from "../../../utils/request";
import ConfigEditorInput from "../../Utils/ConfigEditorInput";

export default function SystemAppInstallModal({
  data,
  visible,
  onClose,
  onDealing,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [showConfigFileItem, setShowConfigFileItem] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);
  const onModalClose = () => {
    form.resetFields();
    setShowConfigFileItem(false);
    setInstallLoading(false);
    onClose();
  };
  const onInstallBegin = () => {
    onDealing();
  };
  const onInstallSuccess = () => {
    onModalClose();
    onSuccess();
  };
  // set the default installed version
  const [appVersion, setAppVersion] = useState("");
  useEffect(() => {
    if (visible === true && !!data.version) {
      form.setFieldsValue({
        version: data.version.version,
      });
      setAppVersion(data.version.app_version);
    }
  }, [visible]);

  return (
    <Modal
      style={{
        minWidth: "600px",
        maxWidth: "45%",
      }}
      title={data.title}
      visible={visible}
      maskClosable={false}
      onCancel={onModalClose}
      destroyOnClose
      footer={[
        <Button
          key="install-button"
          type="primary"
          loading={installLoading}
          onClick={() => {
            setInstallLoading(true);
            installSystemApp(form.getFieldsValue());
          }}
        >
          安装
        </Button>,
      ]}
    >
      <Form
        preserve={false}
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 14,
        }}
        layout="horizontal"
        form={form}
        initialValues={{
          version: "",
          appVersion: "",
          config: "defaultConfig",
          config_file: "",
        }}
      >
        <Form.Item label="介绍">{data.desc}</Form.Item>
        <Form.Item label="版本" name="version" tooltip="选择安装的Chart包版本">
          <Select
            style={{ width: 120 }}
            options={
              data.versions &&
              data.versions.map((item) => ({
                value: item.version,
                label: item.version,
              }))
            }
            onChange={(value) => {
              data.versions.forEach((item) => {
                if (item.version === value) {
                  setAppVersion(item.app_version);
                }
              });
            }}
          />
        </Form.Item>
        <Form.Item label="APP版本" tooltip="app版本">
          {appVersion}
        </Form.Item>
        <Form.Item label="配置" name="config" tooltip="配置方式">
          <Select
            options={[
              { label: "默认配置", value: "defaultConfig" },
              { label: "使用配置文件", value: "configFile" },
            ]}
            onChange={(value) => {
              if (value === "configFile") {
                setShowConfigFileItem(true);
              } else {
                setShowConfigFileItem(false);
              }
            }}
          />
        </Form.Item>
        {showConfigFileItem && (
          <Form.Item label="配置文件" name="config_file">
            <ConfigEditorInput
              downloadFileName={data.title}
              getDefaultValueFunc={getConfigDefaultValue}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );

  async function installSystemApp(v) {
    const nodeList = await getNodes();
    if (nodeList.length === 0) {
      message.info("Tips: 请您先至少接入一个节点， 然后再尝试安装功能😄。");
      return;
    }
    onInstallBegin();
    sendUserRequest("/system/appInstall", {
      chart_name: data.title,
      version: v.version,
      config: v.config,
      config_file: v.config === "configFile" ? v.config_file : "",
    })
      .then((res) => {
        if (res.status === true) {
          setTimeout(() => message.info("安装成功"), 1000);
        }
      })
      .finally(onInstallSuccess);
  }

  function getConfigDefaultValue() {
    return sendUserRequestWithTimeout(10000, "/system/appDefaultConfig", {
      chart_name: data.title,
      version: data.version.version,
    }).then((res) => {
      if (
        res.data &&
        "default_config" in res.data &&
        typeof res.data.default_config === "string"
      ) {
        return res.data.default_config;
      } else {
        return "";
      }
    });
  }
}
