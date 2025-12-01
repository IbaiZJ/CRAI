import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import UserDetail from "@/pages/User";
import NotFound from "@/pages/NotFound";
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
