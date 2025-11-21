---
title: Code Style Guide
description: Coding standards for CRAI
---

Consistent code style guidelines for the CRAI project.

## Python (Backend)

### General Guidelines

- Follow [PEP 8](https://pep8.org/)
- Use [Black](https://black.readthedocs.io/) for formatting
- Maximum line length: 88 characters
- Use type hints
- Write docstrings

### Formatting with Black

```bash
# Install
pip install black

# Format all files
black .

# Check without modifying
black --check .

# Format specific file
black api/main.py
```

### Type Hints

```python
from typing import Optional, List, Dict

def get_user(user_id: int) -> Optional[Dict[str, str]]:
    """Get user by ID"""
    pass

def process_items(items: List[str]) -> Dict[str, int]:
    """Process list of items"""
    return {item: len(item) for item in items}
```

### Docstrings

Use Google-style docstrings:

```python
def calculate_total(
    items: List[float], 
    tax_rate: float = 0.1
) -> float:
    """
    Calculate total price including tax.
    
    Args:
        items: List of item prices
        tax_rate: Tax rate as decimal (default: 0.1)
        
    Returns:
        float: Total price with tax applied
        
    Raises:
        ValueError: If tax_rate is negative
        
    Example:
        >>> calculate_total([10.0, 20.0], 0.1)
        33.0
    """
    if tax_rate < 0:
        raise ValueError("Tax rate cannot be negative")
    
    subtotal = sum(items)
    return subtotal * (1 + tax_rate)
```

### Imports

```python
# Standard library
import os
import sys
from typing import Optional

# Third-party
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Local
from api.core.config import settings
from api.models.plate import PlateResponse
```

### Naming Conventions

```python
# Variables and functions: snake_case
user_name = "John"
def get_user_data():
    pass

# Classes: PascalCase
class UserModel:
    pass

# Constants: UPPER_CASE
MAX_RETRY_COUNT = 3
API_VERSION = "v1"

# Private: _leading_underscore
def _internal_function():
    pass
```

### FastAPI Best Practices

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

class PlateRequest(BaseModel):
    """Request model for plate detection"""
    image_url: str
    confidence: float = 0.75

@app.post(
    "/api/detect",
    response_model=PlateResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect license plates",
    tags=["detection"]
)
async def detect_plates(request: PlateRequest):
    """
    Detect license plates in the provided image.
    
    Args:
        request: Detection request with image URL and confidence
        
    Returns:
        PlateResponse: Detected plates with coordinates
    """
    try:
        result = await process_image(request.image_url)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
```

## TypeScript (Frontend)

### General Guidelines

- Use TypeScript strict mode
- Follow Airbnb style guide
- Use ESLint and Prettier
- Prefer functional components
- Use meaningful names

### ESLint Configuration

**File:** `frontend/eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

### Prettier Configuration

**File:** `frontend/.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

### Type Definitions

```typescript
// Interfaces for objects
interface User {
  id: number
  name: string
  email: string
}

// Types for unions/intersections
type Status = 'idle' | 'loading' | 'success' | 'error'

// Generic types
interface ApiResponse<T> {
  data: T
  message: string
  status: number
}
```

### React Components

```typescript
import { FC, useState } from 'react'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

/**
 * Button component with multiple variants
 */
export const Button: FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  )
}
```

### Hooks

```typescript
import { useState, useEffect } from 'react'

/**
 * Custom hook for fetching data
 */
export function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}
```

### Naming Conventions

```typescript
// Components: PascalCase
const UserProfile = () => {}

// Functions: camelCase
const getUserData = () => {}

// Constants: UPPER_CASE
const MAX_ITEMS = 100
const API_URL = 'http://localhost:8000'

// Interfaces/Types: PascalCase
interface UserData {}
type StatusType = 'active' | 'inactive'

// Private: _leading_underscore (or use closure)
const _internalHelper = () => {}
```

## Git Practices

### Branch Naming

```bash
feature/add-user-authentication
fix/resolve-login-bug
docs/update-api-documentation
refactor/improve-error-handling
test/add-integration-tests
```

### Commit Messages

```bash
# Good
feat(api): add plate detection endpoint
fix(ui): resolve button alignment on mobile
docs(readme): update installation steps

# Bad
fixed stuff
updated files
changes
```

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Types are properly defined
- [ ] Functions have docstrings/comments
- [ ] No console.log or debug prints
- [ ] Error handling implemented
- [ ] Tests added/updated
- [ ] No hardcoded values
- [ ] Secure coding practices

## Tools

### Python

```bash
# Black (formatter)
pip install black
black .

# isort (import sorting)
pip install isort
isort .

# mypy (type checking)
pip install mypy
mypy api/

# pylint (linting)
pip install pylint
pylint api/
```

### TypeScript

```bash
# ESLint
npm run lint

# Prettier
npm run format

# Type checking
npm run type-check
```

## VS Code Settings

**File:** `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

## Next Steps

- Review [Contributing Guide](/guides/contributing/)
- Check [Troubleshooting](/guides/troubleshooting/)
