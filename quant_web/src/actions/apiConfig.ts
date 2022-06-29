import rpcReques from '../utils/rpc';
import { IResp } from './types';

interface IConfigTaskItem {
  createdAt: Date,
  exchangeType: string,
  funcName: string,
  id: number,
  period: number,
  status: string,
  updatedAt: Date,
  userId: number
}

type IData = {
  list: IConfigTaskItem[],
  total: number,
};
interface Iform {
  funcName: string,
  exchangeType: string,
  period: string,
}

// type IPutgResp = IResp & IData;

type IPutConfig = (req: any) => Promise<IData>

type IListConfig = (size: number, page: number) => Promise<IData>


async function put(req: Iform) {
  const putApiConfig = rpcReques<IPutConfig>("ApiConfig", "PUT");
  const res = await putApiConfig(req)
  return res;
}

async function list() {
  const listApiConfig = rpcReques<IListConfig>("ApiConfig", "List");
  const res = await listApiConfig(10, 1)
  return res;
}

export {
  put,
  list
}

export type {
  IConfigTaskItem
}