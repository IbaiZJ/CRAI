import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AppRoute {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  children?: AppRoute[];
}

export const createRoutes = (routes: AppRoute[]): RouteObject[] => {
  return routes.map((route) => ({
    path: route.path,
    element: route.protected ? (
      <ProtectedRoute>
        <route.component />
      </ProtectedRoute>
    ) : (
      <route.component />
    ),
    children: route.children ? createRoutes(route.children) : undefined,
  }));
};
