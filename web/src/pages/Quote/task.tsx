import React from 'react';
import { Form, Select, Modal } from 'antd';
import { Values } from './type';


interface CreateFormProps {
  visible: boolean;
  onCreate: (values: Values) => Promise<void>;
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
          label="API"
          rules={[{ required: true, message: '请选择调用API' }]}
        >
          <Select placeholder="请选择调用API">
            <Option value="GetKlineRecords">GetKlineRecords</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="instId"
          label="交易商品"
          rules={[{ required: true, message: '请选择交易商品' }]}
        >
          <Select placeholder="请选择交易商品">
            <Option value="BTC-USDT">BTC-USDT</Option>
            <Option value="BTC-USDT-SWAP">BTC-USDT-SWAP</Option>
            <Option value="BTC-USDT-SPOT">BTC-USDT-SPOT</Option>
            <Option value="BTC-USDT-FUTURES">BTC-USDT-FUTURES</Option>
            <Option value="ETH-USDT">ETH-USDT</Option>
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
