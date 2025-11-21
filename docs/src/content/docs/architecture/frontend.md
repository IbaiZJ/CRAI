---
title: Frontend Architecture
description: React and TypeScript frontend architecture
---

The CRAI frontend is built with React 18, TypeScript, and TailwindCSS, providing a modern, type-safe user interface.

## Architecture Overview

```
┌────────────────────────────────────────────┐
│         React Application (Vite)           │
├────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Pages   │  │Components│  │   State  │ │
│  │(Routes)  │  │   (UI)   │  │ (Hooks)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │              │       │
│  ┌────▼─────────────▼──────────────▼────┐  │
│  │         Services & API Client        │  │
│  └───────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

## Project Structure

```
frontend/
├── public/
│   └── assets/                # Static assets
├── src/
│   ├── main.tsx              # Application entry
│   ├── App.tsx               # Root component
│   ├── components/
│   │   ├── ui/               # Base UI components
│   │   │   └── button.tsx
│   │   └── landing/          # Landing page components
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── CTA.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx   # Landing page
│   │   └── Dashboard.tsx     # Dashboard page
│   ├── lib/
│   │   └── utils.ts          # Utility functions
│   ├── hooks/
│   │   └── useAPI.ts         # Custom hooks
│   ├── services/
│   │   └── api.ts            # API client
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── styles/
│       ├── index.css         # Global styles
│       └── tailwind.css      # Tailwind imports
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Core Components

### 1. Application Entry

**File:** `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2. Root Component

**File:** `src/App.tsx`

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

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
