---
title: Installation
description: Step-by-step guide to install and set up CRAI on your local machine
---

This guide will walk you through installing CRAI and all its dependencies.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required
- **Docker**: [Download Docker](https://www.docker.com/get-started)
- **Docker Compose**: Usually included with Docker Desktop
- **Git**: [Download Git](https://git-scm.com/)

### Optional (for local development)
- **Python 3.11+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 20+**: [Download Node.js](https://nodejs.org/)
- **Java 17+**: [Download OpenJDK](https://adoptium.net/)
- **Maven**: [Download Maven](https://maven.apache.org/)

## Quick Installation (Docker)

The fastest way to get started is using Docker:

```bash
# Clone the repository
git clone https://github.com/IbaiZJ/CRAI.git
cd CRAI

# Start all services
docker-compose up -d
```

That's it! The application will be available at:

| Service | URL | Description |
|---------|-----|-------------|
| MySQL | localhost:6900 | Database |
| Frontend | http://localhost:6901 | React dashboard |
| AI Service | http://localhost:6902 | ANPR processing |
| Node-RED | http://localhost:6903 | Workflow automation |
| ebAPI | http://localhost:6904 | Environmental badge API |
| itvAPI | http://localhost:6905 | ITV date API |
| OS Service | http://localhost:6906 | Simulation service |
| Documentation | http://localhost:6910 | Project docs |

## Manual Installation

If you prefer to run services without Docker for development:

### 1. Clone the Repository

```bash
git clone https://github.com/IbaiZJ/CRAI.git
cd CRAI
```

### 2. Database Setup

Start MySQL with Docker (or use local MySQL):

```bash
docker-compose up -d mysql
```

Or create a local MySQL database:

```sql
CREATE DATABASE crai;
CREATE USER 'crai_user'@'localhost' IDENTIFIED BY 'crai_pass';
GRANT ALL PRIVILEGES ON crai.* TO 'crai_user'@'localhost';
```

### 3. AI Service Setup

```bash
cd ai

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python src/main.py
```

### 4. ebAPI Service Setup

```bash
cd ebAPI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. itvAPI Service Setup

```bash
cd itvAPI

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 6. OS Service Setup (Spring Boot)

```bash
cd os

# Build with Maven
./mvnw clean package -DskipTests

# Run the service
java -jar target/os-0.0.1-SNAPSHOT.jar
```

### 7. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings
# VITE_API_URL=http://localhost:6903
# VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Run the development server
npm run dev
```

### 8. Node-RED Setup

```bash
# Using Docker (recommended)
docker-compose up -d node-red

# Or install globally
npm install -g node-red
node-red
```

## Environment Configuration

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:6903
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### AI Service (config/config.yaml)

The AI service is configured via YAML:

```yaml
camera:
  source: 1
  resolution:
    width: 1280
    height: 720

api:
  endpoint_base_url: "http://localhost:6903"
  car_plate_endpoint: "/ai/carPlate"
```

## Verify Installation

### Check Running Containers

```bash
docker-compose ps
```

Expected output:
```
NAME        STATUS          PORTS
ai          Up              0.0.0.0:6902->8000/tcp
backend     Up              0.0.0.0:6903->1880/tcp
docs        Up              0.0.0.0:6910->4321/tcp
ebAPI       Up              0.0.0.0:6904->8000/tcp
frontend    Up              0.0.0.0:6901->5173/tcp
itvAPI      Up              0.0.0.0:6905->8000/tcp
mysql       Up              0.0.0.0:6900->3306/tcp
os          Up              0.0.0.0:6906->8080/tcp
```

### Test API Endpoints

```bash
# Test ebAPI
curl "http://localhost:6904/api?carPlate=1234ABC"

# Test itvAPI
curl "http://localhost:6905/api?carPlate=1234ABC"

# Access Node-RED
open http://localhost:6903

# Access Frontend
open http://localhost:6901
```

## Troubleshooting

### Docker Issues

```bash
# View logs
docker-compose logs -f

# Restart all services
docker-compose restart

# Rebuild containers
docker-compose up -d --build
```

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
# Windows:
netstat -ano | findstr :6901
# Linux/Mac:
lsof -i :6901

# Or change ports in docker-compose.yml
```

### Database Connection

```bash
# Connect to MySQL
docker-compose exec mysql mysql -u root -p
# Password: root
```

## Next Steps

- Follow the [Quick Start Guide](/getting-started/quick-start/)
- Configure services in [Configuration](/getting-started/configuration/)
- Learn about [Architecture](/architecture/overview/)

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
