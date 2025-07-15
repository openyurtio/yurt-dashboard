import {
  DownloadOutlined,
  FileDoneOutlined,
  ToolOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Button, Form, Input, message, Modal, Popconfirm, Popover, Space, Upload } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState } from 'react';
const { TextArea } = Input;

/**
 * ConfigEditorInput: configuration edit input
 * @param getDefaultValueFunc     // Specify the function to get the default value, which needs to return a Promise object
 * @param downloadFileName        // Specifies the file name when saving the configuration file. Defaults to values.yaml
 */
export default function ConfigEditorInput({ onChange, getDefaultValueFunc, downloadFileName }) {
  const [form] = useForm();

  const [configValue, setConfigValue] = useState('');
  const [showChangeLabel, setShowChangeLabel] = useState(false);

  const [defaultValue, setDefaultValue] = useState('');
  const [hasDefaultValue, setHasDefaultValue] = useState(false);

  const [configChange, setConfigChange] = useState(false);
  const [inputDisable, setInputDisable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);

  // form item support
  const triggerChange = newValue => {
    onChange?.(newValue);
  };
  const saveConfigValue = newValue => {
    setConfigValue(newValue);
    triggerChange(newValue);
  };

  // modal
  const openModal = async () => {
    setModalVisible(true);
    if (configValue === '') {
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
      const formValue = form.getFieldValue('value_file');
      if (formValue === defaultValue) {
        saveConfigValue('');
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
          margin: '0 8px',
        }}
        onClick={openModal}
      >
        <Trans>Edit Configuration</Trans>
      </Button>
      <Popover content={<Trans>Configuration Changed</Trans>}>
        <FileDoneOutlined hidden={!showChangeLabel} />
      </Popover>

      <Modal
        style={{
          minWidth: '600px',
          maxWidth: '45%',
        }}
        title={<Trans>Configuration Editing</Trans>}
        open={modalVisible}
        maskClosable={false}
        onCancel={onModalClose}
        destroyOnClose
        footer={[
          <span style={{ float: 'left' }} key="config-operation">
            <Button
              icon={<ToolOutlined />}
              disabled={inputDisable}
              onClick={() => {
                loadDefaultValue(true);
              }}
            >
              <Trans>Default Configuration</Trans>
            </Button>
            <Upload
              accept=".txt, .yaml"
              showUploadList={false}
              beforeUpload={file => {
                return onFileUpload(file);
              }}
            >
              <Button style={{ marginLeft: 10 }} icon={<UploadOutlined />} disabled={inputDisable}>
                <Trans>Upload Configuration</Trans>
              </Button>
            </Upload>
            <Button
              style={{ marginLeft: 10 }}
              icon={<DownloadOutlined />}
              disabled={inputDisable}
              onClick={onDownload}
            >
              <Trans>Save Configuration</Trans>
            </Button>
          </span>,
          <Popconfirm
            key="cancel-popconfirm"
            title={<Trans>Configuration has been changed, discard changes?</Trans>}
            open={cancelConfirmVisible}
            okText={<Trans>Discard Changes</Trans>}
            okButtonProps={{ danger: true }}
            cancelText={<Trans>Cancel</Trans>}
            onConfirm={() => {
              setCancelConfirmVisible(false);
              onModalCancel();
            }}
            onCancel={() => {
              setCancelConfirmVisible(false);
            }}
            onOpenChange={newVisible => {
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
            <Button disabled={inputDisable}>
              <Trans>Close</Trans>
            </Button>
          </Popconfirm>,
          <Button
            key="confirm-button"
            style={{ marginLeft: 10 }}
            disabled={inputDisable}
            type="primary"
            onClick={onModalSave}
          >
            <Trans>Save</Trans>
          </Button>,
        ]}
      >
        <Form
          preserve={false}
          form={form}
          layout="vertical"
          initialValues={{
            value_file: '',
          }}
        >
          <Form.Item name="value_file">
            <TextArea
              rows={15}
              disabled={inputDisable}
              onChange={e => {
                setConfigChange(true);
              }}
              placeholder="Please input your configuration here"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );

  async function loadDefaultValue(reload) {
    if (!hasDefaultValue || reload) {
      if (getDefaultValueFunc) {
        form.setFieldsValue({ value_file: 'loading values.yaml ...' });
        setInputDisable(true);

        await getDefaultValueFunc().then(res => {
          setHasDefaultValue(true);
          setDefaultValue(res);
          setInputDisable(false);
          form.setFieldsValue({ value_file: res });

          setConfigChange(configValue !== '');
        });
      } else {
        setHasDefaultValue(true);
        form.setFieldsValue({ value_file: '' });
      }
    } else {
      form.setFieldsValue({ value_file: defaultValue });
    }
  }

  function onFileUpload(file) {
    const reader = new FileReader();
    reader.onload = e => {
      form.setFieldsValue({
        value_file: e.target.result,
      });
      setConfigChange(true);
    };
    reader.readAsText(file);
    return false;
  }

  function onDownload() {
    const downloadLink = document.createElement('a');
    const encodedData = encodeURIComponent(form.getFieldValue('value_file'));
    const fileName = downloadFileName ? downloadFileName + '.yaml' : 'values.yaml';
    downloadLink.href = 'data:text/plain;charset=UTF-8,' + encodedData;
    downloadLink.download = fileName;
    downloadLink.click();
    message.info(<Trans>File download has started, will be saved as</Trans> + fileName);
  }
}
