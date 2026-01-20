import { lazy } from "react";
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Users = lazy(() => import("@/pages/Users"));
const UserDetail = lazy(() => import("@/pages/User"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const StatisticsCars = lazy(() => import("@/pages/StatisticsCars"));
const StatisticsUsers = lazy(() => import("@/pages/StatisticsUsers"));
const StatisticsCameras = lazy(() => import("@/pages/StatisticsCameras"));
const Cameras = lazy(() => import("@/pages/Cameras"));
const Detections = lazy(() => import("@/pages/Detections"));
const Cars = lazy(() => import("@/pages/Cars"));
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
    path: "/statistics/cars",
    component: StatisticsCars,
    protected: true,
  },
  {
    path: "/statistics/users",
    component: StatisticsUsers,
    protected: true,
  },
  {
    path: "/statistics/cameras",
    component: StatisticsCameras,
    protected: true,
  },
  {
    path: "/cameras",
    component: Cameras,
    protected: true,
  },
  {
    path: "/detections",
    component: Detections,
    protected: true,
  },
  {
    path: "/cars",
    component: Cars,
    protected: true,
  }
];

export const routes = createRoutes(appRoutes);
