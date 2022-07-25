import { atom } from "recoil";

const traderState = atom({
  key: 'trader',
  default: {},
});

export default traderState;