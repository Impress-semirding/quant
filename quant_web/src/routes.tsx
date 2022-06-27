import type { RouteObject } from "react-router-dom";

import Login from './pages/Login'
import User from './pages/User'

const routes: RouteObject[] = [
  {
    path: "/",
    // element: <Layout />,
    children: [
      { index: true, element: <Login /> },
      { path: "user", element: <User /> },
    ],
  },
];

export default routes;