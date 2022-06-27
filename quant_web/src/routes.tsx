import type { RouteObject } from "react-router-dom";

// import CustomerLayout from './pages/Component/Layout'
import Login from './pages/Login'
import User from './pages/User'
import Quote from './pages/Quote'

const routes: RouteObject[] = [
  {
    path: "/",
    // element: <CustomerLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: "user", element: <User /> },
      { path: "/quote", element: <Quote /> },
    ],
  },
];

export default routes;
