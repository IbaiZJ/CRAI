---
title: Docker Setup
description: Docker and Docker Compose configuration for CRAI
---

CRAI is fully containerized using Docker Compose, orchestrating 5 microservices that work together to provide ANPR, badge lookup, automation, and documentation.

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Docker Compose (app-network)                   │
├──────────────┬──────────────┬─────────────┬──────────┬─────────┤
│   Frontend   │  AI Service  │  Node-RED   │  ebAPI   │  Docs   │
│   Container  │   Container  │  Container  │ Container│Container│
│              │              │             │          │         │
│   Node:20    │ Python:3.13  │ Node-RED    │Python:   │Node:20  │
│   Alpine     │      +       │   Latest    │3.11-slim │Alpine   │
│              │   OpenCV     │             │          │         │
│   Vite Dev   │   FastAPI    │  Workflows  │ FastAPI  │ Astro   │
│   Port 6901  │   Port 6902  │  Port 6903  │Port 6904 │Port 6910│
└──────────────┴──────────────┴─────────────┴──────────┴─────────┘
```

## Current docker-compose.yml

```yaml
services:
  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend_app
    ports:
      - "6901:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - node-red
    networks:
      - app-network

  # AI service (ANPR)
  ai:
    build:
      context: ./ai
      dockerfile: Dockerfile
    container_name: ai_service
    volumes:
      - ./ai:/app
    ports:
      - "6902:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - ENV=local
    networks:
      - app-network
    restart: unless-stopped

  # Node-RED service (Automation)
  node-red:
    image: nodered/node-red:latest
    container_name: node_red_service
    ports:
      - "6903:1880"
    volumes:
      - ./backend/node_red_data:/data
    environment:
      - TZ=Europe/Madrid
    depends_on:
      - ebapi
    networks:
      - app-network
    restart: unless-stopped

  # Environmental Badge API service
  ebapi:
    build:
      context: ./ebAPI
      dockerfile: Dockerfile
    container_name: ebapi_service
    ports:
      - "6904:8000"
    volumes:
      - ./ebAPI:/app
    environment:
      - PYTHONUNBUFFERED=1
    networks:
      - app-network
    restart: unless-stopped

  # Documentation service
  docs:
    build:
      context: ./docs
      dockerfile: Dockerfile
    container_name: docs_service
    ports:
      - "6910:4321"
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

## Service Dockerfiles

### 1. Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
# Use Node 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (Vite dev server)
EXPOSE 5173

# Run development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

**Key Features:**
- Alpine Linux for small image size (~300MB)
- Hot module replacement enabled with bind mount
- Vite dev server accessible from host

### 2. AI Service Dockerfile

**File:** `ai/Dockerfile`

```dockerfile
# Use Python 3.13 base image
FROM python:3.13

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    tesseract-ocr \
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
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Key Features:**
- Full Python image for OpenCV compatibility (~800MB)
- Tesseract OCR for character recognition
- Auto-reload enabled for development
- System libraries for image processing

### 3. ebAPI Service Dockerfile

**File:** `ebAPI/Dockerfile`

```dockerfile
# Use Python 3.11-slim for smaller image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install uvicorn with standard extras
RUN pip install "uvicorn[standard]"

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Key Features:**
- Slim image for reduced size (~200MB)
- No OpenCV dependencies needed
- Fast startup time
- Auto-extracts dataset on first run

### 4. Node-RED (Official Image)

**Image:** `nodered/node-red:latest`

No custom Dockerfile needed - using official image.

**Configuration:**
- Persistent flows via bind mount
- Timezone set to Europe/Madrid
- HTTP nodes enabled for API integration

### 5. Documentation Dockerfile

**File:** `docs/Dockerfile`

```dockerfile
# Use Node 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 4321

# Run Astro dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

**Key Features:**
- Alpine Linux for small size
- Astro + Starlight documentation framework
- Hot reload for documentation changes

## Volumes and Persistence

### Bind Mounts (Development)

Bind mounts enable hot-reloading during development:

```yaml
volumes:
  # Frontend - enables HMR
  - ./frontend:/app
  - /app/node_modules        # Anonymous volume for node_modules

  # AI Service - Python hot reload
  - ./ai:/app

  # ebAPI Service - FastAPI hot reload
  - ./ebAPI:/app

  # Node-RED - persistent flows
  - ./backend/node_red_data:/data
