import React from 'react'
import { useRecoilValue } from 'recoil';
import { useNavigate } from "react-router-dom";
import MonacoEditor from 'react-monaco-editor';
import { Input, Form, Button, notification, message } from 'antd';

import { algorithmSave } from '../../actions/algorithm';
import { algState } from '../../models';
import './userWorker';
import styles from './index.module.scss';


const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 0 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

function AlgorithmEdit() {
  const code = "// your original code...";
  const navigate = useNavigate();
  const algDetail = useRecoilValue(algState);

  const onFinish = (values: any) => {
    const payload = { ...algDetail, ...values }
    algorithmSave(payload)
    message.success("保存策略成功")
    navigate("/algorithm");
  };

  const onMonacoChange = (v) => {
    return v;
  }

  return (
    <div className="container">
      <Form
        {...formItemLayout}
        initialValues={algDetail}
        onFinish={onFinish}
      >
        <div className={styles.toolbar}>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input
            placeholder="Algorithm Name"
          />

        </Form.Item>


        <Form.Item
          name="description"
          rules={[{ required: true, message: 'Please input your description!' }]}
        >
          <Input
            placeholder="Algorithm description"
          />

        </Form.Item>


        <Form.Item
          name="script"
          rules={[{ required: true, message: 'Please input your description!' }]}
          getValueFromEvent={onMonacoChange}
          style={{ border: "1px solid #ddd" }}
          initialValue={code}
        >
          <MonacoEditor
            height={1000}
            language="javascript"
            theme={"vs-light"}
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: "line",
              automaticLayout: false,
            }}
          />
        </Form.Item>

      </Form>
    </div>
  )
}

export default AlgorithmEdit
