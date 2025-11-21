---
title: Styling
description: TailwindCSS styling guide
---

Styling approach for CRAI frontend using TailwindCSS.

## TailwindCSS

CRAI uses TailwindCSS for utility-first styling.

## Configuration

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
}
```

## Utility Classes

```tsx
export const Card = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Card Title
        </h3>
        <p className="text-sm text-muted-foreground">
          Card Description
        </p>
      </div>
    </div>
  )
}
```

## Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

<p className="text-sm md:text-base lg:text-lg">
  Responsive text
</p>
```

## Custom Utilities

**File:** `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors;
  }
  
  .card {
    @apply rounded-lg shadow-md p-6 bg-white;
  }
}
```

## cn Utility

**File:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn("base-class", condition && "conditional-class", className)}>
```

## Dark Mode

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  // ...
}
```

```tsx
// Toggle dark mode
const [darkMode, setDarkMode] = useState(false)

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [darkMode])

// Dark mode styles
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Content
</div>
```

## Next Steps

- Review [Components](/frontend/components/)
- Check [State Management](/frontend/state-management/)
