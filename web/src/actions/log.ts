import rpcRequest from '../utils/rpc';
import type { ILog } from '../types';

type IListFunc = (trader: any, pagination: any, filters: any) => Promise<{ list: ILog[], total: number }>

async function logList(trader: any, pagination: any, filters: any) {
  const traderLogList = rpcRequest<IListFunc>("Log", "List", true);
  const res = await traderLogList(trader, pagination, filters)
  return res;
}

export {
  logList,
}
