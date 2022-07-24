import React, { SetStateAction, useEffect, useState, } from 'react';
import { useRecoilValueLoadable } from 'recoil';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { Button, Table, Modal, Form, Input, Select, notification } from 'antd';
import { ExchangePut, ExchangeDelete } from '../../actions/exchange';
import exchangeTypesQuery, { exchangeListQuery } from '../../models/exchange'
import { IExchange } from '../../types';
import styles from './index.module.scss';

const FormItem = Form.Item;
const Option = Select.Option;

export default function Exchange() {
  const [requestId, setRequestId] = useState(0);
  const [selectedRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [info, setInfo] = useState<IExchange>({
    id: 0,
    name: "",
    type: "",
    accessKey: "",
    secretKey: "",
    passphrase: "",
  });
  const [infoModalShow, setInfoModalShow] = useState(false);

  const [form] = Form.useForm();
  const exchangeType = useRecoilValueLoadable(exchangeTypesQuery);

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

  const handleInfoShow = (info: IExchange) => {
    let newInfo = info;
    if (!info.id) {
      newInfo = {
        id: 0,
        name: '',
        type: '',
        accessKey: '',
        secretKey: '',
        passphrase: '',
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

  const onSelectChange = (selectedRowKeys: React.Key[]) => {
    setSelectRowKeys(selectedRowKeys);
  }

  const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 12 },
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={reload}>Reload</Button>
        <Button type="ghost" onClick={e => handleInfoShow({
          id: 0,
          name: "",
          type: "",
          accessKey: "",
          secretKey: "",
          passphrase: "",
        })}>Add</Button>
        <Button disabled={selectedRowKeys.length <= 0} onClick={handleDelete}>Delete</Button>
      </div>
      <MyTable requestId={requestId} selectedRowKeys={selectedRowKeys} onSelectChange={onSelectChange} handleInfoShow={handleInfoShow}></MyTable>


      <Modal
        closable
        maskClosable={false}
        width="50%"
        title={info.name ? `Exchange - ${info.name}` : 'New Exchange'}
        visible={infoModalShow}
        footer=""
        onCancel={handleInfoCancel}
      >
        <Form
          form={form}
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
            <Select disabled={info.id && info.id > 0 ? true : false}>
              {
                exchangeType.state === "hasValue" ?
                  exchangeType.contents.map((v, i) => <Option key={i} value={v}>{v}</Option>)
                  : []
              }
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
    </div >
  );
}

interface IMyTableProps {
  requestId: number,
  selectedRowKeys: React.Key[],
  handleInfoShow: (record: IExchange) => void,
  onSelectChange: (r: React.Key[]) => void,
}

function MyTable({ selectedRowKeys, requestId, handleInfoShow, onSelectChange: onSelect }: IMyTableProps) {
  const exchangeList = useRecoilValueLoadable(exchangeListQuery({ size: 100, page: 1, requestId }));

  const [pagination, setPagination] = useState<{ pageSize: number; current: number; total: number; }>({
    pageSize: 12,
    current: 1,
    total: 0,
  });

  const columns: ColumnsType<IExchange> = [{
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

  const rowSelection: TableRowSelection<IExchange> = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelect(selectedRowKeys)
    },
  };

  const handleTableChange: TableProps<IExchange>['onChange'] = (newPagination) => {
    const pagination = { ...newPagination, current: newPagination.current };
    // @ts-ignore
    setPagination(pagination);
  }


  return (
    <Table rowKey="id"
      columns={columns}
      dataSource={exchangeList.state === "hasValue" ? exchangeList.contents.list : []}
      rowSelection={rowSelection}
      pagination={pagination}
      loading={exchangeList.state === "loading"}
      onChange={handleTableChange}
    />
  )
}

