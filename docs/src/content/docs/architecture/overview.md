---
title: Architecture Overview
description: High-level overview of CRAI's architecture and design principles
---

CRAI follows a modern microservices architecture with 5 independent services orchestrated via Docker Compose, providing scalability, maintainability, and clear separation of concerns.

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│          Frontend Service (React + Vite) - Port 6901             │
│  ┌──────────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Components  │  │   Pages   │  │  State   │  │  Firebase │  │
│  │     (UI)     │  │ (Routes)  │  │  Mgmt    │  │   Auth    │  │
│  └──────────────┘  └───────────┘  └──────────┘  └───────────┘  │
└────────────────┬──────────────────────────┬──────────────────────┘
                 │                          │
                 │ REST API                 │ REST API
                 ▼                          ▼
┌─────────────────────────────┐  ┌──────────────────────────────┐
│   AI Service (Port 6902)    │  │  ebAPI Service (Port 6904)   │
│   FastAPI + Python 3.11+    │  │  FastAPI + Python 3.11-slim  │
│                             │  │                              │
│  ┌─────────┐  ┌──────────┐ │  │  ┌─────────┐  ┌──────────┐  │
│  │ Routers │  │ Services │ │  │  │ Routers │  │ Services │  │
│  └─────────┘  └──────────┘ │  │  └─────────┘  └──────────┘  │
│  ┌─────────┐  ┌──────────┐ │  │  ┌─────────┐  ┌──────────┐  │
│  │ OpenCV  │  │   ANPR   │ │  │  │ Dataset │  │  Badge   │  │
│  │ Vision  │  │  Model   │ │  │  │  Utils  │  │  Lookup  │  │
│  └─────────┘  └──────────┘ │  │  └─────────┘  └──────────┘  │
│                             │  │                              │
│  • License plate detection  │  │  • Spanish plate validation  │
│  • Character recognition    │  │  • Environmental badge       │
│  • Image preprocessing      │  │  • 4M+ plate database        │
└─────────────┬───────────────┘  └──────────────┬───────────────┘
              │                                  │
              └──────────────┬───────────────────┘
                             │
                             ▼
              ┌──────────────────────────────────┐
              │  Node-RED Service (Port 6903)    │
              │  nodered/node-red:latest         │
              │                                  │
              │  ┌────────────┐  ┌────────────┐ │
              │  │  Workflow  │  │   Flow     │ │
              │  │ Automation │  │ Persistence│ │
              │  └────────────┘  └────────────┘ │
              │                                  │
              │  • Data orchestration            │
              │  • API integration               │
              │  • Persistent flows (bind mount) │
              └──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│      Documentation Service (Astro Starlight) - Port 6910         │
