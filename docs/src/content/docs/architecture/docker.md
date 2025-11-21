---
title: Docker Setup
description: Docker and Docker Compose configuration for CRAI
---

CRAI is fully containerized using Docker, making it easy to deploy and run consistently across different environments.

## Docker Architecture

```
┌───────────────────────────────────────────┐
│         Docker Compose Network            │
├──────────────┬────────────────────────────┤
│   Backend    │        Frontend            │
│  Container   │       Container            │
│              │                            │
│  Python:3.13 │      Node:20               │
│  FastAPI     │      React + Vite          │
│  Port: 6902  │      Port: 5173            │
└──────────────┴────────────────────────────┘
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./ai
      dockerfile: Dockerfile
    container_name: crai-backend
    ports:
      - "6902:6902"
    environment:
      - API_TITLE=CRAI ANPR API
      - API_VERSION=1.0.0
      - API_PREFIX=/api
      - PYTHONPATH=/app
    volumes:
      - ./ai:/app
      - /app/__pycache__
    restart: unless-stopped
    command: uvicorn api.main:app --host 0.0.0.0 --port 6902 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: crai-frontend
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
    command: npm run dev -- --host

networks:
  default:
    name: crai-network
```

## Backend Dockerfile

**File:** `ai/Dockerfile`

```dockerfile
# Use Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 6902

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:6902/api/health')" || exit 1

# Run application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "6902"]
```

## Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
# Use Node 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Run development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## Docker Commands

### Start Services

```bash
# Build and start all services
docker-compose up -d

# Build with no cache
docker-compose build --no-cache

# Start specific service
docker-compose up -d backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop frontend
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands

```bash
# Run command in backend
docker-compose exec backend python --version

# Run tests in backend
docker-compose exec backend pytest

# Shell access
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Production Dockerfile

### Backend Production

**File:** `ai/Dockerfile.prod`

```dockerfile
FROM python:3.13-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final stage
FROM python:3.13-slim

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /root/.local /root/.local

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy application
COPY . .

# Set environment
ENV PYTHONPATH=/app \
    PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 6902

# Production command (no reload)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "6902", "--workers", "4"]
```

### Frontend Production

**File:** `frontend/Dockerfile.prod`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**File:** `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://backend:6902;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Production docker-compose.yml

**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  backend:
    image: crai-backend:latest
    build:
      context: ./ai
      dockerfile: Dockerfile.prod
    container_name: crai-backend-prod
    ports:
      - "6902:6902"
    environment:
      - API_TITLE=CRAI ANPR API
      - API_VERSION=1.0.0
      - RELOAD=false
      - LOG_LEVEL=WARNING
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  frontend:
    image: crai-frontend:latest
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: crai-frontend-prod
    ports:
      - "80:80"
    restart: always
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

networks:
  default:
    name: crai-prod-network
```

## Environment Variables

### Development .env

```bash
# Backend
API_TITLE="CRAI ANPR API"
API_VERSION="1.0.0"
API_PREFIX="/api"

# Frontend
VITE_API_URL=http://localhost:6902
```

### Production .env

```bash
# Backend
API_TITLE="CRAI ANPR API"
API_VERSION="1.0.0"
API_PREFIX="/api"
RELOAD=false
LOG_LEVEL="WARNING"

# Frontend
VITE_API_URL=https://api.your-domain.com
```

## Docker Compose Commands

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Rebuild
docker-compose build --no-cache

# Scale services
docker-compose up -d --scale backend=3

# View resource usage
docker stats
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :6902

# Linux/Mac
lsof -i :6902

# Kill process or change port in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a

# Restart container
docker-compose restart backend
```

### Volume Issues

```bash
# Remove volumes
docker-compose down -v

# Prune unused volumes
docker volume prune
```

## Best Practices

1. **Use .dockerignore**
```
node_modules
__pycache__
*.pyc
.git
.env
dist
```

2. **Multi-stage builds** for smaller images
3. **Health checks** for monitoring
4. **Non-root users** for security
5. **Resource limits** to prevent resource exhaustion

## Next Steps

- Configure [Production Deployment](/deployment/production/)
- Set up [Environment Variables](/deployment/environment/)
- Learn about [Monitoring](/guides/troubleshooting/)
