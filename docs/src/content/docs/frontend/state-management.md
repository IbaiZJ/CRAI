---
title: State Management
description: State management with React hooks
---

State management strategies for CRAI frontend (to be implemented).

## React Hooks

### useState

```tsx
import { useState } from 'react'

export const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### useEffect

```tsx
import { useEffect, useState } from 'react'

export const DataFetcher = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  return <div>{data && JSON.stringify(data)}</div>
}
```

## Context API

```tsx
import { createContext, useContext, useState } from 'react'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
```

## Custom Hooks

```tsx
import { useState, useEffect } from 'react'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [url])

  return { data, loading, error }
}

// Usage
const { data, loading, error } = useFetch<User>('/api/user')
```

## Next Steps

- Review [Components](/frontend/components/)
- Check [Styling](/frontend/styling/)