│  • API documentation  • Architecture guides  • Setup tutorials   │
└──────────────────────────────────────────────────────────────────┘
```

## Services Overview

### 1. Frontend Service (Port 6901)
**Technology:** React 19 + TypeScript 5.9 + Vite 7 + TailwindCSS 4

The user-facing web application providing:
- Modern, responsive UI with TailwindCSS
- Firebase authentication integration
- Client-side routing with React Router 7
- Real-time communication with backend APIs
- Comprehensive Vitest testing suite (6 passing tests)

**Key Features:**
- Login/Signup with Firebase Auth
- License plate upload and recognition
- Environmental badge lookup interface
- Real-time results display

### 2. AI Service (Port 6902)
**Technology:** FastAPI + Python 3.11+ + OpenCV + pytesseract

The ANPR (Automatic Number Plate Recognition) engine:
- Image preprocessing and enhancement
- License plate detection using OpenCV
- Character recognition with OCR
- RESTful API with automatic Swagger documentation
- 100% test coverage with pytest (17 passing tests)

**Key Endpoints:**
- `POST /api/recognize` - Analyze image and recognize plate
- `GET /api/health` - Health check endpoint
- `GET /docs` - Interactive API documentation

### 3. ebAPI Service (Port 6904)
**Technology:** FastAPI + Python 3.11-slim + pandas + py7zr

The Environmental Badge lookup microservice:
- Spanish license plate format validation (NNNNLLL)
- Badge classification lookup (C, ECO, B, 0, n)
- Dataset auto-extraction from 40MB .7z archive
- 4M+ Spanish vehicle records

**Key Features:**
- Validates Spanish plate format (4 digits + 3 consonants)
- Returns badge type and vehicle classification
- Automatic dataset management and optimization
- Badge code parsing (e.g., 16TB → {vehicleType: "turism", badge: "B"})

**Key Endpoints:**
- `GET /api?carPlate=1234ABC` - Get environmental badge for plate
- Dataset utilities: `optimize_dataset.py`, `generate_complete_dataset.py`

### 4. Node-RED Service (Port 6903)
**Technology:** Node-RED (Node.js visual workflow engine)

Workflow automation and orchestration:
- Visual flow-based programming
- API integration and data transformation
- Real-time event processing
- Persistent flows via bind mount to `backend/node_red_data/`

**Key Features:**
- Connect AI and ebAPI services
- Automated data pipelines
- Custom workflow logic
- Real-time notifications

### 5. Documentation Service (Port 6910)
**Technology:** Astro 5 + Starlight 0.36

Comprehensive project documentation:
- Architecture guides
- API reference documentation
- Setup and deployment guides
- Testing strategies
- Troubleshooting resources

## Design Principles

### 1. **Microservices Architecture**
- Each service has a single responsibility and independent lifecycle
- Services communicate via REST APIs over HTTP
- Independent scaling and deployment per service
- Technology diversity (Python, Node.js, JavaScript/TypeScript)

### 2. **Separation of Concerns**
- **Frontend**: User interface and experience
- **AI Service**: Computer vision and ANPR processing
- **ebAPI Service**: Data lookup and validation
- **Node-RED**: Workflow orchestration and automation
- **Documentation**: Project knowledge base

### 3. **RESTful API Design**
- Stateless communication
- Standard HTTP methods (GET, POST)
- JSON data format
- Clear resource-based URLs
- Automatic API documentation (Swagger/OpenAPI)

### 4. **Scalability**
- Stateless services enable horizontal scaling
- Docker containerization for easy deployment
- Async processing for I/O-bound operations
- Independent service scaling based on load

### 5. **Testability**
- Comprehensive test suites per service
- AI Service: 17 tests, 100% coverage (pytest)
- Frontend: 6 tests with Vitest and React Testing Library
- Automated CI/CD pipelines with GitHub Actions

### 6. **Security**
- Firebase authentication for frontend
- CORS configuration per service
- Input validation with Pydantic
- Environment variable configuration
- Spanish plate format validation (regex-based)

### 7. **Data Management**
- Auto-extraction of compressed datasets (py7zr)
- Dataset optimization and cleaning utilities
- Persistent storage for Node-RED flows (bind mount)
- Efficient CSV-based badge lookup with pandas

## Technology Stack

### Frontend Service

#### React 19.2.0
- Modern hooks-based architecture
- Component-based UI
- Latest React features and optimizations

#### TypeScript 5.9.3
- Type safety and IntelliSense
- Better IDE support and refactoring
- Compile-time error detection

#### Vite 7.2.2
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ESM support

#### TailwindCSS 4.1.17
- Utility-first CSS framework
- Consistent design system
- Small bundle size with tree-shaking

#### React Router 7.9.6
- Client-side routing
- Nested routes and layouts
- Protected routes with authentication

#### Firebase
- User authentication
- Session management
- Google OAuth integration

### Backend Services

#### FastAPI (Both AI & ebAPI)
- Automatic OpenAPI/Swagger documentation
- Type validation with Pydantic
- Async/await support
- High performance ASGI framework

#### Python 3.11+ (AI Service)
- Latest language features
- Performance improvements
- OpenCV integration

#### Python 3.11-slim (ebAPI Service)
- Lightweight Docker image
- Reduced attack surface
- Fast startup times

#### Pydantic & pydantic-settings
- Data validation and parsing
- Settings management from environment
- Type conversion and coercion

#### pandas
- Efficient CSV processing (ebAPI)
- DataFrame operations
- Large dataset handling

#### py7zr
- Python-native .7z extraction
- Cross-platform compatibility
- No system dependencies

### AI/Computer Vision

#### OpenCV
- Image preprocessing and enhancement
- Contour detection for plate location
- Feature extraction

#### pytesseract
- OCR (Optical Character Recognition)
- License plate text extraction
- Configurable recognition parameters

#### scikit-image & imutils
- Advanced image processing
- Utility functions for CV operations

### Automation Layer

#### Node-RED (nodered/node-red:latest)
- Visual flow-based programming
- HTTP API integration
- Data transformation nodes
- Event-driven processing

### Testing Frameworks

#### pytest (Backend)
- Unit and integration tests
- Coverage reporting (pytest-cov)
- 17 passing tests, 100% coverage

#### Vitest 4.0.14 (Frontend)
- Fast unit testing with Vite
- Hot module replacement for tests
- 6 passing tests

#### @testing-library/react 16.3.0
- User-centric testing approach
- DOM interaction testing
- Best practices for React components

#### @testing-library/jest-dom
- Custom matchers for DOM assertions
- Improved test readability

## Data Flow

### 1. ANPR Recognition Flow

```
┌─────────┐
│  User   │ 1. Upload Image
└────┬────┘
     │
     ▼
