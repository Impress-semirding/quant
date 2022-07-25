import React, { useEffect } from 'react';
import { Button, Space, Checkbox, Form, Input, Table, Tag, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

import { Values } from './type';
import TaskCreateForm from './task';
import { list, put, run, stop } from '../../actions/apiConfig';
import { IConfigTaskItem } from '../../actions/apiConfig';
import { sleep } from '../../utils';
import styles from './index.module.scss';


interface DataType {
  key: string;
  name: string;
  title: string;
  address: string;
  render: () => Element;
}

interface Iperiod {
  7: string,
  10: string,
  14: string,
}

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    key: 'id',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: '交易所',
    dataIndex: 'exchangeType',
    key: 'exchangeType',
  },
  {
    title: '任务类型',
    dataIndex: 'funcName',
    key: 'funcName',
  },
  {
    title: '交易品种',
    dataIndex: 'instId',
    key: 'instId',
  },
  {
    title: '执行时间',
    dataIndex: 'period',
    key: 'period',
    render: (period: 7 | 10 | 14) => {
      const m: Iperiod = {
        7: "1H",
        10: "4H",
        14: "1D"
      }
      return m[period]
    }
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    render: (text: string) => {
      if (text === "N") {
        return "未启动"
      } else {
        return "执行中"
      }
    }
  }
];

const { useState } = React;

export default function Quote() {
  const [data, setSata] = useState<IConfigTaskItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadList()
  }, [])

  const loadList = async () => {
    const { list: data } = await list();
    setSata(data);
  }

  const onAddTask = () => {
    setIsModalVisible(true);
  }

  const handleOk = async (values: Values) => {
    setIsModalVisible(false);
    await put(values)
    await loadList();
    message.success("添加交易所任务成功")
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const runTask = async (id: number) => {
    await run(id)
    message.success("执行策略成功")
    await sleep(1000);
    await loadList();
  }

  const stopTask = async (id: number) => {
    await stop(id)
    message.success("停止策略成功")
    await sleep(1000);
    await loadList();
  }

  const toolPaner = {
    title: 'Action',
    key: 'action',
    render: (text: string, record: IConfigTaskItem) => (
      <Space size="middle">
        <Button disabled={record.status === "Y"} onClick={() => runTask(record.id)}>启动</Button>
        <Button disabled={record.status === "Y"}>删除</Button>
        <Button disabled={record.status === "N"} onClick={() => stopTask(record.id)}>停止</Button>
      </Space >
    ),
  }


  return (
    <div>
      <div className={styles.tool}>
        <Button type="primary" onClick={onAddTask}>添加任务</Button>
      </div>
      <TaskCreateForm visible={isModalVisible} onCreate={handleOk} onCancel={handleCancel} />
      <Table columns={[...columns, toolPaner]} dataSource={data} />
    </div>
  )
}
