import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button, Table, Tag, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { logList } from '../../actions/log';
import styles from './index.module.scss';

import type { ValueKeyOf, ILog } from '../../types';

const colors = {
  'INFO': '#A9A9A9',
  'ERROR': '#F50F50',
  'PROFIT': '#4682B4',
  'CANCEL': '#5F9EA0',
};

function Log() {
  let { id: traderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState({})
  const [data, setData] = useState<{ list: ILog[], total: number }>({
    total: 0,
    list: []
  });

  const [pagination, setPagination] = useState({
    pageSize: 12,
    current: 1,
    total: 0,
  })

  useEffect(() => {
    setFilter({})
    reload(pagination);
    return () => {
      notification.destroy();
    }
  }, []);

  const reload = async (pags = pagination) => {
    if (!traderId) {
      console.log("traderId is empty")
      return;
    }
    const { total, list } = await logList(traderId, pags, filter);
    setData({ total, list });
    setPagination(pag => ({ ...pag, total }));
  }

  const handleTableChange = (newPagination: { current: any; }, filters: any) => {
    const pag = {
      ...pagination,
      current: newPagination.current,
    }
    setFilter(filter)
    //  @ts-ignore
    setPagination(pag);
    reload(pag);
  }

  const handleCancel = () => {
    navigate('/algorithm');
  }

  const columns: ColumnsType<ILog> = [{
    width: 160,
    title: 'Time',
    dataIndex: 'time',
    render: (v) => v.toLocaleString(),
  }, {
    width: 100,
    title: 'Exchange',
    dataIndex: 'exchangeType',
    render: (v) => <Tag color={v === 'global' ? '' : '#00BFFF'}>{v}</Tag>,
  }, {
    width: 100,
    title: 'Type',
    dataIndex: 'type',
    render: (v: ValueKeyOf<ILog, "type">) => <Tag color={colors[v] || '#00BFFF'}>{v}</Tag>,
  }, {
    title: 'Price',
    dataIndex: 'price',
    width: 100,
  }, {
    width: 100,
    title: 'Amount',
    dataIndex: 'amount',
  }, {
    title: 'Message',
    dataIndex: 'message',
  }];


  return (
    <div>
      <div className={styles.toolbar}>
        <Button type="primary" onClick={reload}>Reload</Button>
        <Button type="ghost" onClick={handleCancel}>Back</Button>
      </div>
      <Table rowKey="id"
        columns={columns}
        dataSource={data.list}
        pagination={pagination}
        //  @ts-ignore
        onChange={handleTableChange}
      />
    </div>
  )
}


export default Log;