import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import { createRoutes } from "./routeUtils";

const appRoutes = [
  {
    path: "/",
    component: Home,
    // Ruta pública
  },
  {
    path: "/login",
    component: Login,
    // Ruta pública
  },
  {
    path: "/signup",
    component: SignUp,
    // Ruta pública
  },
  {
    path: "/dashboard",
    component: Dashboard,
    protected: true, // Requiere autenticación
  },
  // Agrega más rutas protegidas aquí
  // {
  //   path: "/profile",
  //   component: Profile,
  //   protected: true,
  // },
];

export const routes = createRoutes(appRoutes);
