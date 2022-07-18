import rpcRequest from '../utils/rpc';
import { IResp } from './types';

interface ILoginParams {
    cluster: string,
    username: string,
    password: string,
}


type ILoginRespFunc = (username: string, password: string) => Promise<string>

async function login(username: string, password: string) {
    const userLogin = rpcRequest<ILoginRespFunc>("User", "Login", false);
    const res = await userLogin(username, password)
    return res;
}

export {
    login
}

export type {
    ILoginResp,
    ILoginParams
}
