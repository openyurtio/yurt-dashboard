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
            message.info(<Trans>功能正在开发中，敬请期待</Trans>);
          }}
        >
          <Trans>升级</Trans>
        </Button>,
        <Popconfirm
          key="uninstall-popconfirm"
          title={<Trans>是否确认卸载组件？</Trans>}
          okText={<Trans>确认卸载</Trans>}
          cancelText={<Trans>取消</Trans>}
          okButtonProps={{ danger: true }}
          onConfirm={() => {
            setModalLoading(true);
            uninstallSystemApp();
          }}
        >
          <Button type="primary" danger loading={modalLoading}>
            <Trans>卸载</Trans>
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
        <Form.Item label={<Trans>介绍</Trans>}>{data.desc}</Form.Item>
        <Form.Item label={<Trans>当前版本</Trans>}>{data.version && data.version.version}</Form.Item>
        <Form.Item label={<Trans>APP版本</Trans>}>{data.version && data.version.app_version}</Form.Item>
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
          setTimeout(() => message.info(<Trans>卸载成功</Trans>), 1000);
        }
      })
      .finally(onUninstallSuccess);
  }
}
