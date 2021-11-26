import { Form, Input, Button, Card } from "antd";
import {
  MailOutlined,
  BankOutlined,
  PhoneOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

const RegisterForm = ({ register, goToLogin }) => {
  const onSubmit = (formData) => {
    register(formData);
  };

  return (
    <Card className="form-card">
      <Form
        name="normal_login"
        initialValues={{
          remember: true,
        }}
        onFinish={onSubmit}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
            {
              type: "email",
              message: "This is not a valid mail address!",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
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
            data-testid="register"
          >
            Register
          </Button>
        </Form.Item>

        <Button
          type="text"
          className="form-transfer"
          icon={<RollbackOutlined />}
          onClick={goToLogin}
        >
          Back to Log in
        </Button>
      </Form>
    </Card>
  );
};

export default RegisterForm;
