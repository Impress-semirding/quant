import { usePreviousDistinct } from 'react-use';
import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { useRecoilState, useSetRecoilState, useRecoilValueLoadable } from 'recoil';
import { Badge, Dropdown, Select, Menu, Input, Button, Table, Modal, Form, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';

import apiListQuery from '../../models/api';
import { traderState } from '../../models';
import { useTrader } from '../../models/trader';
import type { IArgorith, ITrader } from '../../types';
import { exchangeListQuery } from '../../models/exchange';
import { AlgListQuery, AlgListQueryRequestIDState } from '../../models/alg';
import { traderSave, traderList, traderDelete, traderSwitch } from '../../actions/trader';
import { runBackTesing } from '../../actions/algorithm';
import styles from './index.module.scss';


const Option = Select.Option;
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

const periods = {
  7: '1H',
  10: '4H',
  14: "1D"
}

function Algorithm() {
  const traderIn = useTrader();
  const traders = usePreviousDistinct(traderIn.traders, (pre, next) => next.state !== "hasValue")
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isTraderVisible, setVisible] = useState(false);
  const [trader, setTrader] = useState<ITrader>({
    id: -1,
    userId: "",
    algorithmId: "",
    name: "",
    status: 0,
    createdAt: "",
    updatedAt: "",
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const apis = useRecoilValueLoadable(apiListQuery);
  const setTraderLog = useSetRecoilState(traderState);
  const [rid, setRid] = useRecoilState(AlgListQueryRequestIDState(0));
  const data = useRecoilValueLoadable(AlgListQuery({ size: 100, page: 1, requestId: rid }));
  const exchanges = useRecoilValueLoadable(exchangeListQuery({ size: 100, page: 1, requestId: 0 }));

  const onHandleEdit = (r: IArgorith) => {
    navigate(`/algorithmEdit/${r.id}`)
  };

  const onHandleTraderEdit = (record: any) => {
    setVisible(true);
    setTrader(record)
  };

  const onHandleBackTesting = async (record: any) => {
    const data = await runBackTesing(record.algorithmId)
    console.log(data)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const loadTrader = (id: React.Key) => {
    traderIn.setIdList(pre => {
      // { id: React.Key, requestId: number }
      const ids = pre.map(item => {
        if (item.id === id) {
          return { ...item, requestId: item.requestId + 1 };
        }
        return item;
      })
      return ids;
    })
  }

  const handleTraderDelete = (req: ITrader) => {
    Modal.confirm({
      title: 'Are you sure to delete ?',
      onOk: async () => {
        await traderDelete(req.id)
        loadTrader(req.algorithmId)
      },
    });
  }

  const handleTraderSwitch = async (req: ITrader) => {
    const res = await traderSwitch(req);
    loadTrader(req.algorithmId)
  }

  const handleTraderLog = (info: ITrader) => {
    setTraderLog(info);
    navigate(`/traderLog/${info.id}`);
  }

  const reload = () => {
    setRid(id => id + 1);
  }

  const addHandleEdit = () => navigate("/algorithmEdit/add");

  const handleDelete = () => { }
  const columns: ColumnsType<IArgorith> = [{
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
    render: (v, r) => <a onClick={onHandleEdit.bind(null, r)}>{v}</a>,
  }, {
    title: 'Description',
    dataIndex: 'description',
    render: (v) => v.substr(0, 36),
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
  }, {
    title: 'Action',
    key: 'action',
    render: (v, r) => (
      <Button onClick={onHandleTraderEdit.bind(null, r)} type="ghost">Deploy</Button>
    ),
  }];

  const expcolumns: ColumnsType<ITrader> = [{
    title: 'Name',
    dataIndex: 'name',
    // render: (v, r) => <a onClick={this.handleTraderEdit.bind(this, r, null)}>{v}</a>,
  }, {
    title: 'Status',
    dataIndex: 'status',
    render: (v) => (v > 0 ? <Badge status="processing" text="RUN" /> : <Badge status="default" text="HALT" />),
  }, {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    render: (v) => v.toLocaleDateString(),
  }, {
    title: 'UpdatedAt',
    dataIndex: 'updatedAt',
    render: (v) => v.toLocaleDateString(),
  }, {
    title: 'Action',
    key: 'action',
    render: (v, r) => (
      <React.Fragment>
        <Dropdown.Button type="ghost" onClick={handleTraderSwitch.bind(null, r)} overlay={
          <Menu>
            <Menu.Item key="log">
              <a type="ghost" onClick={handleTraderLog.bind(null, r)}>View Log</a>
            </Menu.Item>
            <Menu.Item key="delete">
              <a type="ghost" onClick={handleTraderDelete.bind(null, r)}>Delete It</a>
            </Menu.Item>
          </Menu>
        }>{r.status > 0 ? 'Stop' : 'Run'}</Dropdown.Button>


        <Popconfirm title="回测任务数据默认只提供binance数据" okText="确定" cancelText="取消" onConfirm={onHandleBackTesting.bind(null, r)}>
          <Dropdown.Button type="ghost" overlay={
            <Menu>
              <Menu.Item key="backTesting">
                <a type="ghost">backTesting</a>
              </Menu.Item>
            </Menu>
          }>backTesting</Dropdown.Button>
        </Popconfirm>
      </React.Fragment>
    ),
  }];


  const rowSelection: TableRowSelection<IArgorith> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const expandedRowRender = (r: ITrader, index: number) => {
    if (!traders) {
      return null;
    }
    const data = traders.contents[r.id];

    return (
      <Table
        className="womende"
        rowKey="id"
        size="middle"
        pagination={false}
        columns={expcolumns}
        dataSource={data}
      />
    );

  };

  const onExpandedRowsChange = async (ids: React.Key[]) => {
    traderIn.setIdList(() => ids.map(id => ({ id, requestId: 1 })));
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={reload}>Reload</Button>
        <Button type="ghost" onClick={addHandleEdit}>Add</Button>
        <Button disabled={selectedRowKeys.length <= 0} onClick={handleDelete}>Delete</Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        rowSelection={rowSelection}
        //  @ts-ignore
        expandedRowRender={expandedRowRender}
        onExpandedRowsChange={onExpandedRowsChange}
        dataSource={data.state === "hasValue" ? data.contents.list : []}
        loading={data.state === "loading"}
      />
      <Modal
        visible={isTraderVisible}
        title="Create a new collection"
        okText="Create"
        cancelText="Cancel"
        onCancel={() => setVisible(false)}
        onOk={() => {
          form
            .validateFields()
            .then(async (values) => {
              form.resetFields();
              if (exchanges.state !== "hasValue") {
                return;
              }
              const exs = exchanges.contents.list.filter((ex) => values?.exchanges?.includes(ex.id))
              if (apis.state !== "hasValue") {
                return;
              }
              const fapi = apis.contents.list.filter(item => values.api.includes(item.id))
              await traderSave({ ...values, api: fapi, algorithmId: trader.id, exchanges: exs })
              setVisible(false)
              loadTrader(trader.id)
            })
            .catch(info => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form
          form={form}
          name="form_in_modal"
          initialValues={{ modifier: 'public' }}
          {...formItemLayout}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            name="api"
            label="API"
            rules={[{ required: true, message: '请选择api' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择行情数据来源"
              allowClear
            >
              {
                apis.state === "hasValue" ?
                  apis.contents.list.map(item => <Option key={item.id} disabled={item.status !== 'Y'} value={item.id}>{item.exchangeType}-{item.funcName}-{item.instId}-{periods[item.period]}</Option>)
                  : []
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="exchanges"
            label="Exchanges"
          >
            <Select
              mode="multiple"
              placeholder="请选择交易所"
              allowClear
            >
              {
                exchanges.state === "hasValue" ?
                  exchanges.contents.list.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)
                  : []
              }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Algorithm;