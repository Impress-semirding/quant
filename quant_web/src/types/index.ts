interface IExchange {
  id?: number,
  name: string,
  type: string,
  accessKey: string,
  secretKey: string,
  passphrase: string,
  createdAt?: string,
  updateAt?: string,
}

type IExchangeList = {
  list: IExchange[],
  total: number,
}

type IExchangeType = "okex" | "binance";
type IExchangeTypes = IExchangeType[];


export type {
  IExchangeTypes,
  IExchange,
  IExchangeList,
}