import React from "react";
import { atom, selector, selectorFamily, useRecoilValue, useRecoilState, useSetRecoilState, useRecoilValueLoadable, useRecoilCallback } from "recoil";
import { traderList } from '../actions/trader';
import type { ITrader } from '../types';

const AlgIdList = atom<{ id: React.Key, requestId: number }[]>({
  key: 'AlgIdList',
  default: [],
});

const TraderListQuery = selectorFamily<ITrader[], { id: React.Key; requestId: number }>({
  key: 'TraderListQuery',
  get: ({ id, requestId }) => async ({ get }) => {
    return await traderList(id);
  },
});

const AlgTradersMap = selector({
  key: 'AlgTradersMap',
  get: ({ get }) => {
    const map: { [key: React.Key]: ITrader[] } = {};
    const list = get(AlgIdList);
    for (const item of list) {
      const traders = get(TraderListQuery(item))
      map[item.id] = traders;
    }

    console.log(map)
    return map;
  }
});

function useTrader() {
  const [idList, setIdList] = useRecoilState(AlgIdList);
  const traders = useRecoilValueLoadable(AlgTradersMap);

  return {
    idList,
    setIdList,
    traders
  }
}

export {
  useTrader,
  // useCallback,
  AlgIdList,
  TraderListQuery,
  AlgTradersMap
}
