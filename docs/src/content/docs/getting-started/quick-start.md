---
title: Quick Start
description: Get up and running with CRAI in 5 minutes
---

This guide will help you get CRAI up and running quickly and perform your first plate recognition.

## Prerequisites

Make sure you've completed the [Installation Guide](/getting-started/installation/) first.

## Starting the Application

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Manual Start

**Terminal 1 - Backend:**
```bash
cd ai
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 6902
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Your First API Request

Let's test the API with a simple request:

### Using curl

```bash
curl http://localhost:6902/api/hello
```

Response:
```json
{
  "message": "Hello World"
}
```

### Using Python

```python
import requests

response = requests.get("http://localhost:6902/api/hello")
print(response.json())
```

### Using JavaScript/Fetch

```javascript
fetch('http://localhost:6902/api/hello')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Explore the API

CRAI provides interactive API documentation powered by Swagger UI:

1. Open http://localhost:6902/docs in your browser
2. You'll see all available endpoints
3. Click "Try it out" on any endpoint to test it directly

### Alternative: ReDoc

For a different documentation style, visit http://localhost:6902/redoc

## Using the Frontend

1. Open http://localhost:5173 in your browser
2. You'll see the CRAI interface
3. Navigate through the available features

## Project Structure Overview

```
CRAI/
├── ai/                     # Backend application
│   ├── api/
│   │   ├── main.py        # FastAPI application entry point
│   │   ├── routers/       # API endpoints
│   │   ├── core/          # Configuration
│   │   ├── models/        # Data models
│   │   └── services/      # Business logic
│   ├── tests/             # Backend tests
│   └── requirements.txt   # Python dependencies
│
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
│   └── package.json       # Node dependencies
│
└── docker-compose.yml     # Docker configuration
```

## Development Workflow

### Making Changes

1. **Backend Changes:**
   - Edit files in `ai/api/`
   - FastAPI auto-reloads (with `--reload` flag)
   - Test your changes at http://localhost:6902

2. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - Vite hot-reloads automatically
   - See changes instantly at http://localhost:5173

### Running Tests

```bash
# Backend tests
cd ai
pytest -v --cov=api

# Expected output:
# 17 passed, 100% coverage
```

### Code Formatting

**Backend (Python):**
```bash
# Install formatters
pip install black isort

# Format code
cd ai
black api/ tests/
isort api/ tests/
```

**Frontend (TypeScript/React):**
```bash
# Format code
cd frontend
npm run lint
```

## Common Tasks

### Add a New API Endpoint

1. Create a new router in `ai/api/routers/`:

```python
# ai/api/routers/my_router.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/my-feature", tags=["My Feature"])

@router.get("/example")
async def my_endpoint():
    return {"status": "success"}
```

2. Register it in `main.py`:

```python
from api.routers import my_router

app.include_router(my_router.router)
```

3. Test at http://localhost:6902/docs

### Add a New React Component

1. Create component in `frontend/src/components/`:

```tsx
// frontend/src/components/MyComponent.tsx
export function MyComponent() {
  return (
    <div className="p-4">
      <h1>My Component</h1>
    </div>
  );
}
```

2. Use it in a page:

```tsx
import { MyComponent } from '../components/MyComponent';

export function MyPage() {
  return <MyComponent />;
}
```

## Stopping the Application

### Docker

```bash
docker-compose down
```

### Manual

Press `Ctrl+C` in each terminal running the services.

## Next Steps

Now that you're up and running:

1. [Configure](/getting-started/configuration/) the application for your needs
2. Learn about the [Architecture](/architecture/overview/)
3. Explore the [API Documentation](/api/overview/)
4. Read about [Testing](/testing/overview/)

## Need Help?

- Check the [Troubleshooting Guide](/guides/troubleshooting/)
- Read the [full documentation](/architecture/overview/)
- Visit [GitHub Issues](https://github.com/IbaiZJ/CRAI/issues)