```

### Node-RED Persistent Storage

**Critical:** Node-RED flows are persisted via bind mount to `./backend/node_red_data/`.

```
backend/node_red_data/
├── flows.json              # Node-RED flows (auto-saved)
├── flows_cred.json        # Encrypted credentials
├── settings.js            # Node-RED settings
└── package.json           # Installed Node-RED packages
```

**Important:** This directory is created automatically on first run. Flows are saved when you click "Deploy" in Node-RED UI.

### Anonymous Volumes

Prevent host `node_modules` from overwriting container dependencies:

```yaml
volumes:
  - /app/node_modules        # Frontend
  - /app/__pycache__         # Python cache (optional)
```

## Network Configuration

### app-network (Bridge Driver)

All services communicate via Docker's bridge network:

```yaml
networks:
  app-network:
    driver: bridge
```

**Service Discovery:**
- Services can reference each other by container name
- Example: `http://ai_service:8000`, `http://ebapi_service:8000`
- DNS resolution handled by Docker

**Inter-Service Communication:**
```bash
# From frontend container
curl http://ai_service:8000/api/health

# From Node-RED
http://ebapi_service:8000/api?carPlate=1234ABC
```

## Environment Variables

### Frontend Service
```yaml
environment:
  - VITE_API_URL=http://localhost:6902
  - VITE_EBAPI_URL=http://localhost:6904
```

### AI Service
```yaml
environment:
  - PYTHONUNBUFFERED=1       # Disable Python output buffering
  - ENV=local                # Environment flag
  - API_TITLE=CRAI ANPR API
  - API_VERSION=1.0.0
```

### ebAPI Service
```yaml
environment:
  - PYTHONUNBUFFERED=1       # Real-time logging
  - API_TITLE=Environmental Badge API
  - API_VERSION=1.0.0
```

### Node-RED Service
```yaml
environment:
  - TZ=Europe/Madrid         # Timezone for logs
```

## Docker Commands

### Start Services

```bash
# Build and start all services
docker-compose up -d

# Build with no cache (force rebuild)
docker-compose build --no-cache

# Start specific service
docker-compose up -d frontend
docker-compose up -d ai
docker-compose up -d ebapi
docker-compose up -d node-red

# View startup logs
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# Stop specific service
docker-compose stop frontend
```

### View Logs

```bash
# View all logs (follow mode)
docker-compose logs -f

# View specific service logs
docker-compose logs -f ai
docker-compose logs -f ebapi
docker-compose logs -f node-red

# Last 100 lines
docker-compose logs --tail=100 ai

# View logs since timestamp
docker-compose logs --since 2024-01-01T00:00:00
```

### Execute Commands

```bash
# AI Service - Run tests
docker-compose exec ai pytest -v

# AI Service - Shell access
docker-compose exec ai bash

# ebAPI Service - Run dataset optimization
docker-compose exec ebapi python util/optimize_dataset.py

# ebAPI Service - Check Python version
docker-compose exec ebapi python --version

# Frontend - Install new package
docker-compose exec frontend npm install <package>

# Frontend - Run tests
docker-compose exec frontend npm run test

# Node-RED - Access container shell
docker-compose exec node-red sh
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose build frontend
docker-compose build ai
docker-compose build ebapi

# Rebuild and restart
docker-compose up -d --build

# Force recreate containers
docker-compose up -d --force-recreate
```

### Check Service Status

```bash
# List running containers
docker-compose ps

# View container resource usage
docker stats

# Inspect service details
docker-compose config

# Check service health
docker inspect ebapi_service | grep -i health
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

## Port Mapping Reference

| Service | Container Port | Host Port | Access URL |
|---------|----------------|-----------|------------|
| Frontend | 5173 (Vite) | 6901 | http://localhost:6901 |
| AI | 8000 (uvicorn) | 6902 | http://localhost:6902 |
| Node-RED | 1880 | 6903 | http://localhost:6903 |
| ebAPI | 8000 (uvicorn) | 6904 | http://localhost:6904 |
| Docs | 4321 (Astro) | 6910 | http://localhost:6910 |

## Service Dependencies

```
Dependency Chain:
  ebapi (starts first - no dependencies)
    ↓
  node-red (depends on ebapi)
    ↓
  frontend (depends on node-red)

Independent:
  ai (no dependencies)
  docs (no dependencies)
```

This ensures services start in the correct order.

## Troubleshooting

### Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :6901
netstat -ano | findstr :6902
netstat -ano | findstr :6904

# Kill process by PID
taskkill /PID <pid> /F

# Or change port in docker-compose.yml:
ports:
  - "6911:5173"  # Use different host port
```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs ai
docker-compose logs ebapi

# Check container status
docker ps -a

# Restart specific container
docker-compose restart ai

# Rebuild and restart
docker-compose up -d --build ai
```

### ebAPI Dataset Issues

```bash
# Check if dataset extracted
docker-compose exec ebapi ls -lh data/

