---
title: Backend Architecture
description: Deep dive into CRAI's FastAPI backend architecture
---

The CRAI backend is built with FastAPI, providing a high-performance, modern Python API with automatic documentation.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              FastAPI Application             │
├─────────────────────────────────────────────┤
│  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Routers  │  │  Models  │  │ Services │ │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘ │
│        │             │              │       │
│  ┌─────▼─────────────▼──────────────▼─────┐ │
│  │          Core Configuration           │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Project Structure

```
ai/
├── api/
│   ├── __init__.py
│   ├── main.py                  # Application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Settings and configuration
│   ├── routers/
│   │   ├── __init__.py
│   │   └── router.py           # API endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   └── recognition.py      # Business logic
│   └── utils/
│       ├── __init__.py
│       └── image.py            # Utility functions
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Test configuration
│   └── api/
│       ├── test_main.py
│       └── test_router.py
├── requirements.txt
└── pytest.ini
```

## Core Components

### 1. Application Entry Point

**File:** `api/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers.router import router
from api.core.config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="CRAI - Car Registration AI System",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)

@app.get("/")
async def root():
    return {
        "message": "CRAI API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }
```

### 2. Configuration Management

**File:** `api/core/config.py`

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "CRAI ANPR API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    API_TAGS: List[str] = ["ANPR"]
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 6902
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    # AI Model Configuration
    MODEL_PATH: str = "./data/models"
    CONFIDENCE_THRESHOLD: float = 0.8
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 3. API Routers

**File:** `api/routers/router.py`

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from api.core.config import settings

router = APIRouter(
    prefix=settings.API_PREFIX,
    tags=settings.API_TAGS
)

@router.get("/hello")
async def hello():
    """Health check endpoint"""
    return {"message": "Hello World"}

@router.post("/recognize")
async def recognize_plate(
    image: UploadFile = File(...),
):
    """
    Recognize license plate from uploaded image
    
    Args:
        image: Image file containing license plate
        
    Returns:
        Recognition result with plate number and confidence
    """
    # Validate file type
    if not image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    # Process image (to be implemented)
    # result = await recognition_service.process(image)
    
    return {
        "plate_number": "ABC-1234",
        "confidence": 0.95,
        "processing_time": 0.123
    }

@router.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "version": settings.API_VERSION
    }
```

### 4. Data Models

**File:** `api/models/schemas.py`

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PlateRecognitionRequest(BaseModel):
    """Request model for plate recognition"""
    image_data: str = Field(..., description="Base64 encoded image")
    
class PlateRecognitionResponse(BaseModel):
    """Response model for plate recognition"""
    plate_number: str = Field(..., description="Recognized plate number")
    confidence: float = Field(..., ge=0.0, le=1.0)
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "plate_number": "ABC-1234",
                "confidence": 0.95,
                "processing_time": 0.123,
                "timestamp": "2024-01-01T12:00:00"
            }
        }

class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    status_code: int
```

### 5. Business Logic

**File:** `api/services/recognition.py`

```python
from fastapi import UploadFile
import cv2
import numpy as np
from typing import Dict, Any

class RecognitionService:
    """Service for plate recognition logic"""
    
    def __init__(self):
        self.model = None  # Load AI model here
        
    async def process_image(
        self, 
        image: UploadFile
    ) -> Dict[str, Any]:
        """
        Process uploaded image and recognize plate
        
        Args:
            image: Uploaded image file
            
        Returns:
            Recognition result dictionary
        """
        # Read image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Preprocess
        img_processed = self._preprocess(img)
        
        # Detect plate
        plate_coords = self._detect_plate(img_processed)
        
        # Recognize characters
        plate_number = self._recognize_characters(
            img_processed, 
            plate_coords
        )
        
        return {
            "plate_number": plate_number,
            "confidence": 0.95,
            "coordinates": plate_coords
        }
    
    def _preprocess(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for detection"""
        # Grayscale conversion
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Noise reduction
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        return blurred
    
    def _detect_plate(self, image: np.ndarray) -> Dict:
        """Detect license plate location"""
        # Edge detection
        edges = cv2.Canny(image, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(
            edges, 
            cv2.RETR_TREE, 
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Filter contours for plate-like shapes
        # Return coordinates
        return {"x": 0, "y": 0, "w": 0, "h": 0}
    
    def _recognize_characters(
        self, 
        image: np.ndarray, 
        coords: Dict
    ) -> str:
        """Recognize characters from plate region"""
        # OCR implementation
        return "ABC-1234"

# Singleton instance
recognition_service = RecognitionService()
```

## Async Operations

FastAPI supports async/await for non-blocking I/O:

```python
@router.post("/recognize")
async def recognize_plate(image: UploadFile = File(...)):
    # Async file reading
    contents = await image.read()
    
    # Async database query (if using)
    # result = await db.save_result(data)
    
    # Async external API call
    # response = await httpx.get(url)
    
    return result
```

## Error Handling

### Custom Exception Handler

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, 
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request, 
    exc: Exception
):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )
```

## Dependency Injection

```python
from fastapi import Depends

async def get_current_user(token: str = Header(...)):
    """Dependency to get current user"""
    # Validate token
    return user

@router.get("/profile")
async def get_profile(user = Depends(get_current_user)):
    return {"user": user}
```

## Background Tasks

```python
from fastapi import BackgroundTasks

def send_notification(email: str):
    """Send email notification"""
    print(f"Sending email to {email}")

@router.post("/process")
async def process_image(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...)
):
    # Process image
    result = await recognize(image)
    
    # Add background task
    background_tasks.add_task(
        send_notification, 
        "user@example.com"
    )
    
    return result
```

## Testing

### Test Configuration

**File:** `tests/conftest.py`

```python
import pytest
from fastapi.testclient import TestClient
from api.main import app

@pytest.fixture(scope="module")
def test_client():
    """Test client fixture"""
    with TestClient(app) as client:
        yield client
```

### Test Example

**File:** `tests/api/test_router.py`

```python
def test_hello_endpoint(test_client):
    """Test hello endpoint"""
    response = test_client.get("/api/hello")
    assert response.status_code == 200
    assert "message" in response.json()

def test_recognize_endpoint(test_client):
    """Test recognize endpoint"""
    files = {"image": ("test.jpg", image_bytes, "image/jpeg")}
    response = test_client.post("/api/recognize", files=files)
    assert response.status_code == 200
    assert "plate_number" in response.json()
```

## Performance Optimization

### 1. Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_operation(param: str):
    """Cached expensive operation"""
    return result
```

### 2. Database Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0
)
```

### 3. Async Database Queries

```python
from databases import Database

database = Database(DATABASE_URL)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
```

## API Documentation

FastAPI automatically generates:
- **Swagger UI**: http://localhost:6902/docs
- **ReDoc**: http://localhost:6902/redoc
- **OpenAPI JSON**: http://localhost:6902/openapi.json

## Next Steps

- Explore [API Endpoints](/api/endpoints/)
- Learn about [Testing Strategy](/testing/backend/)
- Review [Frontend Integration](/frontend/components/)
