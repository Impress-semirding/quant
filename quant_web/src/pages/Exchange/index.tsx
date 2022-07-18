import { useRecoilValue } from 'recoil';
import React, { useEffect, useRef, useState, } from 'react';
import { Button, Table, Modal, Form, Input, Select, notification } from 'antd';
// import { ExchangeList, ExchangePut, ExchangeDelete } from '../actions/exchange';
import { ExchangePut, ExchangeDelete } from '../../actions/exchange';
import exchangeTypesQuery, { exchangeListQuery } from '../../models/exchange'
import styles from './index.module.scss';


const FormItem = Form.Item;
const Option = Select.Option;

export default function Exchange() {
  const [requestId, setRequestId] = useState(0);
  const [selectedRowKeys, setSelectRowKeys] = useState([]);
  const [info, setInfo] = useState({});
  const [infoModalShow, setInfoModalShow] = useState(false);

  const [form] = Form.useForm();
  const exchangeType = useRecoilValue(exchangeTypesQuery);

  useEffect(() => {
    return () => {
      notification.destroy();
    }
  }, [])

  const reload = () => {
    setRequestId(pre => pre + 1)
  }


  const handleDelete = () => {
    Modal.confirm({
      title: 'Are you sure to delete ?',
      onOk: async () => {

        if (selectedRowKeys.length > 0) {
          await ExchangeDelete(selectedRowKeys);
          setSelectRowKeys([]);
          reload();
        }
      }
    });
  }

  const handleInfoShow = (info) => {
    if (!info.id) {
      info = {
        id: 0,
        name: '',
        type: '',
        accessKey: '',
        secretKey: '',
      };
    }
    setInfo(info);
    setInfoModalShow(true)
  }

  const handleInfoSubmit = async () => {
    try {
      const values = await form.validateFields();
      const req = {
        id: info.id,
        name: values.name,
        type: values.type,
        accessKey: values.accessKey,
        secretKey: values.secretKey,
        passphrase: values.passphrase,
        test: values.test,
      };

      await ExchangePut(req);
      setInfoModalShow(false);
      form.resetFields();
      reload();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  }

  const handleInfoCancel = () => {
    setInfoModalShow(false);
    form.resetFields();
  }

  const onSelectChange = (selectedRowKeys) => {
    setSelectRowKeys(selectedRowKeys);
  }

  // const { exchange } = this.props;
  const columns = [{
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    render: (v, r) => <a onClick={handleInfoShow.bind(null, r)}>{String(v)}</a>,
  }, {
    title: 'Type',
    dataIndex: 'type',
    sorter: true,
  }, {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    sorter: true,
    render: (v) => v.toLocaleString(),
  }, {
    title: 'UpdatedAt',
    dataIndex: 'updatedAt',
    sorter: true,
    render: (v) => v.toLocaleString(),
  }];
  const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 12 },
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={reload}>Reload</Button>
        <Button type="ghost" onClick={handleInfoShow}>Add</Button>
        <Button disabled={selectedRowKeys.length <= 0} onClick={handleDelete}>Delete</Button>
      </div>

      <React.Suspense fallback={<div>加载中……</div>}>
        <MyTable requestId={requestId} onSelectChange={onSelectChange} handleInfoShow={handleInfoShow}></MyTable>


        <Modal closable
          maskClosable={false}
          width="50%"
          title={info.name ? `Exchange - ${info.name}` : 'New Exchange'}
          visible={infoModalShow}
          footer=""
          onCancel={handleInfoCancel}
        >
          <Form
            form={form}
            horizontal
          >
            <FormItem
              {...formItemLayout}
              label="Name"
              name="name"
              rules={[{ required: true }]}
              initialValue={info.name}
            >
              <Input />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Type"
              name="type"
              rules={[{ required: true }]}
              initialValue={info.type}
            >
              <Select disabled={info.id > 0}>
                {exchangeType.map((v, i) => <Option key={i} value={v}>{v}</Option>)}
              </Select>

            </FormItem>
            <FormItem
              {...formItemLayout}
              label="AccessKey"
              name="accessKey"
              rules={[{ required: true }]}
              initialValue={info.accessKey}
            >
              <Input />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="SecretKey"
              name="secretKey"
              rules={[{ required: true }]}
              initialValue={info.secretKey}
            >
              <Input />
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="passphrase"
              name="passphrase"
              rules={[{ required: true }]}
              initialValue={info.passphrase}
            >
              <Input />
            </FormItem>
            <Form.Item wrapperCol={{ span: 12, offset: 7 }} style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" onClick={handleInfoSubmit}>Submit</Button>
            </Form.Item>
          </Form>
        </Modal>
      </React.Suspense>
    </div >
  );
}

function MyTable({ selectedRowKeys, requestId, handleInfoShow, onSelectChange: onSelect }) {
  const exchangeList = useRecoilValue(exchangeListQuery({ size: 100, page: 1, requestId }));

  const [pagination, setPagination] = useState({
    pageSize: 12,
    current: 1,
    total: 0,
  });

  const columns = [{
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    render: (v, r) => <a onClick={handleInfoShow.bind(null, r)}>{String(v)}</a>,
  }, {
    title: 'Type',
    dataIndex: 'type',
    sorter: true,
  }, {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    sorter: true,
    render: (v) => v.toLocaleString(),
  }, {
    title: 'UpdatedAt',
    dataIndex: 'updatedAt',
    sorter: true,
    render: (v) => v.toLocaleString(),
  }];

  const onSelectChange = (keys) => {
    onSelect(keys)
    // setSelectRowKeys(selectedRowKeys);
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    let id = "";
    if (sorter.field) {
      id = `${sorter.field} ${sorter.order.replace('end', '')}`;
    } else {
      id = 'id';
    }
    setPagination({ ...newPagination, current: newPagination.current });
    // reload(id);
  }


  return (
    <Table rowKey="id"
      columns={columns}
      dataSource={exchangeList.list}
      rowSelection={rowSelection}
      pagination={pagination}
      // loading={exchange.loading}
      onChange={handleTableChange}
    />
  )
}

