import React, { useState, useEffect } from "react";
import { Select, Row, Col, Tooltip, Input, Button, notification, Table, Modal, Form } from 'antd';
import { algorithmList } from '../../actions/algorithm';
import { exchangeList } from '../../actions/exchange';
import { list as apiList } from '../../actions/apiConfig';
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
	const onHandleEdit = () => { };
	const onHandleTraderEdit = (record) => {
		console.log(record)
		setVisible(true);
		setTrader(record)
	};
	const handleOk = () => {

	}

	const handleCancel = () => {

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

	console.log(apis)
	const [form] = Form.useForm();
	return (
		<div>
			<div className={styles.toolbar}>
				<Button type="primary" onClick={reload}>Reload</Button>
				<Button type="ghost" onClick={handleEdit}>Add</Button>
				<Button disabled={selectedRowKeys.length <= 0} onClick={handleDelete}>Delete</Button>
			</div>
			<Table rowKey="id"
				columns={columns}
				// expandedRowRender={expandedRowRender}
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
				// onCancel={onCancel}
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
					<Form.Item name="API" label="API">
						<Select
							placeholder="请选择行情数据来源"
							// onChange={this.onGenderChange}
							allowClear
						>
							{
								apis.map(item => <Option value={item.id}>{item.exchangeType}-{item.funcName}-{item.instId}-{periods[item.period]}</Option>)
							}
						</Select>
					</Form.Item>
					<Form.Item name="exchanges" label="Exchanges">
						<Select
							placeholder="请选择交易所"
							// onChange={this.onGenderChange}
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