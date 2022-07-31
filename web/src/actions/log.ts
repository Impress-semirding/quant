import rpcRequest from '../utils/rpc';
import type { ILog } from '../types';

type IListFunc = (trader: string, pagination: any, filters: any) => Promise<{ list: ILog[], total: number }>

async function logList(traderId: string, pagination: any, filters: any) {
  const traderLogList = rpcRequest<IListFunc>("Log", "List", true);
  const res = await traderLogList(traderId, pagination, filters)
  return res;
}

export {
  logList,
}
