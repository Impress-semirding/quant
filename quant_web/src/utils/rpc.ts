//  @ts-ignore
import { Client } from 'hprose-js';
import { promisify } from "es6-promisify";

interface IResBase {
  success: boolean,
  message: string,
}

export type {
  IResBase
}

type RPCRequest = <T>(funcName: string, type: string) => T;

// @ts-ignore
const rpcReques: RPCRequest = (funcName: string, type: string) => {
  const token = localStorage.getItem('token');
  const cluster = localStorage.getItem('cluster') || "http://localhost:3000";
  const client = Client.create(`${cluster}/api`, { [funcName]: [type] });
  client.setHeader('Authorization', `Bearer ${token}`);
  return promisify(client[funcName][type])
}

export default rpcReques;