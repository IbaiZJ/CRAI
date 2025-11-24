---
title: Installation
description: Step-by-step guide to install and set up CRAI on your local machine
---

This guide will walk you through installing CRAI and all its dependencies.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required
- **Python 3.11+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 20+**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)

### Optional (but recommended)
- **Docker**: [Download Docker](https://www.docker.com/get-started)
- **Docker Compose**: Usually included with Docker Desktop

## Quick Installation

The fastest way to get started is using Docker:

```bash
# Clone the repository
git clone https://github.com/IbaiZJ/CRAI.git
cd CRAI

# Start all services
docker-compose up -d
```

That's it! The application will be available at:
- Backend API: http://localhost:6902
- Frontend UI: http://localhost:6901
- API Docs: http://localhost:6902/docs
- Documentation: http://localhost:6910
- MySQL: localhost:6900

## Manual Installation

If you prefer to run the application without Docker:

### 1. Clone the Repository

```bash
git clone https://github.com/IbaiZJ/CRAI.git
cd CRAI
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd ai

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. Environment Configuration

Create `.env` files for both backend and frontend:

**Backend (.env in `ai/` directory):**
```bash
API_TITLE="CRAI ANPR API"
API_VERSION="1.0.0"
API_PREFIX="/api"
```

**Frontend (.env in `frontend/` directory):**
```bash
VITE_API_URL=http://localhost:6902
```

### 5. Start the Services

**Terminal 1 - Backend:**
```bash
cd ai
uvicorn api.main:app --reload --host 0.0.0.0 --port 6902
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Verify Installation

### Check Backend

Visit http://localhost:6902/docs to see the interactive API documentation.

Or test with curl:
```bash
curl http://localhost:6902/api/hello
```

Expected response:
```json
{
  "message": "Hello World"
}
```

### Check Frontend

Open http://localhost:5173 in your browser. You should see the CRAI interface.

### Run Tests

To verify everything is working correctly:

```bash
# Backend tests
cd ai
pytest -v

# Expected output: 17 tests passed, 100% coverage
```

## Troubleshooting

### Port Already in Use

If ports 6902 or 5173 are already in use:

**Backend:**
```bash
uvicorn api.main:app --reload --port 8000
```

**Frontend:**
```bash
npm run dev -- --port 3000
```

### Python Version Issues

Check your Python version:
```bash
python --version  # Should be 3.11 or higher
```

If you have multiple Python versions:
```bash
python3.11 -m venv venv
```

### Node.js Version Issues

Check your Node.js version:
```bash
node --version  # Should be 20 or higher
```

Use [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.

### Permission Errors

On Linux/macOS, you might need sudo for global installations:
```bash
sudo npm install -g npm@latest
```

### Docker Issues

If Docker commands fail:
```bash
# Check Docker is running
docker --version
docker-compose --version

# On Linux, you might need to add your user to docker group
sudo usermod -aG docker $USER
```

## Next Steps

Now that you have CRAI installed, check out:
- [Quick Start Guide](/getting-started/quick-start/) to build your first plate recognition
- [Configuration](/getting-started/configuration/) to customize the application
- [Architecture Overview](/architecture/overview/) to understand how CRAI works

## Getting Help

If you encounter any issues:
1. Check the [Troubleshooting Guide](/guides/troubleshooting/)
2. Search [GitHub Issues](https://github.com/IbaiZJ/CRAI/issues)
3. Open a new issue with details about your problem
