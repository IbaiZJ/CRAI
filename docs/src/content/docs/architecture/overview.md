---
title: Architecture Overview
description: High-level overview of CRAI's architecture and design principles
---

CRAI follows a modern microservices architecture with clear separation between frontend and backend components.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                        │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Frontend (React + Vite)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Components │  │    Pages     │  │     State    │  │
│  │    (UI)     │  │  (Routes)    │  │  Management  │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ REST API (JSON)
                        │
┌───────────────────────▼─────────────────────────────────┐
│                Backend (FastAPI + Python)                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routers   │  │   Services   │  │    Models    │  │
│  │ (Endpoints) │  │ (Business    │  │   (Data)     │  │
│  │             │  │   Logic)     │  │              │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  AI/ML Processing                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   OpenCV    │  │  TensorFlow  │  │   Custom     │  │
│  │  (Vision)   │  │  (Detection) │  │   Models     │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. **Separation of Concerns**
- Frontend handles presentation and user interaction
- Backend manages business logic and data processing
- AI layer focuses on image processing and recognition

### 2. **RESTful API Design**
- Stateless communication
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON data format
- Clear resource-based URLs

### 3. **Scalability**
- Stateless backend allows horizontal scaling
- Docker containers for easy deployment
- Async processing for heavy AI operations

### 4. **Testability**
- 100% test coverage for backend
- Unit and integration tests
- Automated CI/CD pipeline

### 5. **Security**
- CORS configuration
- Input validation
- Rate limiting (planned)
- API authentication (planned)

## Technology Stack

### Frontend Layer

#### React 18
- Modern hooks-based architecture
- Component-based UI
- Virtual DOM for performance

#### TypeScript
- Type safety
- Better IDE support
- Fewer runtime errors

#### Vite
- Fast build times
- Hot module replacement
- Optimized production builds

#### TailwindCSS
- Utility-first CSS
- Consistent design system
- Small bundle size

### Backend Layer

#### FastAPI
- Automatic API documentation
- Type validation with Pydantic
- Async support
- High performance

#### Python 3.11+
- Latest language features
- Performance improvements
- Strong typing support

#### Pydantic
- Data validation
- Settings management
- Type conversion

#### pytest
- Comprehensive testing
- Coverage reporting
- Easy to write tests

### AI/ML Layer (In Development)

#### OpenCV
- Image preprocessing
- Contour detection
- Feature extraction

#### TensorFlow/PyTorch
- Deep learning models
- Plate detection
- Character recognition

## Data Flow

### 1. Plate Recognition Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Upload Image
     ▼
┌──────────┐
│ Frontend │
└────┬─────┘
     │
     │ 2. POST /api/recognize
     ▼
┌──────────┐
│ Backend  │──────┐
│  API     │      │ 3. Validate Input
└────┬─────┘      │
     │            │
     │ 4. Process Image
     ▼            │
┌──────────┐      │
│   AI     │◄─────┘
│ Service  │
└────┬─────┘
     │
     │ 5. Return Result
     ▼
┌──────────┐
│ Backend  │
│  API     │
└────┬─────┘
     │
     │ 6. JSON Response
     ▼
┌──────────┐
│ Frontend │
└────┬─────┘
     │
     │ 7. Display Result
     ▼
┌─────────┐
│  User   │
└─────────┘
```

### 2. Request/Response Cycle

```python
# Frontend Request
fetch('/api/recognize', {
  method: 'POST',
  body: formData
})

# Backend Processing
@router.post("/recognize")
async def recognize_plate(image: UploadFile):
    # 1. Validate image
    # 2. Preprocess image
    # 3. Detect plate
    # 4. Recognize characters
    # 5. Return result
    return {
        "plate_number": "ABC-1234",
        "confidence": 0.95
    }

# Frontend Response
response.json().then(data => {
  console.log(data.plate_number);
});
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

### 1. **REST API**
- Primary communication method
- JSON format
- Stateless requests

### 2. **WebSocket** (Planned)
- Real-time updates
- Live camera feed
- Streaming results

### 3. **File Upload**
- Multipart form data
- Image files
- Validation

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

### Development
```
docker-compose up
├── backend:6902
└── frontend:5173
```

### Production
```
Load Balancer
├── Frontend Instances (Nginx)
└── Backend Instances (Uvicorn)
    └── AI Processing Workers
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

## Next Steps

Dive deeper into specific components:
- [Backend Architecture](/architecture/backend/)
- [Frontend Architecture](/architecture/frontend/)
- [Docker Setup](/architecture/docker/)
- [API Reference](/api/overview/)
