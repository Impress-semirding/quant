import React from 'react';
import rpcRequest from '../utils/rpc';
import type { IArgorithList, IArgorith, ITrader } from '../types';

type IAlgorithmSaveFunc = (req: IArgorith) => Promise<IArgorith>
type IAlgorithmList = (id: React.Key) => Promise<ITrader[]>
type IAlgorithmDelete = (id: React.Key) => Promise<boolean>


async function traderSave(req: IArgorith) {
  const traderPut = rpcRequest<IAlgorithmSaveFunc>("Trader", "Put", true);
  const res = await traderPut(req)
  return res;
}

async function traderList(id: React.Key) {
  const traderList = rpcRequest<IAlgorithmList>("Trader", "List", true);
  const res = await traderList(id)
  return res;
}

async function traderDelete(id: number) {
  const traderDel = rpcRequest<IAlgorithmDelete>("Trader", "Delete", true);
  const res = await traderDel(id)
  return res;
}

async function traderSwitch(req: ITrader) {
  const runTrader = rpcRequest<(req: ITrader) => Promise<void>>("Trader", "Switch", true);
  const res = await runTrader(req)
  return res;
}

export {
  traderSave,
  traderList,
  traderDelete,
  traderSwitch
}
