import { lazy } from "react";
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Users = lazy(() => import("@/pages/Users"));
const UserDetail = lazy(() => import("@/pages/User"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Cameras = lazy(() => import("@/pages/Cameras"));
const Cars = lazy(() => import("@/pages/Cars"));
const Simulations = lazy(() => import("@/pages/Simulations"));
const SignUp = lazy(() => import("@/pages/SignUp"));
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
    path: "/signup",
    component: SignUp,
    // Public route
  },
  {
    path: "/dashboard",
    component: Dashboard,
    protected: true,
  },
  {
    path: "/users",
    component: Users,
    protected: true,
  },
  {
    path: "/users/:id",
    component: UserDetail,
    protected: true,
  },
  {
    path: "/statistics",
    component: Statistics,
    protected: true, 
  },
  {
    path: "/cameras",
    component: Cameras,
    protected: true,
  },
  {
    path: "/cars",
    component: Cars,
    protected: true,
  },
  {
    path: "/simulations",
    component: Simulations,
    protected: true,
  }
];

export const routes = createRoutes(appRoutes);
