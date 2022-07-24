import rpcRequest from '../utils/rpc';
import type { IUser } from '../types';

type ILoginRespFunc = (username: string, password: string) => Promise<string>

async function login(username: string, password: string) {
  const userLogin = rpcRequest<ILoginRespFunc>("User", "Login", false);
  const res = await userLogin(username, password)
  return res;
}

async function get() {
  const userGet = rpcRequest<() => Promise<IUser>>("User", "Get", true);
  const res = await userGet()
  return res;
}

export {
  get,
  login
}
