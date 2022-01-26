import { Form, Input, Button, Checkbox, Card } from "antd";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import { sendRequest } from "../../utils/request";
import { useState } from "react";
import { useUserProfile } from "../../utils/hooks";

const LoginForm = ({ gotoRegister, initState, history }) => {
  const [tips, setTips] = useState("");

  // check if user state has already been saved
  let [user, setUserProfile] = useUserProfile();
  if (user) {
    history.push("/clusterInfo");
  }

  // login button callback
  const onFinish = (values) => {
    sendRequest("/login", values).then(
      (res) => {
        setUserProfile(res);
        history.push({
          pathname: "/clusterInfo",
          state: {
            msg: "恭喜您登录成功，已经为您分配了一个OpenYurt集群！请开始体验吧😀。",
            type: "info",
            duration: 3,
          },
        });
      },
      (err) => {
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
          mobilephone:
            initState && initState.spec && initState.spec.mobilephone,
          token: initState && initState.spec && initState.spec.token,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="mobilephone"
          rules={[
            {
              required: true,
              message: "Please input your phone number!",
            },
            {
              type: "string",
              // pattern: /^1[3456789]\d{9}$/,
              message: "This is not a valid phone number!",
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
              message: "Please input your Password!",
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

          <Button
            type="text"
            onClick={() => gotoRegister()}
            className="form-transfer"
          >
            Register Now
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={() => {
              window.location.href =
                "https://github.com/login/oauth/authorize?client_id=4e5058f5e68e11b91193&scope=user";
            }}
            className="login-form-button"
          >
            Log in by github
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
      </Form>

      <div
        style={{
          color: "red",
        }}
      >
        {tips}
      </div>
    </Card>
  );
};

export default withRouter(LoginForm);
