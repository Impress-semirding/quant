import Icon from '@ant-design/icons';
import { Button, Form, Input, Tooltip } from 'antd';

import styles from './index.module.scss'

export default function Login() {
  const cluster = localStorage.getItem('cluster') || document.URL.slice(0, -6);
  const onFinish = () => {

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
            <Form.Item
              name="cluster"
              rules={[{ type: 'url', required: true }]}
              initialValue={cluster}
            >
              <Tooltip placement="right" title="Cluster URL">
                  <Input addonBefore={<Icon type="link" />} placeholder="http://127.0.0.1:9876" />
              </Tooltip>

            </Form.Item>
            <Form.Item
              name="username"
              rules={[{ required: true }]}
            >
              <Tooltip placement="right" title="Username">
                  <Input addonBefore={<Icon type="user" />} placeholder="username" />
              </Tooltip>

            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true }]}
            >
              <Tooltip placement="right" title="Password">
                  <Input addonBefore={<Icon type="lock" />} type="password" placeholder="password" />
              </Tooltip>
            </Form.Item>

            <Form.Item wrapperCol={{ span: 6, offset: 9 }} style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" className="login-form-button">Login</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
  )
}