import rpcRequest from '../utils/rpc';
import { IResp } from './types';

interface ILogin {
    funcName: string,
    exchangeType: string,
    period: string,
}


type ILoginResp = {

}

type ILoginRespFunc = (size: number, page: number) => Promise<ILoginResp>

async function login(username: string, password: string) {
    const userLogin = rpcRequest<ILoginRespFunc>("User", "Login", false);
    const res = await userLogin(username, password)
    return res;
}

export {
    login
}

export type {
    ILoginResp
}
