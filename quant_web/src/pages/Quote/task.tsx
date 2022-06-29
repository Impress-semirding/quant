import { Button, Form, Input, Select, Modal, Radio } from 'antd';
import React, { useState } from 'react';
// import { uuid as uuidv4 } from 'uuid';

interface Values {
  funcName: string,
  exchangeType: string,
  period: string,
}

interface CreateFormProps {
  visible: boolean;
  onCreate: (values: Values) => Promise<any>;
  onCancel: () => void;
}

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const TaskCreateForm: React.FC<CreateFormProps> = ({
  visible,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title="创建交易所任务"
      okText="创建"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onCreate(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        {...formItemLayout}
        form={form}
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item
          name="exchangeType"
          label="交易所"
          rules={[{ required: true, message: '请选择交易所' }]}
        >
          <Select placeholder="请选择交易所">
            <Option value="okex">Okex</Option>
            <Option value="binance">Binance</Option>
            {/* <Option value="other">Bybit</Option> */}
          </Select>
        </Form.Item>
        <Form.Item
          name="funcName"
          label="任务类型"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <Select placeholder="请选择任务类型">
            <Option value="GetKlineRecords">GetKlineRecords</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="period"
          label="任务类型"
          rules={[{ required: true, message: '请选择任务类型' }]}
        >
          <Select placeholder="请选择任务period">
            <Option value="7">1h-kline</Option>
            <Option value="10">4h-kline</Option>
            <Option value="14">1d-kline</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskCreateForm;