import { Trans } from '@lingui/react/macro';
import { Button, Form, message, Modal, Popconfirm } from 'antd';
import { useState } from 'react';
import { sendUserRequest } from '../../../utils/request';

export default function SystemAppManageModal({ data, visible, onClose, onDealing, onSuccess }) {
  const [modalLoading, setModalLoading] = useState(false);
  const onModalClose = () => {
    setModalLoading(false);
    onClose();
  };
  const onUninstallBegin = () => {
    onDealing();
  };
  const onUninstallSuccess = () => {
    onModalClose();
    onSuccess();
  };

  const isOnlyUninstall = () => {
    if (!data.supported || data.status === 'failed') return true;
    return false;
  };

  return (
    <Modal
      style={{
        minWidth: '600px',
        maxWidth: '45%',
      }}
      title={data.title}
      visible={visible}
      maskClosable={false}
      onCancel={onModalClose}
      destroyOnClose
      footer={[
        <Button
          key="upgrade-button"
          style={{ display: isOnlyUninstall() ? 'none' : '' }}
          onClick={() => {
            message.info(<Trans>Feature is under development, please stay tuned</Trans>);
          }}
        >
          <Trans>Upgrade</Trans>
        </Button>,
        <Popconfirm
          key="uninstall-popconfirm"
          title={<Trans>Are you sure you want to uninstall the component?</Trans>}
          okText={<Trans>Confirm Uninstall</Trans>}
          cancelText={<Trans>Cancel</Trans>}
          okButtonProps={{ danger: true }}
          onConfirm={() => {
            setModalLoading(true);
            uninstallSystemApp();
          }}
        >
          <Button type="primary" danger loading={modalLoading}>
            <Trans>Uninstall</Trans>
          </Button>
        </Popconfirm>,
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
      >
        <Form.Item label={<Trans>Introduction</Trans>}>{data.desc}</Form.Item>
        <Form.Item label={<Trans>Current Version</Trans>}>
          {data.version && data.version.version}
        </Form.Item>
        <Form.Item label={<Trans>APP Version</Trans>}>
          {data.version && data.version.app_version}
        </Form.Item>
      </Form>
    </Modal>
  );

  async function uninstallSystemApp(v) {
    onUninstallBegin();
    sendUserRequest('/system/appUninstall', {
      chart_name: data.title,
    })
      .then(res => {
        if (res.status === true) {
          setTimeout(() => message.info(<Trans>Uninstalled Successfully</Trans>), 1000);
        }
      })
      .finally(onUninstallSuccess);
  }
}
