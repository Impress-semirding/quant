import React from 'react';
import { Button, Space, Checkbox, Form, Input, Table, Tag, Modal } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

import TaskCreateForm from './task';
import { put } from '../../actions/apiConfig';
import styles from './index.module.scss';


interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: 'id',
    dataIndex: 'id',
    key: 'id',
    render: text => <a>{text}</a>,
  },
  {
    title: '交易所',
    dataIndex: 'exchange',
    key: 'exchange',
  },
  {
    title: '任务类型',
    dataIndex: 'taskType',
    key: 'taskType',
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'tags',
    // render: (_, { tags }) => (
    //   <>
    //     {tags.map(tag => {
    //       let color = tag.length > 5 ? 'geekblue' : 'green';
    //       if (tag === 'loser') {
    //         color = 'volcano';
    //       }
    //       return (
    //         <Tag color={color} key={tag}>
    //           {tag.toUpperCase()}
    //         </Tag>
    //       );
    //     })}
    //   </>
    // ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>启动 {record.name}</a>
        <a>删除</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

const { useState } = React;

export default function Quote() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const onAddTask = () => {
    setIsModalVisible(true);
  }

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    console.log(values)
    setIsModalVisible(false);
    await put(values)
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  return (
    <div>
      <div className={styles.tool}>
        <Button type="primary" onClick={onAddTask}>添加任务</Button>
      </div>
      <TaskCreateForm visible={isModalVisible} onCreate={handleOk} onCancel={handleCancel} />
      <Table columns={columns} dataSource={data} />
    </div>
  )
}
