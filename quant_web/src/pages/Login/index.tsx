import Icon from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValueLoadable } from 'recoil';
import { Button, Form, Input, Tooltip, Skeleton, Result } from 'antd';

import { login } from '../../actions/user';
import type { ILoginParams } from '../../types';
import userDetailQuery, { userInfoQueryRequestIDState } from '../../models/user';
import styles from './index.module.scss';

const cluster = localStorage.getItem('cluster') || document.URL.slice(0, -6);

export default function Login() {
  const navigate = useNavigate();
  const [rid, setRid] = useRecoilState(userInfoQueryRequestIDState(0));
  const userInfo = useRecoilValueLoadable(userDetailQuery(rid));

  const onFinish = async (values: ILoginParams) => {
    const token = await login(values.username, values.password)
    localStorage.setItem('cluster', values.cluster);
    localStorage.setItem('token', token);
    setRid(id => id + 1);
    navigate("/quote");
  }

  if (userInfo.state === "loading") {
    return <Skeleton />
  }

  if (userInfo.contents.id) {
    return (
      <Result
        status="success"
        title={`${userInfo.contents.username}您好`}
      />
    )
  }

  return (
    <div>
      <h1 style={{
        padding: 24,
        fontSize: '30px',
        textAlign: 'center',
      }}>Quant</h1>
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
