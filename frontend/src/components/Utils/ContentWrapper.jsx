import {
  AppstoreOutlined,
  DownOutlined,
  ExperimentOutlined,
  GoldOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import { Trans } from '@lingui/react/macro';
import { Avatar, Button, Card, Divider, Dropdown, Layout, Menu } from 'antd';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/OpenYurt.png';
import { useSessionState, useUserProfile } from '../../utils/hooks';
import { getUserLastTime } from '../../utils/utils';
import LanguageSwitcher from '../LanguageSwitcher';
const { Header, Content, Footer, Sider } = Layout;

const MySider = () => {
  const [userProfile] = useUserProfile();
  const location = useLocation();

  const [collapsed, setCollapse] = useSessionState('collapsed', false);
  const [openKeys, setOpenKeys] = useSessionState('openKeys', ['nodemanagement', 'workload']);

  const onCollapse = collapsed => {
    setCollapse(collapsed);
  };

  const onOpenChange = keys => {
    setOpenKeys(keys);
  };

  return (
    <Sider theme="light" width="210" collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <Menu
        openKeys={openKeys}
        selectedKeys={[location.pathname.slice(1)]}
        onOpenChange={onOpenChange}
        mode="inline"
        items={[
          {
            key: 'clusterInfo',
            icon: <InfoCircleOutlined />,
            label: (
              <Link to="/clusterInfo">
                <Trans>Cluster Information</Trans>
              </Link>
            ),
          },
          {
            key: 'nodemanagement',
            icon: <GoldOutlined />,
            label: <Trans>Node Management</Trans>,
            children: [
              {
                key: 'nodepool',
                label: (
                  <Link to="/nodepool">
                    <Trans>Node Pool</Trans>
                  </Link>
                ),
              },
              {
                key: 'nodes',
                label: (
                  <Link to="/nodes">
                    <Trans>Node</Trans>
                  </Link>
                ),
              },
            ],
          },
          {
            key: 'workload',
            icon: <AppstoreOutlined />,
            label: <Trans>Workloads</Trans>,
            children: [
              ...(userProfile && userProfile.metadata.name === 'admin'
                ? [
                    {
                      key: 'systemapp',
                      label: (
                        <Link to="/systemapp">
                          <Trans>System Applications</Trans>
                        </Link>
                      ),
                    },
                  ]
                : []),
              {
                key: 'pod',
                label: (
                  <Link to="/pod">
                    <Trans>Pods</Trans>
                  </Link>
                ),
              },
              {
                key: 'deployment',
                label: (
                  <Link to="/deployment">
                    <Trans>Stateless</Trans>
                  </Link>
                ),
              },
              {
                key: 'statefulset',
                label: (
                  <Link to="/statefulset">
                    <Trans>Stateful</Trans>
                  </Link>
                ),
              },
              {
                key: 'job',
                label: (
                  <Link to="/job">
                    <Trans>Tasks</Trans>
                  </Link>
                ),
              },
            ],
          },
          {
            key: 'lab',
            icon: <ExperimentOutlined />,
            label: (
              <Link to="/lab">
                <Trans>Lab</Trans>
              </Link>
            ),
          },
        ]}
      />
    </Sider>
  );
};

const contentFooter = (
  <Footer style={{ textAlign: 'center' }}>OpenYurt Experience Center ©2021-2022</Footer>
);

const helpEntrance = (
  <div style={{ position: 'fixed', right: '3%', bottom: '10%', cursor: 'pointer' }}>
    <Dropdown
      menu={{
        items: [
          {
            key: 1,
            label: (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/openyurtio/yurt-dashboard#contact"
              >
                <Trans>Feedback Portal</Trans>
              </a>
            ),
          },
          {
            key: 2,
            label: (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://openyurt.io/docs/installation/openyurt-experience-center/overview/#/"
              >
                <Trans>Help Documentation</Trans>
              </a>
            ),
          },
        ],
      }}
      placement="top"
      arrow
    >
      <Avatar
        icon={<QuestionOutlined />}
        style={{
          color: '#000',
          backgroundColor: '#fff',
          boxShadow: '0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d',
        }}
      />
    </Dropdown>
  </div>
);

const ContentWithSider = ({ children }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useUserProfile();
  useEffect(() => {
    // if there is no userProfile (not logged in)
    if (userProfile === null) {
      // navigate('/login');
    }
  }, [userProfile, navigate]);

  const userManager = (
    <Card style={{ padding: '5% 3%' }}>
      {userProfile && !!userProfile.status.effectiveTime && (
        <div style={{ textAlign: 'center' }}>
          <Trans>
            Your account expires in {getUserLastTime(userProfile.status.effectiveTime)} days
          </Trans>
        </div>
      )}
      <Divider style={{ margin: '8px 0' }} />
      <Button
        type="text"
        size="small"
        style={{
          color: 'red',
          width: '100%',
        }}
        onClick={() => {
          setUserProfile(null);
          navigate('/login');
        }}
      >
        <LogoutOutlined />
        <Trans>Exit</Trans>
      </Button>
    </Card>
  );

  return (
    <Layout>
      <Header className="header">
        <img src={logo} alt="logo" className="logo"></img>
        <div style={{ float: 'right', display: 'flex', alignItems: 'center' }}>
          <LanguageSwitcher />
          <Dropdown
            menu={{ items: [{ key: 'user', label: userManager }] }}
            trigger={['click', 'hover']}
          >
            <Button
              type="text"
              style={{
                float: 'right',
                color: '#1890FF',
                marginTop: 13,
                marginRight: 5,
                minWidth: 170,
              }}
            >
              Hi, {userProfile && userProfile.spec.mobilephone} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <MySider />
        <Layout>
          <Content style={{ padding: '1% 2%', backgroundColor: '#F0F2F5' }}>
            <div
              style={{
                padding: '20px 30px',
                backgroundColor: 'white',
                height: '100%',
              }}
            >
              {children}
            </div>
          </Content>
          {helpEntrance}
          {contentFooter}
        </Layout>
      </Layout>
    </Layout>
  );
};

const ContentWithoutSider = ({ children }) => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        justifyContent: 'space-between',
      }}
    >
      {children}
      {contentFooter}
    </Layout>
  );
};

export { ContentWithoutSider, ContentWithSider };
