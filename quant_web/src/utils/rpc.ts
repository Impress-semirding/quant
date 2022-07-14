//  @ts-ignore
import { Client } from 'hprose-js';
import { message } from 'antd';

type RPCRequest = <T extends (...args: any[]) => Promise<any>>(funcName: string, type: string) => (...args: Parameters<T>) => Promise<ReturnType<T>>;

const rpcReques: RPCRequest = (funcName: string, type: string, withToken?: boolean) => {
  const token = localStorage.getItem('token');
  const cluster = localStorage.getItem('cluster') || "http://localhost:3000";
  const client = Client.create(`${cluster}/api`, { [funcName]: [type] });
  if (withToken) {
    client.setHeader('Authorization', `Bearer ${token}`);
  }
  return async (...args) => {
    const fn = client[funcName][type];
    const resp = await fn.apply(client, args);
    if (!resp.success) {
      const msg = resp.message || "未知";
      message.error(`调用${funcName}.${type}接口出错，错误原因：, ${msg}`)
      throw new Error("调用接口出错")
    }
    return resp.data;
  }
}

export default rpcReques;