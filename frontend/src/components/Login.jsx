import arch from "../assets/architecture.png";
import { Form, Input, Button, Checkbox, Card } from "antd";
import { Link } from "react-router-dom";
import {
  MailOutlined,
  BankOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const RegisterForm = ({ gotoLogin }) => {
  return (
    <Card className="form-card">
      <Form
        name="normal_login"
        initialValues={{
          remember: true,
        }}
        onFinish={(vals) => console.log(vals)}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="phone"
          rules={[
            {
              required: true,
              message: "Please input your phone number!",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="site-form-item-icon" />}
            placeholder="Phone Number"
          />
        </Form.Item>
        <Form.Item
          name="organization"
          rules={[
            {
              required: true,
              message: "Please input your Organization!",
            },
          ]}
        >
          <Input
            prefix={<BankOutlined className="site-form-item-icon" />}
            placeholder="Organization"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            onClick={gotoLogin}
          >
            Register
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const LoginForm = ({ gotoRegister }) => {
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  return (
    <Card className="form-card">
      <Form
        name="normal_login"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
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
            className="login-form-register"
          >
            Register Now
          </Button>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            <Link to="/clusterinfo">Log in</Link>
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

// hello
const LoginPage = () => {
  const [pageStatus, setStatus] = useState("login");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        flexWrap: "wrap",
      }}
    >
      <div className="login-intro">
        <img src={arch} alt="openyurt-arch"></img>
        <div className="login-intro-word">
          Extending Kubernetes to Edge
          <a
            style={{ display: "block", fontSize: 21 }}
            href="https://openyurt.io/zh-cn/"
          >
            Learn More About OpenYurt &gt;
          </a>
        </div>
      </div>

      {pageStatus === "login" ? (
        <LoginForm gotoRegister={() => setStatus("register")} />
      ) : (
        <RegisterForm gotoLogin={() => setStatus("login")} />
      )}
    </div>
  );
};

export default LoginPage;
