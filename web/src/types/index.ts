import type { ValueOf, ValueKeyOf } from './define';

interface IExchange {
  id?: number,
  name: string,
  type: string,
  status?: "Y" | "N";
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

type IApi = {
  id: number,
  funcName: string,
  period: number,
  status: string,
  exchangeType: string,
  userId: number
  updatedAt: Date,
  createdAt: Date,
}

type IApiList = IApi[];

type IArgorith = {
  id?: number;
  name: string;
  status: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

type IArgorithList = IArgorith[];

type ITrader = {
  id: number,
  userId: string;
  algorithmId: string,
  name: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

type ILog = {
  time: string;
  exchangeType: string;
  type: "INFO" | "ERROR" | "PROFIT" | "CANCEL";
  price: string;
  amount: string;
  message: string;
}

export type {
  ValueOf,
  ValueKeyOf,
  IUser,
  ILog,
  ILoginParams,
  IApi,
  IApiList,
  IArgorith,
  IArgorithList,
  ITrader,
  IExchangeTypes,
  IExchange,
  IExchangeList,
}