---
title: Routing
description: React Router 7 setup and route configuration
---

CRAI uses React Router 7 for client-side routing with lazy loading and protected routes.

## Route Configuration

### Route Definitions

**File:** `src/routes/index.tsx`

```tsx
import { lazy } from "react";

// Lazy load all pages
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Users = lazy(() => import("@/pages/Users"));
const UserDetail = lazy(() => import("@/pages/User"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Cameras = lazy(() => import("@/pages/Cameras"));
const Cars = lazy(() => import("@/pages/Cars"));
const Simulations = lazy(() => import("@/pages/Simulations"));
const NotFound = lazy(() => import("@/pages/NotFound"));

import { createRoutes } from "./routeUtils";

const appRoutes = [
  { path: "*", component: NotFound },
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: SignUp },
  { path: "/dashboard", component: Dashboard, protected: true },
  { path: "/users", component: Users, protected: true },
  { path: "/users/:id", component: UserDetail, protected: true },
  { path: "/statistics", component: Statistics, protected: true },
  { path: "/cameras", component: Cameras, protected: true },
  { path: "/cars", component: Cars, protected: true },
  { path: "/simulations", component: Simulations, protected: true },
];

export const routes = createRoutes(appRoutes);
```

## Application Routes

### Public Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page |
| `/login` | Login | Login with Google OAuth |
| `/signup` | SignUp | User registration |
| `*` | NotFound | 404 page |

### Protected Routes

| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | Main dashboard view |
| `/users` | Users | User management list |
| `/users/:id` | User | Individual user details |
| `/statistics` | Statistics | Charts and analytics |
| `/cameras` | Cameras | Camera management |
| `/cars` | Cars | Vehicle tracking |
| `/simulations` | Simulations | Simulation control |

## Route Utilities

**File:** `src/routes/routeUtils.tsx`

```tsx
import { Suspense } from "react";
import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Spinner } from "@/components/Spinner";

interface AppRoute {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  protected?: boolean;
}

export function createRoutes(routes: AppRoute[]): RouteObject[] {
  return routes.map(({ path, component: Component, protected: isProtected }) => ({
    path,
    element: (
      <Suspense fallback={<Spinner />}>
        {isProtected ? (
          <ProtectedRoute>
            <Component />
          </ProtectedRoute>
        ) : (
          <Component />
        )}
      </Suspense>
    ),
  }));
}
```

## Protected Route Component

**File:** `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

## Navigation

### Programmatic Navigation

```tsx
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

### Link Component

```tsx
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/statistics">Statistics</Link>
    </nav>
  );
}
```

### NavLink for Active States

```tsx
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <nav>
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => 
          isActive ? "text-primary font-bold" : "text-muted"
        }
      >
        Dashboard
      </NavLink>
    </nav>
  );
}
```

## URL Parameters

### Route Parameters

```tsx
// Route: /users/:id
import { useParams } from "react-router-dom";

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  
  return <div>User ID: {id}</div>;
}
```

### Query Parameters

```tsx
import { useSearchParams } from "react-router-dom";

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q");
  
  return <div>Searching for: {query}</div>;
}
```

## Lazy Loading

All pages use React.lazy for code splitting:

```tsx
const Dashboard = lazy(() => import("@/pages/Dashboard"));
```

This ensures:
- Smaller initial bundle size
- Faster initial page load
- Pages loaded on-demand

### Suspense Fallback

```tsx
<Suspense fallback={<Spinner />}>
  <Component />
</Suspense>
```

The `Spinner` component displays during page load.

## App Integration

**File:** `src/App.tsx`

```tsx
import { useRoutes } from "react-router-dom";
import { routes } from "@/routes";

function App() {
  return useRoutes(routes);
}

export default App;
```

**File:** `src/main.tsx`

```tsx
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

## Next Steps

- Review [Components](/frontend/components/)
- Learn about [State Management](/frontend/state-management/)
- Explore [Styling](/frontend/styling/)
