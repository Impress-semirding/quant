import rpcRequest from '../utils/rpc';
import { IResp } from './types';

interface ISaveReq {
  name: string,
  description: string,
  script: string
}


type ISaveResp = {

}


type IAlgorithmSaveFunc = (req: IListReq) => Promise<ISaveResp>


async function traderSave(req: ISaveReq) {
  const traderPut = rpcRequest<IAlgorithmSaveFunc>("Trader", "Put", true);
  const res = await traderPut(req)
  return res;
}

async function traderList(id: number) {
  const traderList = rpcRequest<IAlgorithmSaveFunc>("Trader", "List", true);
  const res = await traderList(id)
  return res;
}

async function traderDelete(id: number) {
  const traderDel = rpcRequest<IAlgorithmSaveFunc>("Trader", "Delete", true);
  const res = await traderDel(id)
  return res;
}

async function traderSwitch(req: ISaveReq) {
  const runTrader = rpcRequest<IAlgorithmSaveFunc>("Trader", "Switch", true);
  const res = await runTrader(req)
  return res;
}

export {
  traderSave,
  traderList,
  traderDelete,
  traderSwitch
}

export type {
  ILoginResp
}
