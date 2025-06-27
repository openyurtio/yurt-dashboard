import { GithubOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../utils/hooks';
import { sendRequest } from '../../utils/request';

const LoginForm = ({ gotoRegister, initState }) => {
  const navigate = useNavigate();
  const [tips, setTips] = useState('');
  const [user, setUserProfile] = useUserProfile();

  useEffect(() => {
    if (user) {
      navigate('/clusterInfo');
    }
  }, [user, navigate]);

  // login button callback
  const onFinish = values => {
    sendRequest('/login', values).then(
      res => {
        setUserProfile(res);
        navigate('/clusterInfo', {
          state: {
            msg: <Trans>恭喜您登录成功，已经为您分配了一个OpenYurt集群！请开始体验吧😀。</Trans>,
            type: 'info',
            duration: 3,
          },
        });
      },
      err => {
        setTips(err.toString());
      }
    );
  };

  return (
    <Card className="form-card">
      <Form
        name="normal_login"
        initialValues={{
          remember: true,
          // used when redirect from register success page
          // auto fill the mobilephone and token field
          mobilephone: initState?.spec?.mobilephone,
          token: initState?.spec?.token,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="mobilephone"
          rules={[
            {
              required: true,
              message: 'Please input your phone number!',
            },
            {
              type: 'string',
              // pattern: /^1[3456789]\d{9}$/,
              message: 'This is not a valid phone number!',
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="site-form-item-icon" />}
            placeholder="Phone Number"
            aria-label="phonenumber-input"
          />
        </Form.Item>
        <Form.Item
          name="token"
          rules={[
            {
              required: true,
              message: 'Please input your Password!',
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            aria-label="password-input"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Button type="text" onClick={() => gotoRegister()} className="form-transfer">
            Register Now
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            data-testid="login"
            className="login-form-button"
          >
            Log in
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            href="https://github.com/login/oauth/authorize?client_id=4dd7d74594e273551935&scope=user"
            className="login-form-button"
            icon={<GithubOutlined style={{ fontSize: '150%' }} />}
            style={{ background: '#333333', borderColor: '#333333' }}
          >
            Log in with Github
          </Button>
        </Form.Item>
      </Form>

      <div
        style={{
          color: 'red',
        }}
      >
        {tips}
      </div>
    </Card>
  );
};

export default LoginForm;
