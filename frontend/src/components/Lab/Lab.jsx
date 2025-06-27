import { RightOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Button, Form, Input, InputNumber, message, Modal, Switch, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNodes, sendUserRequest } from '../../utils/request';
import App from './App';

const { Paragraph, Link } = Typography;

const appInfo = {
  RSSHub: {
    avatar:
      'https://camo.githubusercontent.com/79f2dcf6fb41b71619186b12eed25495fa55e20d3f21355798a2cb22703c6f8b/68747470733a2f2f692e6c6f6c692e6e65742f323031392f30342f32332f356362656237653431343134632e706e67',
    desc: <Trans>RSSHub 是一个开源、简单易用、易于扩展的 RSS 生成器，可以给任何奇奇怪怪的内容生成 RSS 订阅源。RSSHub 借助于开源社区的力量快速发展中，目前已适配数百家网站的上千项内容。</Trans>,
    img: 'https://store-images.s-microsoft.com/image/apps.26097.717f8ad3-f5cc-479d-8b33-e34b63ca5b78.48a82a81-a971-4050-876d-2cdd1190f1e8.debf4886-b41e-4d62-b442-ebd6b7f6b2c9',
    container: ['diygod/rsshub'],
  },
  WordPress: {
    avatar:
      'https://th.bing.com/th/id/OIP.Q5K3ZcL44_iWH0CfOeyh-AHaHW?w=169&h=180&c=7&r=0&o=5&dpr=2&pid=1.7',
    desc: <Trans>WordPress是一个以PHP和MySQL为平台的自由开源的博客软件和内容管理系统。WordPress是最受欢迎的网站内容管理系统。全球有大约30%的网站都是使用WordPress架设网站的。</Trans>,
    img: 'https://websitesetup.org/wp-content/uploads/2018/03/cms-comparison-wordpress-vs-joomla-vs-drupal-wordpress-dashboard-1024x640.jpg',
    container: ['wordpress', 'mysql:5.7'],
  },
};

