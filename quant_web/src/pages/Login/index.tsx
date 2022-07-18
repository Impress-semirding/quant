import Icon from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Tooltip } from 'antd';

import { login, ILoginParams } from '../../actions/login';
import styles from './index.module.scss';

export default function Login() {
  let navigate = useNavigate();
  const cluster = localStorage.getItem('cluster') || document.URL.slice(0, -6);
  const onFinish = async (values: ILoginParams) => {
    const token = await login(values.username, values.password)
    localStorage.setItem('cluster', values.cluster);
    localStorage.setItem('token', token);
    navigate("/quote");
  }
  return (
    <div>
      <h1 style={{
        padding: 24,
        fontSize: '30px',
        textAlign: 'center',
      }}>QuantBot</h1>
      <div className={styles.formContainer}>
        <Form
          onFinish={onFinish}
        >
          <Tooltip placement="right" title="Cluster URL">
            <Form.Item
              name="cluster"
              rules={[{ type: 'url', required: true }]}
              initialValue={cluster}
            >
              <Input addonBefore={<Icon type="link" />} placeholder="http://127.0.0.1:9876" />
            </Form.Item>
          </Tooltip>

          <Tooltip placement="right" title="Username">
            <Form.Item
              name="username"
              rules={[{ required: true }]}
            >
              <Input addonBefore={<Icon type="user" />} placeholder="username" />
            </Form.Item>
          </Tooltip>

          <Tooltip placement="right" title="Password">
            <Form.Item
              name="password"
              rules={[{ required: true }]}
            >
              <Input addonBefore={<Icon type="lock" />} type="password" placeholder="password" />
            </Form.Item>
          </Tooltip>

          <Form.Item wrapperCol={{ span: 6, offset: 9 }} style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" className="login-form-button">Login</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
