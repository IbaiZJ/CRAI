---
title: Quick Start
description: Get up and running with CRAI in 5 minutes
---

This guide will help you get CRAI up and running quickly and perform your first API requests.

## Prerequisites

Make sure you've completed the [Installation Guide](/getting-started/installation/) first.

## Starting the Application

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

### Manual Start

**Terminal 1 - Database:**
```bash
docker-compose up -d mysql
```

**Terminal 2 - AI Service:**
```bash
cd ai
source venv/bin/activate  # Windows: venv\Scripts\activate
python src/main.py
```

**Terminal 3 - ebAPI:**
```bash
cd ebAPI
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 4 - itvAPI:**
```bash
cd itvAPI
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001
```

**Terminal 5 - Frontend:**
```bash
cd frontend
npm run dev
```

## Your First API Requests

### Test Environmental Badge Lookup

```bash
curl "http://localhost:6904/api?carPlate=1234ABC"
```

Response:
```json
{
  "carPlate": "1234ABC",
  "badge": {
    "vehicleType": "turism",
    "badge": "B",
    "STOL": ""
  }
}
```

### Test ITV Date Lookup

```bash
curl "http://localhost:6905/api?carPlate=1234ABC"
```

Response:
```json
{
  "carPlate": "1234ABC",
  "itv_date": "2025-06-15"
}
```

### Using Python

```python
import requests

# Environmental Badge
badge_response = requests.get(
    "http://localhost:6904/api",
    params={"carPlate": "1234ABC"}
)
print("Badge:", badge_response.json())

# ITV Date
itv_response = requests.get(
    "http://localhost:6905/api",
    params={"carPlate": "1234ABC"}
)
print("ITV:", itv_response.json())
```

### Using JavaScript/Fetch

```javascript
// Environmental Badge
fetch('http://localhost:6904/api?carPlate=1234ABC')
  .then(response => response.json())
  .then(data => console.log('Badge:', data));

// ITV Date
fetch('http://localhost:6905/api?carPlate=1234ABC')
  .then(response => response.json())
  .then(data => console.log('ITV:', data));
```

## Explore the APIs

CRAI provides interactive API documentation powered by Swagger UI:

| Service | Swagger UI | ReDoc |
|---------|------------|-------|
| ebAPI | http://localhost:6904/docs | http://localhost:6904/redoc |
| itvAPI | http://localhost:6905/docs | http://localhost:6905/redoc |

## Access the Frontend

1. Open http://localhost:6901 in your browser
2. You'll see the CRAI landing page
3. Click "Login" to authenticate with Google OAuth
4. Access the dashboard and other features

### Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | / | Landing page |
| Login | /login | Google OAuth login |
| Dashboard | /dashboard | Main dashboard |
| Statistics | /statistics | Data analytics |
| Cameras | /cameras | Camera management |
| Cars | /cars | Vehicle tracking |
| Simulations | /simulations | Simulation control |

## Access Node-RED

1. Open http://localhost:6903 in your browser
2. You'll see the Node-RED flow editor
3. Import flows from `backend/node_red_data/flows.json`
4. Deploy your custom workflows

## Project Structure Overview

```
CRAI/
├── ai/                      # AI ANPR Service (Python)
│   ├── src/
│   │   ├── main.py          # Entry point
│   │   ├── detectors/       # Detection models
│   │   ├── video/           # Video processing
│   │   ├── config/          # Configuration
│   │   └── api/             # API queue
│   └── tests/
├── ebAPI/                   # Environmental Badge API (FastAPI)
│   ├── main.py
│   ├── routers/
│   ├── service/
│   └── data/
├── itvAPI/                  # ITV Date API (FastAPI)
│   ├── main.py
│   ├── routers/
│   └── service/
├── os/                      # Simulation Service (Spring Boot)
│   └── src/main/java/
├── frontend/                # React Dashboard
│   └── src/
│       ├── pages/
│       ├── components/
│       └── routes/
├── backend/                 # Node-RED flows
│   └── node_red_data/
├── db/                      # Database scripts
├── docs/                    # Documentation (Astro)
└── docker-compose.yml
```

## Common Tasks

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai
docker-compose logs -f ebapi
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart ai
```

### Connect to Database

```bash
# Using Docker
docker-compose exec mysql mysql -u root -proot crai

# List tables
SHOW TABLES;
```

### Run Tests

```bash
# AI Service tests
cd ai
pytest -v

# Frontend tests
cd frontend
npm run test
```

## Next Steps

- Configure services in [Configuration](/getting-started/configuration/)
- Learn about [Architecture](/architecture/overview/)
- Explore [API Documentation](/api/overview/)
- Set up [CI/CD Pipeline](/testing/ci-cd/)
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
   - See changes at http://localhost:6901 (Docker) or http://localhost:5173 (manual)

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
