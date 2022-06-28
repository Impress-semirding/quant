import rpcReques, { IResBase } from '../utils/rpc';

type IData = { data: any };
interface Iform {
  funcName: string,
  exchangeType: string,
  period: string,
}

type IPutgResp = IResBase & IData;

type IPutConfig = (req: any) => Promise<IPutgResp>
type IListConfig = (size: number, page: number) => Promise<IPutgResp>

const putApiConfig = rpcReques<IPutConfig>("ApiConfig", "PUT");
const listApiConfig = rpcReques<IListConfig>("ApiConfig", "List");

async function put(req: Iform) {
  const res = await putApiConfig(req)
}

async function list() {
  const res = await listApiConfig(10, 1);
}

export {
  put,
  list
}