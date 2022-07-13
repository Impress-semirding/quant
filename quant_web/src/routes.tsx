import type { RouteObject } from "react-router-dom";

// import CustomerLayout from './pages/Component/Layout'
import Login from './pages/Login'
import Algorithm from './pages/Algorithm'
import Quote from './pages/Quote'
import AlgorithmEdit from './pages/Algorithm/AlgorithmEdit';
import TraderLog from "./pages/TraderLog";

const routes: RouteObject[] = [
  {
    path: "/",
    // element: <CustomerLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "algorithm", element: <Algorithm /> },
      { path: "algorithmEdit/:id", element: <AlgorithmEdit /> },
      { path: "traderLog/:id", element: <TraderLog /> },
      { path: "quote", element: <Quote /> },
    ],
  },
];

export default routes;
