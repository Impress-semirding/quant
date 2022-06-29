//  @ts-ignore
import { Client } from 'hprose-js';

type RPCRequest = <T extends (...args: any[]) => Promise<any>>(funcName: string, type: string) => (...args: Parameters<T>) => Promise<ReturnType<T>>;

//  @ts-ignore
const rpcReques: RPCRequest = (funcName: string, type: string) => {
  const token = localStorage.getItem('token');
  const cluster = localStorage.getItem('cluster') || "http://localhost:3000";
  const client = Client.create(`${cluster}/api`, { [funcName]: [type] });
  client.setHeader('Authorization', `Bearer ${token}`);
  return async (...args) => {
    debugger;
    const fn = client[funcName][type];
    const resp = await fn.apply(client, args);
    return resp;
  }
  // return async (...args) => {
  //   new Promise((resolve, reject) => {
  //     debugger;
  //     client[funcName][type](...args, (resp: any) => {
  //       if (resp.success) {
  //         resolve(resp.data);
  //       } else {
  //         reject(resp.message)
  //       }
  //     })
  //   })
  //   .catch((e) => {
  //     console.log("调用出错")
  //   })
  // }
}

export default rpcReques;