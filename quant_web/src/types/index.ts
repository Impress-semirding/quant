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


type IUser = {
  id: number;
  username: string;
  password: string;
  level: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface ILoginParams {
  cluster: string,
  username: string,
  password: string,
}

export type {
  IUser,
  ILoginParams,
  IExchangeTypes,
  IExchange,
  IExchangeList,
}