import rpcRequest from '../utils/rpc';
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

type IRunTask = (id: number) => Promise<IData>


async function put(req: Iform) {
  const putApiConfig = rpcRequest<IPutConfig>("ApiConfig", "Put", true);
  const res = await putApiConfig(req)
  return res;
}

async function list() {
  const listApiConfig = rpcRequest<IListConfig>("ApiConfig", "List", true);
  const res = await listApiConfig(10, 1)
  return res;
}

async function run(id: number) {
  const runTask = rpcRequest<IRunTask>("ApiConfig", "Run", true)
  const res = await runTask(id)
  return res;
}

async function stop(id: number) {
  const stopTask = rpcRequest<IRunTask>("ApiConfig", "Stop", true)
  const res = await stopTask(id)
  return res;
}

export {
  put,
  list,
  run,
  stop
}

export type {
  IConfigTaskItem
}
