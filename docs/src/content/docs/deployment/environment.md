---
title: Environment Variables
description: Configuration with environment variables
---

Complete guide to configuring CRAI with environment variables.

## Backend Environment Variables

### Application Settings

```bash
# Application
APP_NAME=CRAI
API_VERSION=0.1.0
DEBUG=false

# Server
HOST=0.0.0.0
PORT=8000
RELOAD=false
```

### Security

```bash
# Secret keys
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=another-secret-key-for-jwt

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ALLOWED_METHODS=GET,POST,PUT,DELETE
ALLOWED_HEADERS=*
```

### Database (Future)

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/crai
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Redis (Cache)
REDIS_URL=redis://localhost:6379/0
```

### Logging

```bash
# Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
LOG_FILE=/app/logs/app.log
LOG_MAX_SIZE=10485760  # 10MB
LOG_BACKUP_COUNT=5
```

### AI Model Settings

```bash
# Model paths
MODEL_PATH=/app/data/models/plate_detection.pt
CONFIDENCE_THRESHOLD=0.75

# Processing
MAX_IMAGE_SIZE=5242880  # 5MB
ALLOWED_FORMATS=jpg,jpeg,png,webp
```

## Frontend Environment Variables

### API Configuration

```bash
# Backend URL
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000  # 30 seconds
```

### Feature Flags

```bash
# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_API=false
```

### Analytics

```bash
# Google Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Sentry
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## Configuration File

### Backend Settings Class

**File:** `ai/api/core/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    app_name: str = "CRAI"
    api_version: str = "0.1.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Security
    secret_key: str
    allowed_origins: list[str] = ["http://localhost:5173"]
    
    # Model
    model_path: str = "/app/data/models/plate_detection.pt"
    confidence_threshold: float = 0.75
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### Usage

```python
from api.core.config import settings

@app.get("/config")
def get_config():
    return {
        "app_name": settings.app_name,
        "version": settings.api_version,
        "debug": settings.debug
    }
```

## Environment Files

### Development (.env.development)

```bash
# Backend
APP_NAME=CRAI Dev
DEBUG=true
RELOAD=true
LOG_LEVEL=DEBUG

# Frontend
VITE_API_URL=http://localhost:8000
VITE_ENABLE_DEBUG=true
```

### Production (.env.production)

```bash
# Backend
APP_NAME=CRAI
DEBUG=false
RELOAD=false
LOG_LEVEL=INFO
SECRET_KEY=${PRODUCTION_SECRET_KEY}

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_ENABLE_DEBUG=false
```

### Testing (.env.test)

```bash
# Backend
APP_NAME=CRAI Test
DEBUG=true
DATABASE_URL=postgresql://test:test@localhost:5432/crai_test

# Frontend
VITE_API_URL=http://localhost:8000
VITE_ENABLE_MOCK_API=true
```

## Docker Compose Environment

```yaml
services:
  ai:
    environment:
      - APP_NAME=${APP_NAME:-CRAI}
      - DEBUG=${DEBUG:-false}
      - SECRET_KEY=${SECRET_KEY}
    env_file:
      - .env
      - .env.local  # Optional overrides
```

## Loading Environment

### Backend

```python
# Load from .env file
from dotenv import load_dotenv
load_dotenv()

# Or use pydantic-settings (recommended)
from api.core.config import settings
```

### Frontend

```typescript
// Vite automatically loads VITE_* variables
const apiUrl = import.meta.env.VITE_API_URL

// With type safety
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_DEBUG: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Security Best Practices

1. **Never commit `.env` files** to git
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use strong secrets** in production
   ```bash
   # Generate secure random key
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **Validate required variables**
   ```python
   from pydantic import Field
   
   class Settings(BaseSettings):
       secret_key: str = Field(..., min_length=32)  # Required
   ```

4. **Use environment-specific files**
   ```bash
   .env.development  # Dev settings
   .env.production   # Prod settings
   .env.test         # Test settings
   ```

## Troubleshooting

### Variable Not Loading

```bash
# Check if file exists
ls -la .env

# Check file permissions
chmod 644 .env

# Test loading
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('APP_NAME'))"
```

### Type Errors

```python
# Convert types explicitly
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
PORT = int(os.getenv("PORT", "8000"))
```

## Next Steps

- Review [Production Deployment](/deployment/production/)
- Check [Docker Configuration](/deployment/docker/)
- Read [Configuration Guide](/getting-started/configuration/)
