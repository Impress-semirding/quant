import rpcRequest from '../utils/rpc';
import type { IArgorithList } from '../types';

interface ISaveReq {
  name: string,
  description: string,
  script: string
}


type IListResp = {
  list: IArgorithList,
  total: number;
}

type IAlgorithmSaveFunc = (req: ISaveReq) => Promise<any>

type IAlgorithmListFunc = (size: number, page: number) => Promise<IListResp>

async function algorithmSave(req: ISaveReq) {
  const algorithmPut = rpcRequest<IAlgorithmSaveFunc>("Algorithm", "Put", true);
  const res = await algorithmPut(req)
  return res;
}

async function algorithmList(size: number, page: number) {
  const algorithmList = rpcRequest<IAlgorithmListFunc>("Algorithm", "List", true);
  const res = await algorithmList(size, page)
  return res;
}

async function RunBackTesing(id: number) {
  const runBackTest = rpcRequest<(id: number) => Promise<void>>("Trader", "BackTesting", true);
  const res = await runBackTest(id)
  return res;
}

export {
  algorithmSave,
  algorithmList
}