# Manually extract dataset
docker-compose exec ebapi python -c "import py7zr; py7zr.SevenZipFile('data/environmentalBadge.7z').extractall('data/')"

# Verify dataset size (should be ~592MB)
docker-compose exec ebapi du -h data/environmentalBadge.txt

# Check extraction logs
docker-compose logs ebapi | grep -i extract
```

### Node-RED Flows Not Persisting

```bash
# Check bind mount exists
ls backend/node_red_data/

# Verify volume mount
docker-compose exec node-red ls -la /data/

# Check flow file
docker-compose exec node-red cat /data/flows.json

# Restart Node-RED to reload flows
docker-compose restart node-red
```

### Frontend Hot Reload Not Working

```bash
# Verify bind mount
docker-compose exec frontend ls -la /app/src

# Check Vite config has --host flag
docker-compose exec frontend cat vite.config.ts

# Restart with rebuild
docker-compose up -d --build frontend

# Check Vite dev server
docker-compose logs frontend | grep -i vite
```

### AI Service OpenCV Errors

```bash
# Check system dependencies installed
docker-compose exec ai apt list --installed | grep -E 'libgl|libglib'

# Verify Python packages
docker-compose exec ai pip list | grep -i opencv

# Check Python version
docker-compose exec ai python --version

# Rebuild with --no-cache
docker-compose build --no-cache ai
```

### Network Communication Issues

```bash
# Test service-to-service communication
docker-compose exec frontend curl http://ai_service:8000/api/health
docker-compose exec frontend curl http://ebapi_service:8000/api?carPlate=1234ABC

# Check network configuration
docker network inspect crai_app-network

# Verify all services on same network
docker network inspect crai_app-network | grep -i name
```

### Volume Issues

```bash
# Remove all volumes (CAUTION: deletes data)
docker-compose down -v

# Prune unused volumes
docker volume prune

# List all volumes
docker volume ls

# Inspect specific volume
docker volume inspect crai_mysql_data
```

### Clean Rebuild (Nuclear Option)

```bash
# Stop and remove everything
docker-compose down -v

# Remove dangling images
docker image prune -a

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Verify all services running
docker-compose ps
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Limit container resources (add to service):
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G

# Check disk space
docker system df

# Clean up unused resources
docker system prune -a
```

## Best Practices

### 1. Use .dockerignore

**Frontend:**
```
node_modules
dist
.env
.env.local
coverage
.vite
*.log
```

**Backend (AI/ebAPI):**
```
__pycache__
*.pyc
*.pyo
.pytest_cache
.coverage
htmlcov
venv
.env
*.log
data/environmentalBadge.txt  # Large file, extract from .7z
```

### 2. Layer Caching

Order Dockerfile instructions from least to most frequently changing:

```dockerfile
# Good: Copy requirements first
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Bad: Copy everything first (breaks cache)
COPY . .
RUN pip install -r requirements.txt
```

### 3. Security Best Practices

```dockerfile
# Use specific versions, not :latest
FROM python:3.11-slim

# Create non-root user (production)
RUN useradd -m -u 1000 appuser
USER appuser

# Don't expose secrets in ENV
# Use Docker secrets or .env files instead
```

### 4. Resource Limits (Production)

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### 5. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1
```

### 6. Logging

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Development vs Production

### Development Configuration

- Bind mounts for hot reload
- `--reload` flag for FastAPI
- Development dependencies installed
- Debug logging enabled
- No resource limits

### Production Configuration

- No bind mounts (use COPY in Dockerfile)
- Multi-worker uvicorn (e.g., 4 workers)
- Production-only dependencies
- Warning/Error logging only
- Resource limits enforced
- Health checks enabled
- Restart policies: `unless-stopped` or `always`

## Quick Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild service
docker-compose build <service>

# View logs
docker-compose logs -f <service>

# Execute command
docker-compose exec <service> <command>

# Check status
docker-compose ps

# Clean rebuild
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d
```

## Service URLs Summary

| Service | URL | Documentation |
|---------|-----|---------------|
| Frontend | http://localhost:6901 | - |
| AI API | http://localhost:6902 | http://localhost:6902/docs |
| Node-RED | http://localhost:6903 | Built-in UI |
| ebAPI | http://localhost:6904 | http://localhost:6904/docs |
| Documentation | http://localhost:6910 | This site |

## Next Steps

- Review [Architecture Overview](/architecture/overview/) for service communication
- Set up [Dataset Management](/guides/dataset-management/) for ebAPI
- Configure [Production Deployment](/deployment/production/)
- Learn about [Environment Variables](/deployment/environment/)
- Explore [API Documentation](/api/overview/) for endpoints
- Check [Troubleshooting Guide](/guides/troubleshooting/) for common issues
