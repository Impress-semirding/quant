import rpcRequest from '../utils/rpc';
import { IResp } from './types';

type ILogListResp = {};
type IListFunc = (trader, pagination, filters) => Promise<ILogListResp>

async function logList(trader, pagination, filters) {
  const traderLogList = rpcRequest<IListFunc>("Log", "List", true);
  const res = await traderLogList(trader, pagination, filters)
  return res;
}

export {
  logList,
}

export type {
  ILoginResp
}
