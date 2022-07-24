import { useMemo } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { Input, Form, Button, message } from 'antd';
import { useLocation, useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValueLoadable } from 'recoil';

import { AlgListQuery, AlgListQueryRequestIDState } from '../../models/alg';
import { algorithmSave } from '../../actions/algorithm';
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
  const location = useLocation();
  const setRid = useSetRecoilState(AlgListQueryRequestIDState(0));
  const data = useRecoilValueLoadable(AlgListQuery({ size: 100, page: 1, requestId: 0 }));
  const currentAlg = useMemo(() => {
    if (data.state === "hasValue") {
      return data.contents.list.find(item => `/algorithmEdit/${item.id}` === location.pathname)
    }
    return {}
  }, [data]);

  const onFinish = async (values: any) => {
    const payload = { ...currentAlg, ...values }
    setRid(id => id + 1);
    await algorithmSave(payload)
    message.success("保存策略成功")
    navigate("/algorithm");
  };

  const onMonacoChange = (v: any) => {
    return v;
  }

  return (
    <div className="container">
      <Form
        {...formItemLayout}
        initialValues={currentAlg}
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