function useModalConfig(refreshConfigList) {
  const initConfigList = [
    {
      app: 'RSSHub',
      created: false,
      info: appInfo['RSSHub'],
      dpName: 'lab-rsshub-dp',
      service: true,
      port: 80,
      replicas: 1,
    },
    {
      app: 'WordPress',
      created: false,
      info: appInfo['WordPress'],
      dpName: 'lab-wordpress-dp',
      service: true,
      port: 80,
      replicas: 1,
    },
  ];

  const [modalConfigList, setConfigList] = useState(initConfigList);
  const [selectedModal, setSelected] = useState(0);
  useEffect(() => {
    sendUserRequest('/getApps').then(appList =>
      setConfigList(oldConfigList => refreshConfigList(oldConfigList, appList))
    );
  }, [refreshConfigList]);

  // update APP config
  const setConfig = newConfig => {
    modalConfigList[selectedModal] = Object.assign(modalConfigList[selectedModal], newConfig);
    setConfigList([...modalConfigList]);
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [modalTip, setTip] = useState(null);

  return [
    isModalVisible,
    modalTip,
    modalConfigList,
    modalConfigList[selectedModal],
    id => {
      setSelected(id);
      setModalVisible(true);
    },
    () => {
      setModalVisible(false);
      setTip(null);
    },
    setConfig,
    setTip,
  ];
}

function updateConfigList(oldConfigList, appList) {
  const appConfigList = appList
    .filter(app => app.Deployment !== null)
    .map(app => ({
      ...app.Deployment.metadata.labels,
      created: true,
      dpName: app.Deployment.metadata.name,
      replicas: app.Deployment.spec.replicas,
      service: app.Service !== null,
    }));

  const combineItemByName = name =>
    Object.assign(
      oldConfigList.find(config => config.app === name),
      appConfigList.find(dp => dp.app === name)
    );

  return Object.keys(appInfo).map(combineItemByName);
}

function Lab() {
  const navigate = useNavigate();
  const [isModalVisible, modalTip, appList, modalConfig, openModal, closeModal, setConfig, setTip] =
    useModalConfig(updateConfigList);

  return (
    <div>
      <div>
        <h2>OpenYurt Lab</h2>
        <Paragraph>
          <blockquote>
            <Trans>一键部署样例程序到你的OpenYurt集群。不知道如何部署？请参考</Trans>
            <Link
              href="https://openyurt.io/docs/installation/openyurt-experience-center/web_console"
              target="_blank"
            >
              <Trans>文档➡️</Trans>
            </Link>
            <br></br>
            <Trans>更多样例程序即将上线，敬请期待😁！</Trans>
          </blockquote>
        </Paragraph>
      </div>

      <div
        style={{
          display: 'flex',
        }}
      >
        {appList.map((item, index) => (
          <App
            key={index}
            avatar={item.info.avatar}
            desc={item.info.desc}
            img={item.info.img}
            title={item.app}
            status={item.created === true}
            setConfig={() => {
              openModal(index);
            }}
          ></App>
        ))}
      </div>

      <Modal
        style={{
          minWidth: '600px',
          maxWidth: '45%',
        }}
        title={modalConfig.app}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button
            key="details"
            style={{
              float: 'left',
              display: modalConfig.created ? '' : 'none',
            }}
            onClick={() => {
              navigate('/deployment');
            }}
          >
            <Trans>更多详细信息</Trans> <RightOutlined />
          </Button>,
          <Button key="uninstall" type="primary" danger disabled={!modalConfig.created} onClick={uninstallApp}>
            <Trans>卸载</Trans>
          </Button>,
          <Button key="install" type="primary" disabled={modalConfig.created} onClick={installApp}>
            <Trans>安装</Trans>
          </Button>,
        ]}
      >
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
        >
          <Form.Item label={<Trans>Name</Trans>} tooltip={<Trans>部署Deployment名称</Trans>}>
            <Input
              value={modalConfig.dpName}
              disabled={modalConfig.created}
              onChange={e => {
                setConfig({
                  dpName: e.target.value,
                });
              }}
            />
          </Form.Item>

          <Form.Item label={<Trans>Replicas</Trans>} tooltip={<Trans>部署实例数</Trans>}>
            <InputNumber
              disabled={modalConfig.created}
              value={modalConfig.replicas}
              onChange={val =>
                setConfig({
                  replicas: val,
                })
              }
            />
          </Form.Item>

          <Form.Item label="Container" tooltip="APP使用的容器镜像">
            {modalConfig.info.container.join(', ')}
          </Form.Item>

          <Form.Item label="Service" tooltip="是否通过Service将应用以ClusterIP的形式暴露出来">
            <Switch
              disabled={modalConfig.created}
              checked={modalConfig.service}
              onChange={val =>
                setConfig({
                  service: val,
                })
              }
            />
          </Form.Item>
          <Form.Item label="Port" tooltip="Service将使用的端口">
            <InputNumber
              disabled={modalConfig.created || !modalConfig.service}
              value={modalConfig.port}
              onChange={val =>
                setConfig({
                  port: val,
                })
              }
            />
          </Form.Item>
        </Form>
        <div
          style={{
            color: 'red',
          }}
        >
          {modalTip}
        </div>
      </Modal>
    </div>
  );

  function uninstallApp() {
    sendUserRequest('/uninstallApp', {
      DeploymentName: modalConfig.dpName,
      App: modalConfig.app,
      Service: modalConfig.service,
    })
      .then(res => {
        if (res.status === true) {
          // since antd.message conflict with antd.Modal
          // use setTimeout to show message after modal is closed
          setTimeout(() => message.info(res.msg), 1000);
          setConfig({
            created: false,
          });
        }
      })
      .finally(closeModal);
  }

  async function installApp() {
    // fields check
    const dpNameRegex = new RegExp(
      /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/
    );
    if (!modalConfig.dpName || !dpNameRegex.test(modalConfig.dpName)) {
      setTip('Tips: Deployment Name需要满足DNS subdomain的命名规范');
      return;
    }
    if (modalConfig.service && (modalConfig.port <= 0 || modalConfig.port > 65535)) {
      setTip('Tips: 端口范围需要在1-65535之间');
      return;
    }

    const nodeList = await getNodes();
    if (nodeList.length === 0) {
      setTip('Tips: 请您先至少接入一个节点， 然后再尝试实验室功能😄。');
      return;
    }

    // create deployment & service
    sendUserRequest('/installApp', {
      DeploymentName: modalConfig.dpName,
      App: modalConfig.app,
      Service: modalConfig.service,
      Replicas: modalConfig.replicas,
      Port: modalConfig.port,
    })
      .then(res => {
        if (res.status === true) {
          // since antd.message conflict with antd.Modal
          // use setTimeout to show message after modal is closed
          setTimeout(() => message.info(res.msg), 1000);
          setConfig({
            created: true,
          });
        }
      })
      .finally(closeModal);
  }
}

export default Lab;
