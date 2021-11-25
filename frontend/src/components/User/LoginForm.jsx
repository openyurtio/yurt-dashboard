import { Form, Input, Button, Checkbox, Card } from "antd";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import { sendRequest } from "../../utils/request";
import { useState } from "react";
import { getUserProfile, setUserProfile } from "../../utils/utils";

const LoginForm = ({ gotoRegister, initState, history }) => {
  const [tips, setTips] = useState("");

  // check if user state has already been saved
  let user = getUserProfile();
  if (user) {
    history.push("/clusterInfo");
  }

  // login button callback
  const onFinish = (values) => {
    sendRequest("/login", values).then(
      (res) => {
        setUserProfile(values.remember, res);
        history.push("/clusterInfo");
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
          mobilephone: initState && initState.spec.mobilephone,
          token: initState && initState.spec.token,
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
              pattern: /^1[3456789]\d{9}$/,
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
