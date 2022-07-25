import { atomFamily, selectorFamily } from "recoil";
import { algorithmList } from '../actions/algorithm';


const AlgListQueryRequestIDState = atomFamily({
  key: 'AlgListQueryRequestID',
  default: 0,
});

const AlgListQuery = selectorFamily({
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