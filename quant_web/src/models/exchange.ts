import { atom, selector, useRecoilValue, useSetRecoilState, selectorFamily } from 'recoil';
import { exchangeTypes, exchangeList } from '../actions/exchange';

const exchangeTypesQuery = selector({
  key: 'exchangeTypes',
  get: async () => {
    const data = await exchangeTypes();
    return data;
  },
});

const listState = atom({ key: 'listState', default: { list: [], total: 0 } });

const exchangeListQuery = selectorFamily({
  key: 'exchangeList',
  get: ({ size, page, requestId }) => async ({ get }) => {
    const data = await exchangeList(size, page);
    return data
  },
});


export {
  exchangeListQuery,
}

export default exchangeTypesQuery;
