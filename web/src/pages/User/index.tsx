import { useState } from "react";
import { Button, Form, Modal, Input, InputNumber, Tooltip, Table } from 'antd';

interface IIprops {
  user: any,
  form: any
}

const FormItem = Form.Item;

export default function UserList() {
  const user = {
    list: [],
    loading: false,
    data: {
      id: 0,
      username: "",
      level: 1
    }
  };
  const [state, setState] = useState({
    selectedRowKeys: [],
    pagination: {
      defaultCurrent: 1,
      total: 10,
    },
    info: {
      id: 0,
      username: "",
      level: 1
    },
    infoModalShow: false,
  });
  const { selectedRowKeys, pagination, info, infoModalShow } = state;

  const onSelectChange = () => {

  }

  const columns = [{
    title: 'Username',
    dataIndex: 'username',
    sorter: true,
    render: (v: string) => <a onClick={onHandleInfoShow}>{String(v)}</a>,
  }, {
    title: 'Level',
    dataIndex: 'level',
    sorter: true,
  }, {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    sorter: true,
    render: (v: number) => v.toLocaleString(),
  }, {
    title: 'UpdatedAt',
    dataIndex: 'updatedAt',
    sorter: true,
    render: (v: number) => v.toLocaleString(),
  }];

  const checkPassword = (getFieldValue: (string: string) => string, rule: any, value: string, callback: (str?: string) => void) => {
    if (value && value !== getFieldValue('password')) {
      callback('Confirm fail');
    } else {
      callback();
    }
  };


  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onHandleInfoSubmit = () => {

  }

  const onHandleDelete = () => {

  }

  const onHandleInfoShow = () => {

  }

  const onHandleTableChange = () => {

  }

  const onHandleInfoCancel = () => {

  }

  const onReload = () => {

  }

  return (
    <div>
      <div className="table-operations">
        <Button type="primary" onClick={onReload}>Reload</Button>
        <Button type="ghost" onClick={onHandleInfoShow}>Add</Button>
        <Button disabled={selectedRowKeys.length <= 0} onClick={onHandleDelete}>Delete</Button>
      </div>
      <Table rowKey="id"
        columns={columns}
        dataSource={user.list}
        rowSelection={rowSelection}
        pagination={pagination}
        loading={user.loading}
        onChange={onHandleTableChange}
      />
      <Modal closable
        maskClosable={false}
        width="50%"
        title={info.username ? `User - ${info.username}` : 'New User'}
        visible={infoModalShow}
        footer=""
        onCancel={onHandleInfoCancel}
      >
        <Form>
          <FormItem
            label="Username"
            name="username"
            rules={[{ required: true }]}
          >
            <Input disabled={info.id > 0} />
          </FormItem>
          <FormItem
            label="Level"
            name="level"
            rules={[{ required: true }]}
          >
            <InputNumber disabled={user.data && info.username === user.data.username} min={0} max={user.data ? user.data.level : 0} />
          </FormItem>
          <FormItem
            label="Password"
            name="password"
            rules={[info.id ? { required: false, whitespace: true } : { required: true, whitespace: true }]}
          >
            <Input type="password" />
          </FormItem>
          <FormItem
          >
            {({ getFieldValue }) => {
              const repasswdRules = info.id && !getFieldValue('password') ?
                [
                  { required: false, whitespace: true },
                  { validator: checkPassword.bind(null, getFieldValue) },
                ]
                :
                [
                  { required: true, whitespace: true },
                  { validator: checkPassword.bind(null, getFieldValue) },
                ];

              return (
                <Form.Item
                  label="Repeat"
                  name="rePassword"
                  rules={repasswdRules}
                >
                  <Input type="Password" />
                </Form.Item>
              )
            }
            }

          </FormItem>
          <Form.Item wrapperCol={{ span: 12, offset: 7 }} style={{ marginTop: 24 }}>
            <Button type="primary" onClick={onHandleInfoSubmit} loading={user.loading}>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}