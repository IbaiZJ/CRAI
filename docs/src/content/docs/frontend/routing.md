---
title: Routing
description: React Router setup
---

Frontend routing configuration for CRAI (to be implemented).

## React Router

CRAI will use React Router v6 for client-side routing.

## Route Structure

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

## Navigation

```tsx
import { Link, useNavigate } from 'react-router-dom'

export const Navigation = () => {
  const navigate = useNavigate()

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/upload">Upload</Link>
      <button onClick={() => navigate('/about')}>About</button>
    </nav>
  )
}
```

## Protected Routes

```tsx
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Usage
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Next Steps

- Review [Components](/frontend/components/)
- Learn about [State Management](/frontend/state-management/)
