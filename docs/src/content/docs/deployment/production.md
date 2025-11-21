---
title: Production Deployment
description: Deploy CRAI to production
---

Guide to deploying CRAI to production environments.

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt recommended)
- Minimum 2GB RAM, 2 CPU cores

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/IbaiZJ/CRAI.git
cd CRAI

# Set environment variables
cp .env.example .env
nano .env

# Build and start services
docker-compose up -d

# Check status
docker-compose ps
```

### Option 2: Manual Deployment

#### Backend

```bash
cd ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn api.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or any static server
npx serve -s dist -p 5173
```

## Environment Variables

**Backend (.env):**
```bash
# Server
APP_NAME=CRAI
API_VERSION=0.1.0
DEBUG=False

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=https://yourdomain.com

# Database (if applicable)
DATABASE_URL=postgresql://user:pass@localhost/crai
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.yourdomain.com
```

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Backend
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
    }
}
```

## SSL Configuration

### Using Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/hello

# Expected response
{"message":"Hello World"}
```

## Monitoring

### Docker Logs

```bash
# View all logs
docker-compose logs -f

# Backend only
docker-compose logs -f ai

# Frontend only
docker-compose logs -f frontend
```

### System Resources

```bash
# Docker stats
docker stats

# Disk usage
docker system df
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  ai:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Load Balancer

Use nginx or HAProxy to distribute traffic across multiple backend instances.

## Backup Strategy

1. **Code**: Git repository
2. **Data**: Regular database backups
3. **Configuration**: Environment files in secure location

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs ai

# Rebuild image
docker-compose build --no-cache ai
docker-compose up -d
```

### Port Already in Use

```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>
```

## Next Steps

- Review [Docker Configuration](/deployment/docker/)
- Check [Environment Variables](/deployment/environment/)
- Read [Troubleshooting Guide](/guides/troubleshooting/)