┌──────────────┐
│   Frontend   │ 2. POST http://ai:6902/api/recognize
│  (Port 6901) │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ AI Service   │ 3. Validate image type
│  (Port 6902) │ 4. Preprocess with OpenCV
└────┬─────────┘ 5. Detect plate region
     │          6. OCR with pytesseract
     │          7. Return {plate_number, confidence}
     ▼
┌──────────────┐
│   Frontend   │ 8. Display results to user
│  (Port 6901) │
└──────────────┘
```

### 2. Environmental Badge Lookup Flow

```
┌─────────┐
│  User   │ 1. Enter plate number
└────┬────┘
     │
     ▼
┌──────────────┐
│   Frontend   │ 2. GET http://ebapi:6904/api?carPlate=1234ABC
│  (Port 6901) │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ ebAPI Service│ 3. Validate Spanish plate format (NNNNLLL)
│  (Port 6904) │ 4. Format plate (uppercase, sanitize)
└────┬─────────┘ 5. Lookup in CSV dataset (pandas)
     │          6. Parse badge code (e.g., 16TB → turism + B)
     │          7. Return {carPlate, badge: {vehicleType, badge}}
     ▼
┌──────────────┐
│   Frontend   │ 8. Display badge info (C/ECO/B/0/n)
│  (Port 6901) │
└──────────────┘
```

### 3. Node-RED Orchestration Flow

```
┌──────────────┐
│  Node-RED    │ 1. Trigger workflow
│  (Port 6903) │
└──┬───────┬───┘
   │       │
   │       ▼
   │   ┌──────────────┐
   │   │ AI Service   │ 2. Request ANPR
   │   │  (Port 6902) │
   │   └──────┬───────┘
   │          │ 3. plate_number
   │          │
   ▼          ▼
┌──────────────┐
│ ebAPI Service│ 4. Lookup badge for recognized plate
│  (Port 6904) │
└──────┬───────┘
       │ 5. badge data
       ▼
┌──────────────┐
│  Node-RED    │ 6. Combine data, transform
│  (Port 6903) │ 7. Store or forward results
└──────────────┘
```

### 4. Dataset Management Flow

```
┌──────────────────┐
│  ebAPI Startup   │ 1. Check if environmentalBadge.txt exists
└────┬─────────────┘
     │ NO
     ▼
┌──────────────────┐
│  py7zr Extract   │ 2. Extract environmentalBadge.7z (40MB → 592MB)
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ ebAPI Ready      │ 3. Load dataset into memory (pandas)
│                  │ 4. Serve badge lookup requests
└──────────────────┘

Optional: Dataset Optimization
┌─────────────────────┐
│ optimize_dataset.py │ • Remove duplicates
└─────────────────────┘ • Sort by plate
                        • Format badge codes
                        • Replace "SIN DISTINTIVO" → "n"
                        • Add STOL column
                        • Save as CSV with headers

Optional: Dataset Generation
┌────────────────────────┐
│ generate_complete_     │ • Generate missing Spanish plates
│ dataset.py             │ • 0000BBB to 0000PPP range
└────────────────────────┘ • Assign badge='n' to missing
                           • Merge with existing dataset
```

## Component Architecture

### Backend Components

```
ai/
├── api/
│   ├── main.py              # Application entry point
│   ├── core/
│   │   └── config.py        # Configuration management
│   ├── routers/
│   │   └── router.py        # API endpoints
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   └── recognition.py   # Business logic
│   └── utils/
│       └── image.py         # Image utilities
└── tests/
    └── api/
        └── test_*.py        # Test suites
```

### Frontend Components

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── landing/        # Landing page components
│   ├── pages/              # Page components
│   ├── lib/                # Utilities
│   └── main.tsx            # Application entry
└── public/                 # Static assets
```

## Communication Patterns

### 1. **HTTP REST APIs**
- Primary inter-service communication
- JSON request/response format
- Stateless requests
- GET for queries, POST for data submission

**Frontend → AI Service:**
```
POST http://localhost:6902/api/recognize
Content-Type: multipart/form-data
```

**Frontend → ebAPI Service:**
```
GET http://localhost:6904/api?carPlate=1234ABC
```

### 2. **File Upload (Multipart Form Data)**
- Image upload for ANPR processing
- FastAPI's `UploadFile` handling
- Content-type validation
- Size and format restrictions

