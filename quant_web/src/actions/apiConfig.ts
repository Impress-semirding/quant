import rpcReques from '../utils/rpc';
import { IResp } from './types';

type IData = { data: any };
interface Iform {
  funcName: string,
  exchangeType: string,
  period: string,
}

type IPutgResp = IResp & IData;

type IPutConfig = (req: any) => Promise<IPutgResp>

type IListConfig = (size: number, page: number) => Promise<IPutgResp>


async function put(req: Iform) {
  const putApiConfig = rpcReques<IPutConfig>("ApiConfig", "PUT");
  const res = await putApiConfig(req)
  return res;
}

async function list() {
  const listApiConfig = rpcReques<IListConfig>("ApiConfig", "List");
  const res = await listApiConfig(10,1)
  return res;
}

export {
  put,
  list
}