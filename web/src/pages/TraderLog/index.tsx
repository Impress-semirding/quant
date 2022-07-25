import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, notification } from 'antd';
import { useRecoilValue } from 'recoil';
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from 'antd/es/table';

import { traderState } from '../../models';
import { logList } from '../../actions/log';
import styles from './index.module.scss';

import type { ValueKeyOf, ILog } from '../../types';


function Log() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ list: ILog[], total: number }>({
    total: 0,
    list: []
  })
  const [filter, setFilter] = useState({})
  const [pagination, setPagination] = useState({
    pageSize: 12,
    current: 1,
    total: 0,
  })
  const traderLog = useRecoilValue(traderState);

  useEffect(() => {
    setFilter({})
    reload();
    return () => {
      notification.destroy();
    }
  }, [])

  const reload = async () => {
    const { total, list } = await logList(traderLog, pagination, filter);
    setData({ total, list })
    setPagination(pag => ({ ...pag, total }))
    // dispatch(LogList(trader.cache, pagination, this.filters));
  }

  const handleTableChange = (newPagination: { current: any; }, filters: any) => {
    const pag = {
      ...pagination,
      current: newPagination.current,
    }
    setFilter(filter)
    //  @ts-ignore
    setPagination({ pagination: pag });
    reload();
  }

  const handleCancel = () => {
    navigate('/algorithm');
  }


  const colors = {
    'INFO': '#A9A9A9',
    'ERROR': '#F50F50',
    'PROFIT': '#4682B4',
    'CANCEL': '#5F9EA0',
  };
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