```typescript
const formData = new FormData();
formData.append('image', file);
fetch('http://localhost:6902/api/recognize', {
  method: 'POST',
  body: formData
});
```

### 3. **Query Parameters**
- ebAPI uses GET with query params
- Simple, cacheable requests
- URL-encoded parameters

```bash
curl "http://localhost:6904/api?carPlate=1234ABC"
```

### 4. **Node-RED HTTP Requests**
- HTTP Request nodes for API calls
- Function nodes for data transformation
- Inject nodes for triggers
- Debug nodes for monitoring

### 5. **Docker Network Communication**
- All services on `app-network` bridge network
- Service discovery by container name
- Internal port communication
- Isolated from host network by default

### 6. **WebSocket** (Planned Future Feature)
- Real-time plate recognition updates
- Live camera feed streaming
- Server-sent events for notifications

## State Management

### Backend State
- Stateless design
- No server-side sessions
- Database for persistence (planned)

### Frontend State
- React hooks (useState, useEffect)
- Context API for global state
- Local storage for preferences

## Error Handling

### Backend Errors

```python
from fastapi import HTTPException

@router.post("/recognize")
async def recognize_plate(image: UploadFile):
    if not image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type"
        )
    
    try:
        result = await process_image(image)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
```

### Frontend Error Handling

```typescript
try {
  const response = await fetch('/api/recognize', options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Recognition failed:', error);
  // Show user-friendly error message
}
```

## Performance Considerations

### Backend Optimization
- Async endpoints for I/O operations
- Image caching
- Batch processing
- Connection pooling

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- CDN for static assets

## Security Architecture

### Current Implementation
- CORS configuration
- Input validation
- Type checking
- Error sanitization

### Planned Improvements
- API authentication (JWT)
- Rate limiting
- API keys
- Request signing

## Deployment Architecture

### Development Environment
```
docker-compose up -d

Docker Compose Orchestration (app-network)
├── frontend:6901     (React + Vite dev server)
├── ai:6902           (FastAPI with --reload)
├── node-red:6903     (Node-RED with persistent flows)
├── ebapi:6904        (FastAPI with auto dataset extraction)
└── docs:6910         (Astro dev server)

Volumes:
├── ./frontend:/app                    (bind mount for HMR)
├── ./ai:/app                          (bind mount for hot reload)
├── ./ebAPI:/app                       (bind mount for development)
├── ./backend/node_red_data:/data      (bind mount for flow persistence)
└── /app/node_modules                  (anonymous volumes)
```

### Port Mapping
| Service | Internal Port | External Port | Protocol |
|---------|---------------|---------------|----------|
| Frontend | 5173 | 6901 | HTTP |
| AI | 8000 | 6902 | HTTP |
| Node-RED | 1880 | 6903 | HTTP |
| ebAPI | 8000 | 6904 | HTTP |
| Documentation | 4321 | 6910 | HTTP |

### Production (Planned)
```
Load Balancer (Nginx/Traefik)
├── Frontend Instances (Nginx static hosting)
│   ├── Optimized React build
│   ├── Gzip compression
│   └── Asset caching
├── AI Service Instances (Uvicorn workers)
│   ├── Multiple workers per instance
│   ├── Horizontal scaling
│   └── GPU acceleration (optional)
├── ebAPI Service Instances (Uvicorn workers)
│   ├── In-memory dataset caching
│   ├── Fast CSV lookups
│   └── Stateless for easy scaling
└── Node-RED Instance (PM2/Docker)
    ├── Persistent flow storage
    └── Workflow orchestration
```

## Monitoring & Logging

### Logging Strategy
- Structured logging
- Different log levels
- Centralized log aggregation (planned)

### Metrics (Planned)
- Request rate
- Response time
- Error rate
- Resource usage

## Service Access URLs

### Development
- Frontend: http://localhost:6901
- AI Service API: http://localhost:6902
- AI Service Docs: http://localhost:6902/docs
- Node-RED Dashboard: http://localhost:6903
- ebAPI Service: http://localhost:6904
- ebAPI Docs: http://localhost:6904/docs
- Documentation: http://localhost:6910

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose build --no-cache

# Check service status
docker-compose ps
```

## Next Steps

Dive deeper into specific components:
- [Backend Architecture](/architecture/backend/) - AI and ebAPI services in detail
- [Frontend Architecture](/architecture/frontend/) - React application structure
- [Docker Setup](/architecture/docker/) - Complete Docker configuration
- [API Reference](/api/overview/) - All API endpoints and schemas
- [Dataset Management](/guides/dataset-management/) - Environmental badge data handling
