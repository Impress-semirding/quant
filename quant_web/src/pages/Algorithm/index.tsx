import React, { useState, useEffect } from "react";
import { Row, Col, Tooltip, Input, Button, notification, Table } from 'antd';
import { algorithmList } from '../../actions/algorithm';
import styles from './index.module.scss';

function Algorithm() {
	const [data, setData] = useState([]);
	const onHandleEdit = () => { };
	const onHandleTraderEdit = (record) => {
		console.log(record)
	};
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
	}, [])

	const loadList = async () => {
		const { list: data } = await algorithmList(100, 1);
		setData(data);
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
				// expandedRowRender={expandedRowRender}
				dataSource={data}
				// rowSelection={rowSelection}
				// pagination={pagination}
				loading={false}
			// onChange={handleTableChange}
			// onExpand={handleTableExpand}
			/>
		</div>
	)
}

export default Algorithm;