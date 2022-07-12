import { atom } from "recoil";

const algState = atom({
  key: 'alg',
  default: {
    name: "",
    description: "",
    script: ""
  },
});

export default algState;