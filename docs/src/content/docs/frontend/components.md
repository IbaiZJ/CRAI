---
title: Components
description: React component architecture
---

React component structure for CRAI frontend (to be implemented).

## Component Structure

```
src/components/
├── landing/          # Landing page components
├── ui/              # Reusable UI components
│   └── button.tsx   # Button component
└── layout/          # Layout components
```

## UI Components

### Button Component

**File:** `src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## Component Patterns

### Functional Components

```tsx
import { FC } from 'react'

interface CardProps {
  title: string
  description: string
  image?: string
}

export const Card: FC<CardProps> = ({ title, description, image }) => {
  return (
    <div className="card">
      {image && <img src={image} alt={title} />}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
```

### With Hooks

```tsx
import { useState } from 'react'

export const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {preview && <img src={preview} alt="Preview" />}
    </div>
  )
}
```

## Styling with TailwindCSS

```tsx
export const Alert = ({ message, type = 'info' }: AlertProps) => {
  const styles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
  }

  return (
    <div className={`border-l-4 p-4 ${styles[type]}`}>
      {message}
    </div>
  )
}
```

## Component Library

CRAI uses [shadcn/ui](https://ui.shadcn.com/) components:

- Buttons
- Forms
- Cards
- Dialogs
- Tooltips

## Next Steps

- Learn about [Routing](/frontend/routing/)
- Check [State Management](/frontend/state-management/)
- Review [Styling Guide](/frontend/styling/)
