import {
  Button,
  Space,
  Popover,
  Modal,
  Upload,
  Input,
  message,
  Form,
  Popconfirm,
} from "antd";
import {
  ToolOutlined,
  FileDoneOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useForm } from "antd/lib/form/Form";
const { TextArea } = Input;

/**
 * ConfigEditorInput: configuration edit input
 * @param onChange      // Support as a form item. When used as a form item, a string type data will be returned, and the initialValues ​​attribute of the form needs to be set.
 * @param getDefaultValueFunc     // Specify the function to get the default value, which needs to return a Promise object
 * @param downloadFileName        // Specifies the file name when saving the configuration file. Defaults to values.yaml
 */
export default function ConfigEditorInput({
  onChange,
  getDefaultValueFunc,
  downloadFileName,
}) {
  const [form] = useForm();

  const [configValue, setConfigValue] = useState("");
  const [showChangeLabel, setShowChangeLabel] = useState(false);

  const [defaultValue, setDefaultValue] = useState("");
  const [hasDefaultValue, setHasDefaultValue] = useState(false);

  const [configChange, setConfigChange] = useState(false);
  const [inputDisable, setInputDisable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);

  // form item support
  const triggerChange = (newValue) => {
    onChange?.(newValue);
  };
  const saveConfigValue = (newValue) => {
    setConfigValue(newValue);
    triggerChange(newValue);
  };

  // modal
  const openModal = async () => {
    setModalVisible(true);
    if (configValue === "") {
      loadDefaultValue(false);
    } else {
      form.setFieldsValue({ value_file: configValue });
    }
  };
  const onModalClose = () => {
    setConfigChange(false);
    setModalVisible(false);
    form.resetFields();
  };
  const onModalSave = () => {
    if (configChange) {
      var formValue = form.getFieldValue("value_file");
      if (formValue === defaultValue) {
        saveConfigValue("");
        setShowChangeLabel(false);
      } else {
        saveConfigValue(formValue);
        setShowChangeLabel(true);
      }
    }
    onModalClose();
  };
  const onModalCancel = () => {
    onModalClose();
  };

  return (
    <Space>
      <Button
        htmlType="button"
        style={{
          margin: "0 8px",
        }}
        onClick={openModal}
      >
        编辑配置
      </Button>
      <Popover content="配置已更改">
        <FileDoneOutlined hidden={!showChangeLabel} />
      </Popover>

      <Modal
        style={{
          minWidth: "600px",
          maxWidth: "45%",
        }}
        title="配置编辑"
        visible={modalVisible}
        maskClosable={false}
        destroyOnClose
        closable={false}
        footer={[
          <span style={{ float: "left" }} key="config-operation">
            <Button
              icon={<ToolOutlined />}
              disabled={inputDisable}
              onClick={() => {
                loadDefaultValue(true);
              }}
            >
              默认配置
            </Button>
            <Upload
              accept=".txt, .yaml"
              showUploadList={false}
              beforeUpload={(file) => {
                return onFileUpload(file);
              }}
            >
              <Button
                style={{ marginLeft: 10 }}
                icon={<UploadOutlined />}
                disabled={inputDisable}
              >
                上传配置
              </Button>
            </Upload>
            <Button
              style={{ marginLeft: 10 }}
              icon={<DownloadOutlined />}
              disabled={inputDisable}
              onClick={onDownload}
            >
              保存配置
            </Button>
          </span>,
          <Popconfirm
            key="cancel-popconfirm"
            title="配置已变更，是否放弃变更？"
            visible={cancelConfirmVisible}
            okText="放弃变更"
            okButtonProps={{ danger: true }}
            cancelText="取消"
            onConfirm={() => {
              setCancelConfirmVisible(false);
              onModalCancel();
            }}
            onCancel={() => {
              setCancelConfirmVisible(false);
            }}
            onVisibleChange={(newVisible) => {
              if (!newVisible) {
                setCancelConfirmVisible(newVisible);
                return;
              }
              if (configChange) {
                setCancelConfirmVisible(newVisible);
              } else {
                onModalCancel();
              }
            }}
          >
            <Button disabled={inputDisable}>关闭</Button>
          </Popconfirm>,
          <Button
            key="confirm-button"
            style={{ marginLeft: 10 }}
            disabled={inputDisable}
            type="primary"
            onClick={onModalSave}
          >
            保存
          </Button>,
        ]}
      >
        <Form
          preserve={false}
          form={form}
          layout="vertical"
          initialValues={{
            value_file: "",
          }}
        >
          <Form.Item name="value_file">
            <TextArea
              rows={15}
              disabled={inputDisable}
              onChange={(e) => {
                setConfigChange(true);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );

  async function loadDefaultValue(reload) {
    if (!hasDefaultValue || reload) {
      if (getDefaultValueFunc) {
        form.setFieldsValue({ value_file: "loading values.yaml ..." });
        setInputDisable(true);

        await getDefaultValueFunc().then((res) => {
          setHasDefaultValue(true);
          setDefaultValue(res);
          setInputDisable(false);
          form.setFieldsValue({ value_file: res });

          setConfigChange(configValue !== "");
        });
      } else {
        setHasDefaultValue(true);
        form.setFieldsValue({ value_file: "" });
      }
    } else {
      form.setFieldsValue({ value_file: defaultValue });
    }
  }

  function onFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.setFieldsValue({
        value_file: e.target.result,
      });
      setConfigChange(true);
    };
    reader.readAsText(file);
    return false;
  }

  function onDownload() {
    const downloadLink = document.createElement("a");
    const encodedData = encodeURIComponent(form.getFieldValue("value_file"));
    const fileName = downloadFileName
      ? downloadFileName + ".yaml"
      : "values.yaml";
    downloadLink.href = "data:text/plain;charset=UTF-8," + encodedData;
    downloadLink.download = fileName;
    downloadLink.click();
    message.info("文件已开始下载，将保存为" + fileName);
  }
}
