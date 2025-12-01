import { lazy } from "react";
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Users = lazy(() => import("@/pages/Users"));
const UserDetail = lazy(() => import("@/pages/User"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import { createRoutes } from "./routeUtils";

const appRoutes = [
  {
    path: "*",
    component: NotFound,
    // Catch all route for 404
  },
  {
    path: "/",
    component: Home,
    // Public route
  },
  {
    path: "/login",
    component: Login,
    // Public route
  },
  {
    path: "/dashboard",
    component: Dashboard,
    protected: true, // Requires authentication
  },
  {
    path: "/users",
    component: Users,
    protected: true, // Requires authentication
  },
  {
    path: "/users/:id",
    component: UserDetail,
    protected: true, // Requires authentication
  },
];

export const routes = createRoutes(appRoutes);
