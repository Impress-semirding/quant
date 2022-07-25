import { selector } from 'recoil';
import { list as apiList } from '../actions/apiConfig';


const apiListQuery = selector({
  key: 'apiList',
  get: async () => {
    const data = await apiList();
    return data
  },
});


export default apiListQuery;
