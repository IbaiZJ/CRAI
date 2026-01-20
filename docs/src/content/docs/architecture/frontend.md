---
title: Frontend Architecture
description: React and TypeScript frontend architecture
---

The CRAI frontend is built with React 19, TypeScript 5.9, Vite 7, and TailwindCSS 4, providing a modern, type-safe dashboard interface with Google OAuth authentication.

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│              React Application (Vite 7)                        │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │Components│  │ Contexts │  │   Services    │  │
│  │(Routes)  │  │   (UI)   │  │ (State)  │  │   (API)       │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │             │              │               │           │
│  ┌────▼─────────────▼──────────────▼───────────────▼────────┐  │
│  │              React Router 7 + Google OAuth               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
frontend/
├── public/
│   └── assets/                  # Static assets
├── src/
│   ├── main.tsx                 # Application entry
│   ├── App.tsx                  # Root component with routes
│   ├── index.css                # Global styles
│   ├── App.css                  # App-specific styles
│   │
│   ├── components/
│   │   ├── ui/                  # Radix UI components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── charts/              # Recharts components
│   │   ├── dataTable/           # Data table components
│   │   ├── dialogs/             # Dialog components
│   │   ├── AppSidebar.tsx       # Main sidebar
│   │   ├── LoginForm.tsx        # Login form
│   │   ├── SignupForm.tsx       # Signup form
│   │   ├── NavMain.tsx          # Navigation
│   │   ├── NavUser.tsx          # User navigation
│   │   ├── ProtectedRoute.tsx   # Auth guard
│   │   ├── Spinner.tsx          # Loading spinner
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Home.tsx             # Landing page
│   │   ├── Login.tsx            # Login page
│   │   ├── SignUp.tsx           # Signup page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Users.tsx            # Users list
│   │   ├── User.tsx             # User detail
│   │   ├── Statistics.tsx       # Statistics view
│   │   ├── Cameras.tsx          # Cameras management
│   │   ├── Cars.tsx             # Vehicles tracking
│   │   ├── Simulations.tsx      # Simulation control
│   │   └── NotFound.tsx         # 404 page
│   │
│   ├── routes/
│   │   ├── index.tsx            # Route definitions
│   │   └── routeUtils.tsx       # Route utilities
│   │
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom hooks
│   ├── services/                # API services
│   ├── types/                   # TypeScript types
│   ├── constants/               # App constants
│   ├── layouts/                 # Layout components
│   ├── lib/
│   │   └── utils.ts             # Utility functions (cn)
│   └── test/
│       └── setup.ts             # Test configuration
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── components.json              # shadcn/ui config
└── package.json
```

## Core Components

### 1. Application Entry

**File:** `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
```

### 2. Root Component

**File:** `src/App.tsx`

```tsx
import { useRoutes } from "react-router-dom";
import { routes } from "@/routes";

function App() {
  return useRoutes(routes);
}

