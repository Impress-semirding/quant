import { selector, selectorFamily } from 'recoil';
import { exchangeTypes, exchangeList } from '../actions/exchange';
import { IExchangeList } from '../types';

const exchangeTypesQuery = selector({
  key: 'exchangeTypes',
  get: async () => {
    const data = await exchangeTypes();
    return data;
  },
});


const exchangeListQuery = selectorFamily<IExchangeList, { size: number, page: number, requestId: number }>({
  key: 'exchangeList',
  get: ({ size, page, requestId }) => async () => {
    const data = await exchangeList(requestId, size, page);
    return data
  },
});


export {
  exchangeListQuery,
}

export default exchangeTypesQuery;
