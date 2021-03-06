import type { RouteObject } from "react-router-dom";

import Login from './pages/Login'
import Algorithm from './pages/Algorithm'
import Quote from './pages/Quote'
import AlgorithmEdit from './pages/Algorithm/AlgorithmEdit';
import TraderLog from "./pages/TraderLog";
import Exchange from './pages/Exchange';

const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      { index: true, element: <Algorithm /> },
      { path: "login", element: <Login /> },
      { path: "algorithm", element: <Algorithm /> },
      { path: "algorithmEdit/:id", element: <AlgorithmEdit /> },
      { path: "traderLog/:id", element: <TraderLog /> },
      { path: "quote", element: <Quote /> },
      { path: "exchange", element: <Exchange /> }
    ],
  },
];

export default routes;
