---
title: Configuration
description: Configure CRAI for your specific needs
---

Learn how to configure CRAI's backend and frontend components.

## Environment Variables

CRAI uses environment variables for configuration. Create `.env` files in the appropriate directories.

### Backend Configuration

Create `ai/.env`:

```bash
# API Configuration
API_TITLE="CRAI ANPR API"
API_VERSION="1.0.0"
API_PREFIX="/api"
API_TAGS=["ANPR"]

# Server Configuration
HOST="0.0.0.0"
PORT=6902
RELOAD=true

# CORS Configuration
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Database (if using)
# DATABASE_URL="postgresql://user:password@localhost:5432/crai"

# AI Model Configuration
# MODEL_PATH="./data/models/plate_detector.h5"
# CONFIDENCE_THRESHOLD=0.8

# Logging
LOG_LEVEL="INFO"
```

### Frontend Configuration

Create `frontend/.env`:

```bash
# API URL
VITE_API_URL=http://localhost:6902

# Application Configuration
VITE_APP_TITLE="CRAI - License Plate Recognition"
VITE_APP_VERSION="1.0.0"

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## Python Configuration

### Settings Class

The backend uses Pydantic Settings for type-safe configuration.

**File:** `ai/api/core/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_TITLE: str = "CRAI ANPR API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    API_TAGS: list = ["ANPR"]
    
    HOST: str = "0.0.0.0"
    PORT: int = 6902
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### Using Settings

```python
from api.core.config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)
```

## Docker Configuration

### Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./ai
      dockerfile: Dockerfile
    ports:
      - "6902:6902"
    environment:
      - API_TITLE=CRAI ANPR API
      - API_VERSION=1.0.0
      - API_PREFIX=/api
    volumes:
      - ./ai:/app
    restart: unless-stopped
    
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:6902
    volumes:
      - ./frontend:/app
      - /app/node_modules
    restart: unless-stopped
    depends_on:
      - backend
```

### Backend Dockerfile

**File:** `ai/Dockerfile`

```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 6902

# Run application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "6902", "--reload"]
```

### Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev", "--", "--host"]
```

## FastAPI Configuration

### CORS Setup

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Logging Configuration

```python
import logging
from api.core.config import settings

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

## Vite Configuration

**File:** `frontend/vite.config.ts`

```typescript
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
})
```

## TypeScript Configuration

**File:** `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## TailwindCSS Configuration

**File:** `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#6B7280',
          foreground: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}
```

## Testing Configuration

### pytest Configuration

**File:** `ai/pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

addopts = 
    -v
    --strict-markers
    --tb=short
    --cov=api
    --cov-report=term-missing
    --cov-report=html

markers =
    slow: tests that take a long time
    integration: integration tests
    unit: unit tests
    api: API tests
```

## Production Configuration

### Production Environment Variables

```bash
# Backend Production
API_TITLE="CRAI ANPR API"
API_VERSION="1.0.0"
API_PREFIX="/api"
HOST="0.0.0.0"
PORT=6902
RELOAD=false
LOG_LEVEL="WARNING"
CORS_ORIGINS=["https://your-domain.com"]

# Frontend Production
VITE_API_URL=https://api.your-domain.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Production Docker Compose

```yaml
version: '3.8'

services:
  backend:
    image: crai-backend:latest
    ports:
      - "6902:6902"
    environment:
      - RELOAD=false
      - LOG_LEVEL=WARNING
    restart: always
    
  frontend:
    image: crai-frontend:latest
    ports:
      - "80:80"
    restart: always
    depends_on:
      - backend
```

## Security Configuration

### API Keys (if using)

```python
from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/endpoint")
@limiter.limit("5/minute")
async def limited_endpoint():
    return {"message": "Rate limited"}
```

## Next Steps

- Learn about the [Architecture](/architecture/overview/)
- Explore [API Endpoints](/api/endpoints/)
- Set up [Testing](/testing/overview/)
- Prepare for [Deployment](/deployment/production/)
