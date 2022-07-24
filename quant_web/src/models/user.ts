import { atomFamily, selectorFamily } from 'recoil';
import { get as getUser } from '../actions/user';

const userInfoQueryRequestIDState = atomFamily({
  key: 'UserInfoQueryRequestID',
  default: 0,
});

const userDetailQuery = selectorFamily({
  key: 'userDetail',
  get: requestId => async ({ get }) => {
    console.log(requestId)
    get(userInfoQueryRequestIDState(requestId)); // 添加请求ID作为依赖关系
    const data = await getUser();
    return data;
  },
});

export default userDetailQuery;

export {
  userInfoQueryRequestIDState,
}
