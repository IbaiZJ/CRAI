import React, { Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SpinnerCustom } from "@/components/Spinner";

interface AppRoute {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  children?: AppRoute[];
}

export const createRoutes = (routes: AppRoute[]): RouteObject[] => {
  return routes.map((route) => ({
    path: route.path,
    element: (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <SpinnerCustom />
          </div>
        }
      >
        {route.protected ? (
          <ProtectedRoute>
            <route.component />
          </ProtectedRoute>
        ) : (
          <route.component />
        )}
      </Suspense>
    ),
    children: route.children ? createRoutes(route.children) : undefined,
  }));
};
