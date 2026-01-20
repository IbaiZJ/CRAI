---
title: Configuration
description: Configure CRAI services for your specific needs
---

Learn how to configure all CRAI services including database, AI, APIs, and frontend.

## Service Ports Overview

| Service | Port | Description |
|---------|------|-------------|
| MySQL | 6900 | Database server |
| Frontend | 6901 | React dashboard |
| AI Service | 6902 | ANPR video processing |
| Node-RED | 6903 | Workflow automation |
| ebAPI | 6904 | Environmental badge API |
| itvAPI | 6905 | ITV date API |
| OS | 6906 | Vehicle simulation |
| Docs | 6910 | Documentation |

## Environment Variables

### Database Configuration

MySQL environment in `docker-compose.yml`:

```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: crai
    MYSQL_USER: crai
    MYSQL_PASSWORD: crai
```

### Frontend Configuration

Create `frontend/.env`:

```bash
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# API URLs
VITE_API_URL=http://localhost:6904
VITE_ITV_API_URL=http://localhost:6905
VITE_OS_API_URL=http://localhost:6906

# Application Configuration
VITE_APP_TITLE="CRAI - Vehicle Recognition System"
VITE_APP_VERSION="2.0.0"
```

### AI Service Configuration

The AI service uses `ai/src/config/config.py`:

```python
# Video Processing
VIDEO_DEVICE = 0  # Camera device ID or video file path
FRAME_SKIP = 2    # Process every Nth frame

# Detection Models
YOLO_MODEL = "yolov8n.pt"
YOLO_CONFIDENCE = 0.5
PLATE_CONFIDENCE = 0.8

# API Endpoints
EB_API_URL = "http://ebapi:8000/api"
ITV_API_URL = "http://itvapi:8001/api"
DB_API_URL = "http://nodered:1880/api/db"

# Processing
MAX_QUEUE_SIZE = 100
OCR_LANG = ["es", "en"]
```

### ebAPI Configuration

The ebAPI uses `ebAPI/conf/settings.py`:

```python
# Server Configuration
HOST = "0.0.0.0"
PORT = 8000

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:6901",
    "http://localhost:5173",
    "http://frontend:5173"
]

# Data Source
DATA_FILE = "data/badges.csv"
```

### itvAPI Configuration

The itvAPI uses `itvAPI/conf/settings.py`:

```python
# Server Configuration
HOST = "0.0.0.0"
PORT = 8001

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:6901",
    "http://localhost:5173",
    "http://frontend:5173"
]

# Data Source
DATA_FILE = "data/itv_dates.csv"
```

### OS (Spring Boot) Configuration

The OS service uses `os/src/main/resources/application.properties`:

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://mysql:3306/crai
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# CORS
app.cors.allowed-origins=http://localhost:6901,http://frontend:5173
```

### Node-RED Configuration

Node-RED settings in `backend/node_red_data/settings.js`:

```javascript
module.exports = {
    uiPort: process.env.PORT || 1880,
    
    // Flow file location
    flowFile: 'flows.json',
    
    // Enable projects
    editorTheme: {
        projects: {
            enabled: false
        }
    },
    
    // Function global context
    functionGlobalContext: {
        // Add global variables here
    }
}
```

## Docker Configuration

### Docker Compose

**File:** `docker-compose.yml`

```yaml
services:
  mysql:
    image: mysql:8
    container_name: mysql
    ports:
      - "6900:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: crai
    volumes:
      - ./db/db_data:/var/lib/mysql
      - ./db/createCraiDB.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: frontend
    ports:
      - "6901:5173"
    depends_on:
      - nodered
    restart: unless-stopped

  ai:
    build: ./ai
    container_name: ai
    ports:
      - "6902:6902"
    depends_on:
      - ebapi
      - itvapi
      - nodered
    restart: unless-stopped

  nodered:
    image: nodered/node-red
    container_name: nodered
    ports:
      - "6903:1880"
    volumes:
      - ./backend/node_red_data:/data
    depends_on:
      - mysql
    restart: unless-stopped

  ebapi:
    build: ./ebAPI
    container_name: ebapi
    ports:
      - "6904:8000"
    restart: unless-stopped

  itvapi:
    build: ./itvAPI
    container_name: itvapi
    ports:
      - "6905:8001"
    restart: unless-stopped

  os:
    build: ./os
    container_name: os
    ports:
      - "6906:8080"
    depends_on:
      - mysql
    restart: unless-stopped

  docs:
    build: ./docs
    container_name: docs
    ports:
      - "6910:4321"
    restart: unless-stopped
```

### AI Service Dockerfile

**File:** `ai/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
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
EXPOSE 6902

# Run application
CMD ["python", "src/main.py"]
```

### FastAPI Dockerfile (ebAPI/itvAPI)

**File:** `ebAPI/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Spring Boot Dockerfile

**File:** `os/Dockerfile`

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

## Vite Configuration

**File:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

## TypeScript Configuration

**File:** `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

## TailwindCSS v4 Configuration

With TailwindCSS v4, configuration is handled via CSS:

**File:** `frontend/src/index.css`

```css
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
  --color-primary-foreground: #FFFFFF;
  --color-secondary: #6B7280;
  --color-secondary-foreground: #FFFFFF;
}
```

## Google OAuth Configuration

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth Client ID
5. Configure consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:6901`
   - `http://localhost:5173`
7. Copy Client ID to `frontend/.env`

### Frontend OAuth Setup

```typescript
// src/main.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
);
```

## Testing Configuration

### pytest Configuration (Python)

**File:** `ai/pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

addopts = 
    -v
    --strict-markers
    --tb=short
    --cov=src
    --cov-report=term-missing
    --cov-report=xml

markers =
    slow: tests that take a long time
    integration: integration tests
    unit: unit tests
```

### Vitest Configuration (Frontend)

**File:** `frontend/vite.config.ts`

```typescript
export default defineConfig({
  // ... other config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

## Production Configuration

### Production Environment Variables

```bash
# Frontend Production
VITE_GOOGLE_CLIENT_ID=your-production-client-id
VITE_API_URL=https://api.your-domain.com
VITE_ITV_API_URL=https://itv.your-domain.com
VITE_OS_API_URL=https://os.your-domain.com

# Database Production
MYSQL_ROOT_PASSWORD=secure-password
MYSQL_DATABASE=crai
MYSQL_USER=crai
MYSQL_PASSWORD=secure-password

# Spring Boot Production
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/crai
```

### Production Docker Compose

```yaml
services:
  mysql:
    image: mysql:8
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    volumes:
      - mysql_data:/var/lib/mysql

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"

  ai:
    build: ./ai
    restart: always
    environment:
      - PYTHONUNBUFFERED=1

  ebapi:
    build: ./ebAPI
    restart: always

  itvapi:
    build: ./itvAPI
    restart: always

  os:
    build: ./os
    restart: always
    environment:
      - SPRING_PROFILES_ACTIVE=prod

volumes:
  mysql_data:
```

## Security Configuration

### CORS Setup (FastAPI)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:6901",
        "http://localhost:5173",
        "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### CORS Setup (Spring Boot)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://localhost:6901",
                "http://localhost:5173"
            )
            .allowedMethods("*")
            .allowedHeaders("*");
    }
}
```

## Next Steps

- Learn about the [Architecture](/architecture/overview/)
- Explore [API Endpoints](/api/overview/)
- Set up [Testing](/testing/overview/)
- Prepare for [Deployment](/deployment/production/)