export default App;
```

### 3. Route Configuration

**File:** `src/routes/index.tsx`

```tsx
import { lazy } from "react";
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Users = lazy(() => import("@/pages/Users"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Cameras = lazy(() => import("@/pages/Cameras"));
const Cars = lazy(() => import("@/pages/Cars"));
const Simulations = lazy(() => import("@/pages/Simulations"));

const appRoutes = [
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
  { path: "*", component: NotFound },
];

export const routes = createRoutes(appRoutes);
```

## Authentication

### Google OAuth Integration

The frontend uses `@react-oauth/google` for authentication:

```tsx
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
  const handleSuccess = (response) => {
    const decoded = jwtDecode(response.credential);
    // Store token and user data
    localStorage.setItem('token', response.credential);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

### Protected Routes

**File:** `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

## UI Components

### Component Library

CRAI uses **shadcn/ui** components built on Radix UI primitives:

- `Button` - Various button styles
- `Dialog` - Modal dialogs
- `DropdownMenu` - Dropdown menus
- `Select` - Select inputs
- `Tooltip` - Tooltips
- `Avatar` - User avatars
- `Checkbox` - Checkboxes
- `Label` - Form labels
- `Separator` - Visual separators

### Utility Function

**File:** `src/lib/utils.ts`

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Button Component Example

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Data Visualization

### Recharts Integration

The frontend uses **Recharts** for data visualization:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function StatisticsChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="vehicles" stroke="#8884d8" />
    </LineChart>
  );
}
```

## Styling

### TailwindCSS 4

The project uses TailwindCSS 4 with the Vite plugin:

**File:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### CSS Variables

Theme customization via CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

## State Management

### React Contexts

State is managed through React contexts:

```tsx
// AuthContext example
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Dependencies

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6",
    "@react-oauth/google": "^0.12.2",
    "jwt-decode": "^4.0.0",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.17",
    "recharts": "^2.15.4",
    "lucide-react": "^0.554.0",
    "gsap": "^3.13.0",
    "motion": "^12.23.24"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "~5.9.3",
    "vite": "^7.2.2",
    "vitest": "^4.0.14",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@vitest/coverage-v8": "^4.0.14"
  }
}
```

## Testing

### Vitest Configuration

Tests use Vitest with React Testing Library:

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### Running Tests

```bash
npm run test           # Watch mode
npm run test:ui        # UI mode
npm run test:coverage  # Coverage report
```

## Next Steps

- View [Components Guide](/frontend/components/)
- Learn about [Routing](/frontend/routing/)
- Explore [State Management](/frontend/state-management/)

export default App
```

### 3. Page Components

**File:** `src/pages/LandingPage.tsx`

```tsx
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import CTA from '../components/landing/CTA'

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}
```

### 4. UI Components

**File:** `src/components/ui/button.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': 
              variant === 'default',
            'border border-input hover:bg-accent': 
              variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': 
              variant === 'ghost',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 px-3': size === 'sm',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

**File:** `src/components/landing/Hero.tsx`

```tsx
import { Button } from '../ui/button'

export default function Hero() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          AI-Powered License Plate
          <span className="text-primary"> Recognition</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Detect and recognize vehicle license plates with 
          state-of-the-art AI technology. Fast, accurate, and easy to integrate.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Get Started
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
```

## State Management

### Using React Hooks

```tsx
import { useState, useEffect } from 'react'

function Dashboard() {
  const [plates, setPlates] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPlates()
  }, [])
  
  const fetchPlates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/plates')
      const data = await response.json()
      setPlates(data)
    } catch (error) {
      console.error('Failed to fetch plates:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      {loading ? <Loading /> : <PlateList plates={plates} />}
    </div>
  )
}
```

### Custom Hooks

**File:** `src/hooks/useAPI.ts`

```tsx
import { useState, useCallback } from 'react'

interface UseAPIState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAPI<T>(apiFunc: () => Promise<T>) {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await apiFunc()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const err = error as Error
      setState({ data: null, loading: false, error: err })
      throw error
    }
  }, [apiFunc])

  return { ...state, execute }
}
```

**Usage:**

```tsx
import { useAPI } from '@/hooks/useAPI'
import { recognizePlate } from '@/services/api'

function RecognitionForm() {
  const { data, loading, error, execute } = useAPI(recognizePlate)
  
  const handleSubmit = async (file: File) => {
    try {
      await execute()
      console.log('Result:', data)
    } catch (err) {
      console.error('Error:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form content */}
    </form>
  )
}
```

## API Integration

**File:** `src/services/api.ts`

```tsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6902'

class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}

export const api = new APIClient(API_URL)

// API methods
export const recognizePlate = (file: File) =>
  api.uploadFile('/api/recognize', file)

export const getHealth = () =>
  api.get('/api/health')
```

## TypeScript Types

**File:** `src/types/index.ts`

```tsx
export interface PlateRecognitionResult {
  plate_number: string
  confidence: number
  processing_time: number
  timestamp: string
}

export interface HealthStatus {
  status: string
  version: string
}

export interface APIError {
  detail: string
  status_code: number
}
```

## Styling with TailwindCSS

### Utility Classes

```tsx
// Responsive design
<div className="p-4 sm:p-6 lg:p-8">

// Flexbox
<div className="flex flex-col items-center justify-center">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Colors
<button className="bg-primary hover:bg-primary/90 text-white">

// Typography
<h1 className="text-4xl font-bold tracking-tight">
```

### Custom Utilities

**File:** `src/lib/utils.ts`

```tsx
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Routing

Using React Router:

```tsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
```

## Form Handling

```tsx
import { useState } from 'react'

function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const data = await recognizePlate(file)
      setResult(data)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={!file || loading}>
        {loading ? 'Processing...' : 'Recognize'}
      </button>
      {result && <ResultDisplay result={result} />}
    </form>
  )
}
```

## Error Boundaries

```tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Sorry.. there was an error</h1>
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  )
}
```

### Memoization

```tsx
import { useMemo, useCallback } from 'react'

function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(/* expensive operation */)
  }, [data])

  const handleClick = useCallback(() => {
    // handle click
  }, [])

  return <div>{/* render */}</div>
}
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Build Configuration

**File:** `vite.config.ts`

```tsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:6902',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
```

## Next Steps

- Explore [Component Library](/frontend/components/)
- Learn about [State Management](/frontend/state-management/)
- Review [Styling Guide](/frontend/styling/)
- Check [API Integration](/api/endpoints/)
