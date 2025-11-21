---
title: Docker Configuration
description: Docker and Docker Compose setup
---

Complete Docker configuration for CRAI.

## Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  ai:
    build:
      context: ./ai
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./ai:/app
      - /app/__pycache__
    environment:
      - PYTHONUNBUFFERED=1
    command: uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev
```

## Backend Dockerfile

**File:** `ai/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "api.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
```

## Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application
COPY . .

# Expose port
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev", "--", "--host"]
```

### Production Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Docker Commands

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build ai

# Build without cache
docker-compose build --no-cache
```

### Start Services

```bash
# Start in foreground
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up ai
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop ai
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai

# Last 100 lines
docker-compose logs --tail=100 ai
```

### Execute Commands

```bash
# Backend shell
docker-compose exec ai bash

# Frontend shell
docker-compose exec frontend sh

# Run pytest
docker-compose exec ai pytest

# Install npm package
docker-compose exec frontend npm install axios
```

## Volumes

### Development Volumes

```yaml
volumes:
  - ./ai:/app              # Source code
  - /app/__pycache__       # Exclude cache
```

### Production Volumes

```yaml
volumes:
  - ai-data:/app/data      # Persistent data
  - ai-logs:/app/logs      # Log files
```

## Networks

```yaml
networks:
  crai-network:
    driver: bridge

services:
  ai:
    networks:
      - crai-network
  
  frontend:
    networks:
      - crai-network
```

## Docker Ignore

**File:** `.dockerignore`

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/

# Node
node_modules/
npm-debug.log*

# Git
.git
.gitignore

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Tests
htmlcov/
.coverage
.pytest_cache/
```

## Multi-Stage Builds

```dockerfile
# Backend with multi-stage
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS development
COPY . .
CMD ["uvicorn", "api.main:app", "--reload"]

FROM base AS production
COPY . .
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
CMD ["gunicorn", "api.main:app"]
```

## Health Checks

```yaml
services:
  ai:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/hello"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Resource Limits

```yaml
services:
  ai:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Next Steps

- Review [Production Deployment](/deployment/production/)
- Check [Environment Variables](/deployment/environment/)
