---
title: Troubleshooting
description: Common issues and solutions
---

Common problems and their solutions when working with CRAI.

## Installation Issues

### Python Version Error

**Problem:**
```bash
ERROR: This package requires Python >=3.11
```

**Solution:**
```bash
# Check Python version
python --version

# Install Python 3.11+ from python.org
# Or use pyenv
pyenv install 3.11
pyenv global 3.11
```

### Dependency Conflicts

**Problem:**
```bash
ERROR: Cannot install requirements (conflicting dependencies)
```

**Solution:**
```bash
# Create fresh virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Node Modules Error

**Problem:**
```bash
npm ERR! peer dependencies conflict
```

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

## Runtime Errors

### Import Error: pydantic_settings

**Problem:**
```python
ImportError: cannot import name 'BaseSettings' from 'pydantic'
```

**Solution:**
```bash
# Install pydantic-settings
pip install pydantic-settings

# Update imports
from pydantic_settings import BaseSettings  # Not from pydantic
```

### Port Already in Use

**Problem:**
```bash
OSError: [Errno 48] Address already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Or use different port
uvicorn api.main:app --port 8001
```

### CORS Error

**Problem:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**

**Backend:** `api/main.py`
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables Not Loading

**Problem:**
```python
KeyError: 'SECRET_KEY'
```

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Check file content
cat .env

# Verify loading in Python
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('SECRET_KEY'))"

# Add default values
SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')
```

## Docker Issues

### Container Won't Start

**Problem:**
```bash
Error response from daemon: Container is not running
```

**Solution:**
```bash
# Check logs
docker-compose logs ai

# Rebuild image
docker-compose build --no-cache ai

# Check Dockerfile syntax
docker build -t test-build ./ai
```

### Volume Permission Error

**Problem:**
```bash
PermissionError: [Errno 13] Permission denied
```

**Solution:**
```dockerfile
# Add user in Dockerfile
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser
```

### Network Error

**Problem:**
```bash
ERROR: Network crai_default declared as external, but could not be found
```

**Solution:**
```bash
# Remove external declaration
# docker-compose.yml
networks:
  default:
    driver: bridge

# Or create network
docker network create crai_default
```

## Testing Issues

### Tests Failing

**Problem:**
```bash
FAILED tests/test_main.py::test_hello - AssertionError
```

**Solution:**
```bash
# Run with verbose output
pytest -vv

# Run specific test
pytest tests/test_main.py::test_hello -vv

# Check for fixture issues
pytest --fixtures

# Clear cache
pytest --cache-clear
```

### Coverage Not 100%

**Problem:**
```bash
TOTAL    18     2    89%
```

**Solution:**
```bash
# See missing lines
pytest --cov=api --cov-report=term-missing

# Add tests for uncovered lines
# Check report
open htmlcov/index.html
```

### Import Errors in Tests

**Problem:**
```python
ModuleNotFoundError: No module named 'api'
```

**Solution:**
```bash
# Add __init__.py files
touch tests/__init__.py
touch tests/api/__init__.py

# Or install in editable mode
pip install -e .
```

## Frontend Issues

### Build Errors

**Problem:**
```bash
ERROR: Cannot find module '@/components/ui/button'
```

**Solution:**

**Check:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Vite HMR Not Working

**Problem:**
Hot reload not working in development

**Solution:**

**vite.config.ts:**
```typescript
export default defineConfig({
  server: {
    host: true,
    watch: {
      usePolling: true  // For Docker
    }
  }
})
```

### TypeScript Errors

**Problem:**
```
Cannot find name 'process'
```

**Solution:**
```bash
# Install types
npm install --save-dev @types/node

# Update tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "node"]
  }
}
```

## CI/CD Issues

### GitHub Actions Failing

**Problem:**
Workflow fails on push

**Solution:**
```bash
# Check workflow syntax
cat .github/workflows/ai-backend-tests.yml

# Test locally with act
act push

# Check secrets
# Go to Settings > Secrets and variables > Actions
```

### SonarCloud Error

**Problem:**
```bash
ERROR: Error during SonarScanner execution
```

**Solution:**
```bash
# Check sonar-project.properties
cat sonar-project.properties

# Verify token
# Settings > Secrets > SONAR_TOKEN

# Re-run analysis
sonar-scanner
```

## Performance Issues

### Slow API Response

**Problem:**
API takes too long to respond

**Solution:**
```python
# Add caching
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_operation(param: str) -> str:
    # Cached result
    pass

# Use async/await
async def process_request():
    results = await asyncio.gather(
        fetch_data_1(),
        fetch_data_2()
    )
```

### High Memory Usage

**Problem:**
Container using too much memory

**Solution:**
```yaml
# docker-compose.yml
services:
  ai:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Database Issues (Future)

### Connection Error

**Problem:**
```
OperationalError: could not connect to server
```

**Solution:**
```bash
# Check database is running
docker-compose ps

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

## Getting Help

If you can't find a solution:

1. **Search existing issues** on GitHub
2. **Check documentation** at `/docs`
3. **Create an issue** with:
   - Clear description
   - Steps to reproduce
   - Environment details
   - Error messages
   - What you've tried

### Issue Template

```markdown
**Problem:**
Clear description

**Environment:**
- OS: Windows 11
- Python: 3.11.5
- Node: 20.11.0

**Steps to Reproduce:**
1. Run `docker-compose up`
2. Navigate to http://localhost:8000
3. See error

**Error Message:**
```
Paste error here
```

**What I've Tried:**
- Rebuilt containers
- Checked logs
```

## Next Steps

- Review [Contributing Guide](/guides/contributing/)
- Check [Code Style Guide](/guides/code-style/)
- Visit [Architecture Overview](/architecture/overview/)
