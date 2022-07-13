import { useSetRecoilState } from 'recoil';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Dropdown, Select, Row, Col, Tooltip, Menu, Input, Button, notification, Table, Modal, Form } from 'antd';
import { algorithmList } from '../../actions/algorithm';
import { exchangeList } from '../../actions/exchange';
import { list as apiList } from '../../actions/apiConfig';
import { traderSave, traderList, traderDelete, traderSwitch } from '../../actions/trader';
import { algState, traderState } from '../../models';
import styles from './index.module.scss';


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
  const [data, setData] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [apis, setApis] = useState([]);
  const [isTraderVisible, setVisible] = useState(false);
  const [trader, setTrader] = useState(null);
  const [traderMap, setTraderMap] = useState({});
  const setAlg = useSetRecoilState(algState);
  const setTraderLog = useSetRecoilState(traderState);

  const navigate = useNavigate();
  const onHandleEdit = (r) => {
    console.log(r);
    setAlg(r);
    navigate(`/algorithmEdit/${r.id}`)
  };
  const onHandleTraderEdit = (record) => {
    console.log(record)
    setVisible(true);
    setTrader(record)
  };
  const handleOk = () => {

  }

  const handleCancel = () => {

  }

  const handleTraderDelete = (req) => {
    Modal.confirm({
      title: 'Are you sure to delete ?',
      onOk: () => {
        traderDelete(req.id)
      },
      iconType: 'exclamation-circle',
    });
  }

  const handleTraderSwitch = (req) => {
    traderSwitch(req);
  }

  const handleTraderLog = (info) => {
    setTraderLog(info);
    navigate(`/traderLog/${info.id}`);
  }

  const reload = () => { }
  const handleEdit = () => { }
  const handleDelete = () => { }
  const selectedRowKeys = []
  const columns = [{
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

  const expcolumns = [{
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
    ),
  }];

  useEffect(() => {
    loadList()
    loadExchanges();
    loadApi();
  }, [])

  const loadList = async () => {
    const { list: data } = await algorithmList(100, 1);
    setData(data);
  }

  const loadExchanges = async () => {
    const { list: data } = await exchangeList(100, 1);
    setExchanges(data)
  }


  const loadApi = async () => {
    const { list: data } = await apiList();
    setApis(data);
  }

  const [form] = Form.useForm();


  const expandedRowRender = (r) => {
    const data = traderMap[r.id];

    if (data && data.length > 0) {
      return (
        <Table className="womende" rowKey="id"
          size="middle"
          pagination={false}
          columns={expcolumns}
          // loading={trader.loading}
          dataSource={data}
        />
      );
    }

    if (!trader?.loading) {
      return (
        <p>
          No Trader under this algorithm
        </p>
      );
    }
  };

  const onExpandedRowsChange = async (ids) => {
    let newMap = {};
    for (let i = 0; i < ids.length; i++) {
      if (!traderMap[ids[i]]) {
        const data = await traderList(ids[i]);
        console.log(data);
        newMap[ids[i]] = data;
      }

    }

    setTraderMap(pre => ({
      ...pre,
      ...newMap,
    }))
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={reload}>Reload</Button>
        <Button type="ghost" onClick={handleEdit}>Add</Button>
        <Button disabled={selectedRowKeys.length <= 0} onClick={handleDelete}>Delete</Button>
      </div>
      <Table rowKey="id"
        columns={columns}
        expandedRowRender={expandedRowRender}
        onExpandedRowsChange={onExpandedRowsChange}
        dataSource={data}
        // rowSelection={rowSelection}
        // pagination={pagination}
        loading={false}
      // onChange={handleTableChange}
      // onExpand={handleTableExpand}
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
            .then(values => {
              form.resetFields();
              const exs = exchanges?.filter((ex) => values?.exchanges?.includes(ex.id))
              const fapi = apis.filter(item => values.api.includes(item.id))
              traderSave({ ...values, api: fapi, algorithmId: trader.id, exchanges: exs })
              setVisible(false)
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
          <Form.Item name="api" label="API">
            <Select
              mode="multiple"
              placeholder="请选择行情数据来源"
              allowClear
              rules={[{ required: true, message: '请选择api' }]}
            >
              {
                apis.map(item => <Option disabled={item.status !== 'Y'} value={item.id}>{item.exchangeType}-{item.funcName}-{item.instId}-{periods[item.period]}</Option>)
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
                exchanges.map(item => <Option value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Algorithm;