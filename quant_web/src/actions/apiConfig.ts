import rpcReques, { IResBase } from '../utils/rpc';

type IData = { data: any };

type IPutgResp = IResBase & IData;

type IPutConfig = (req: any) => Promise<IPutgResp>

const putApiConfig = rpcReques<IPutConfig>("ApiConfig", "PUT");

async function put(req: string) {
  const res = await putApiConfig({
    funcName: "dingxue",
    exchangeType: "binance",
  })
}

export {
  put
}