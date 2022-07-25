import React from "react";
import { atomFamily, selectorFamily } from "recoil";
import { algorithmList } from '../actions/algorithm';
import type { IArgorithList } from '../types';


const AlgListQueryRequestIDState = atomFamily({
  key: 'AlgListQueryRequestID',
  default: 0,
});

const AlgListQuery = selectorFamily<{ list: IArgorithList; total: number }, { size: number; page: number; requestId: React.Key }>({
  key: 'algListQuery',
  get: ({ size, page, requestId }) => async ({ get }) => {
    get(AlgListQueryRequestIDState(requestId));
    const data = await algorithmList(size, page);
    return data
  },
});

export {
  AlgListQuery,
  AlgListQueryRequestIDState
}