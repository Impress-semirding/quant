
import rpcRequest from '../utils/rpc';
import { IResp } from './types';

type ISaveResp = {

}



type IExchangeListFunc = (size: number, page: number) => Promise<IListResp>



async function exchangeList(size: number, page: number) {
    const exchangeList = rpcRequest<IExchangeListFunc>("Exchange", "List", true);
    const res = await exchangeList(size, page)
    return res;
}

export {
    exchangeList,
}

export type {
    ISaveResp
}
