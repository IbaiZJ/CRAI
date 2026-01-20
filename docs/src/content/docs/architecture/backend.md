---
title: Backend Architecture
description: Deep dive into CRAI's backend services architecture
---

The CRAI backend consists of four independent microservices: the **AI Service** for automatic number plate recognition, the **ebAPI Service** for environmental badge lookup, the **itvAPI Service** for ITV date lookup, and the **OS Service** for vehicle simulation.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             Backend Services                                  │
├────────────────┬────────────────┬────────────────┬───────────────────────────┤
│  AI Service    │  ebAPI Service │ itvAPI Service │     OS Service            │
│  (6902)        │  (6904)        │ (6905)         │     (6906)                │
│  Real-time     │  Badge Lookup  │ ITV Lookup     │     Simulation            │
│  ANPR          │                │                │                           │
├────────────────┼────────────────┼────────────────┼───────────────────────────┤
│ Python 3.11+   │ FastAPI        │ FastAPI        │ Spring Boot 3.2           │
│ YOLOv8         │ Python 3.11    │ Python 3.11    │ Java 17                   │
│ EasyOCR        │ pandas         │ pandas         │ Maven                     │
│ TensorFlow     │ py7zr          │ py7zr          │ Jackson                   │
│ OpenCV         │                │                │                           │
│                │                │                │                           │
│ src/           │ routers/       │ routers/       │ controller/               │
│ ├─ detectors/  │ service/       │ service/       │ service/                  │
│ ├─ video/      │ util/          │ util/          │ repository/               │
│ ├─ api/        │ conf/          │ conf/          │ model/                    │
│ ├─ config/     │ data/          │ data/          │ config/                   │
│ └─ utils/      │                │                │                           │
└────────────────┴────────────────┴────────────────┴───────────────────────────┘
                                       │
                                       ▼
                      ┌────────────────────────────────┐
                      │     MySQL Database (6900)      │
                      │     ├─ crai database           │
                      │     ├─ users, vehicles         │
                      │     └─ simulations, cameras    │
                      └────────────────────────────────┘
```

## AI Service - Real-time ANPR

### Purpose
The AI service provides real-time Automatic Number Plate Recognition (ANPR) by processing live video streams. It detects vehicles, locates license plates, and reads plate text using OCR.

### Project Structure
```
ai/
├── src/
│   ├── main.py                    # Application entry point
│   ├── api/
│   │   ├── plate_queue.py         # Thread-safe API queue
│   │   └── request.py             # HTTP request handler
│   ├── config/
│   │   ├── config.py              # YAML configuration loader
│   │   └── config.yaml            # Configuration settings
│   ├── detectors/
│   │   ├── vehicle_detector.py    # YOLOv8 vehicle detection
│   │   ├── plate_detector.py      # Custom plate detection
│   │   ├── ssd_detector.py        # Custom SSD detector
│   │   └── ocr.py                 # EasyOCR plate reader
│   ├── video/
│   │   ├── video_stream.py        # Camera/video input
│   │   └── fps.py                 # FPS counter
│   ├── utils/
│   │   ├── logger.py              # Custom logging
│   │   └── terminal.py            # Terminal utilities
│   └── models/                    # AI model files
├── tests/
│   ├── test_config.py
│   ├── test_detectors.py
│   ├── test_main.py
│   ├── test_ocr.py
│   ├── test_plate_queue.py
│   └── test_terminal_logger.py
├── requirements.txt
├── pytest.ini
└── Dockerfile
```

### Key Components

#### Vehicle Detector (YOLOv8)
```python
class VehicleDetector:
    """Detect vehicles using YOLOv8"""
    def __init__(self, model_path, conf_threshold=0.5):
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        self.classes = ['car', 'truck', 'bus', 'motorcycle']
```

#### Plate Detector
```python
class PlateDetector:
    """Custom YOLO model for license plate detection"""
    def __init__(self, model_path, conf_threshold=0.4):
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
```

#### OCR Reader (EasyOCR)
```python
class PlateReader:
    """EasyOCR-based license plate text recognition"""
    def __init__(self, languages=['en'], gpu=False):
        self.reader = easyocr.Reader(languages, gpu=gpu)
```

#### Plate Queue
```python
class PlateQueue:
    """Thread-safe queue for sending plates to API"""
    def __init__(self, endpoint_url, max_retries=3, retry_delay=2.0):
        self.queue = queue.Queue()
        self.endpoint_url = endpoint_url
    
    def add_plate(self, plate_text, confidence, vehicle_type=None):
        """Add detected plate to queue"""
```

### Configuration (config.yaml)
```yaml
camera:
  source: 1
  auto_find: true
  resolution:
    width: 1280
    height: 720

vehicle_detector:
  model_path: "models/yolov8n.pt"
  confidence_threshold: 0.5

plate_detector:
  model_path: "models/license_plate_detector.pt"
  confidence_threshold: 0.3

ocr:
  enabled: true
  engine: "easyocr"
  languages: ["en"]
  use_gpu: false
  confidence_threshold: 0.3

api:
  endpoint_base_url: "http://localhost:6903"
  car_plate_endpoint: "/ai/carPlate"
  timeout: 10
  max_retries: 3
```

### Dependencies
```
fastapi
uvicorn[standard]
numpy==2.2.6
pandas==2.3.3
opencv-python==4.12.0.88
tensorflow==2.20.0
ultralytics
easyocr
PyYAML
pytest
pytest-cov
```

---

## ebAPI Service - Environmental Badge Lookup

### Purpose
The ebAPI microservice provides Spanish vehicle environmental badge classification lookup for over 4 million license plates.

### Project Structure
```
ebAPI/
├── __init__.py
├── main.py                        # FastAPI app + auto-extraction
├── conf/
│   ├── __init__.py
│   └── config.py                  # Pydantic settings
├── routers/
│   ├── __init__.py
│   └── router.py                  # GET /api endpoint
├── service/
│   ├── __init__.py
│   └── service.py                 # EnvironmentalBadgeService
├── util/
│   ├── __init__.py
│   ├── get_badge_from_plates.py   # CSV lookup
│   └── util.py                    # Helper functions
├── data/
│   ├── environmentalBadge.7z      # Compressed dataset
│   └── environmentalBadge.txt     # Extracted dataset
├── tests/
├── requirements.txt
└── Dockerfile
```

### API Endpoint

**GET /api?carPlate={plate}**

```bash
curl "http://localhost:6904/api?carPlate=1234ABC"
```

**Response:**
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

### Badge Classifications
| Badge | Name | Description |
|-------|------|-------------|
| 0 | Zero emissions | Electric, hydrogen vehicles |
| ECO | ECO | Hybrid and alternative fuel |
| C | C | Euro 4/5/6 standards |
| B | B | Euro 3/4 standards |
| n | Sin distintivo | No badge (high emissions) |

---

## itvAPI Service - ITV Date Lookup

### Purpose
The itvAPI microservice provides Spanish vehicle ITV (technical inspection) date lookup.

### Project Structure
```
itvAPI/
├── __init__.py
├── main.py                        # FastAPI app
├── conf/
│   └── config.py                  # Settings
├── routers/
│   └── router.py                  # GET /api endpoint
├── service/
│   └── service.py                 # ITV lookup service
├── util/
│   └── util.py                    # Helpers
├── data/
│   └── itv_dates.7z               # Dataset
├── tests/
├── requirements.txt
└── Dockerfile
```

### API Endpoint

**GET /api?carPlate={plate}**

```bash
curl "http://localhost:6905/api?carPlate=1234ABC"
```

**Response:**
```json
{
  "carPlate": "1234ABC",
  "itv_date": "2025-06-15"
}
```

---

## OS Service - Vehicle Simulation (Spring Boot)

### Purpose
The OS service provides vehicle traffic simulation, camera management, and police control operations using Spring Boot and Java 17.

### Project Structure
```
os/
├── src/main/java/com/crai/os/
│   ├── OsApplication.java         # Spring Boot entry
│   ├── controller/
│   │   ├── CameraController.java
│   │   ├── VehicleController.java
│   │   ├── SimulationController.java
│   │   ├── PoliceController.java
│   │   └── ControlController.java
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── config/
│   ├── exception/
│   └── utils/
├── src/main/resources/
├── src/test/
├── pom.xml
└── Dockerfile
```

### Key Controllers

#### Camera Controller
Manages camera CRUD operations for monitoring.

#### Vehicle Controller
Handles vehicle registration and tracking.

#### Simulation Controller
Controls traffic simulation scenarios.

#### Police Controller
Manages police control checkpoints.

### Dependencies (pom.xml)
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
</parent>

<properties>
    <java.version>17</java.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.dataformat</groupId>
        <artifactId>jackson-dataformat-xml</artifactId>
    </dependency>
    <dependency>
        <groupId>org.json</groupId>
        <artifactId>json</artifactId>
    </dependency>
</dependencies>
```

---

## Node-RED Backend - Workflow Automation

### Purpose
Node-RED provides visual workflow automation connecting all microservices.

### Configuration
```yaml
node-red:
  image: nodered/node-red:latest
  container_name: backend
  ports:
    - "6903:1880"
  volumes:
    - ./backend/node_red_data:/data
  environment:
    - TZ=Europe/Madrid
```

### Flow Persistence
Flows are stored in `backend/node_red_data/`:
- `flows.json` - Flow definitions
- `flows_cred.json` - Credentials
- `settings.js` - Node-RED settings

---

## Database - MySQL

### Configuration
```yaml
mysql:
  image: mysql:8
  container_name: mysql
  environment:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: crai
    MYSQL_USER: crai_user
    MYSQL_PASSWORD: crai_pass
  ports:
    - "6900:3306"
  volumes:
    - mysql_data:/var/lib/mysql
    - ./db/createCraiDB.sql:/docker-entrypoint-initdb.d/01_createCraiDB.sql:ro
```

### Initialization
The database is initialized with `db/createCraiDB.sql` on first start.
- Must be exactly 7 characters
- Format: 4 digits followed by 3 consonants
- Consonants: B,C,D,F,G,H,J,K,L,M,N,P,Q,R,S,T,V,W,X,Y,Z
- Automatically uppercased and sanitized

**Error Response (Invalid Plate):**
```json
{
  "carPlate": null,
  "badge": null
}
```

### Configuration

**File:** `conf/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_TITLE: str = "Environmental Badge API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    API_TAGS: List[str] = ["EB API"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Service Layer

**File:** `service/service.py`

```python
class EnvironmentalBadgeService:
    def validate_plate(self, carPlate: str) -> str | None:
        """
        Validate Spanish plate format: NNNNLLL
        
        Args:
            carPlate: License plate to validate
            
        Returns:
            Formatted plate or None if invalid
        """
        pattern = r"^\d{4}[B-DF-HJ-NP-TV-Z]{3}$"
        formatted = carPlate.upper().strip()
        
        if re.match(pattern, formatted):
            return formatted
        return None
    
    def get_badge_by_plate(self, carPlate: str) -> dict:
        """
        Get environmental badge for license plate
        
        Returns:
            {carPlate, badge: {vehicleType, badge, STOL}}
        """
        validated = self.validate_plate(carPlate)
        if not validated:
            return {"carPlate": None, "badge": None}
        
        badge_code = get_badge_from_plate(validated, file_path)
        if not badge_code:
            return {"carPlate": validated, "badge": None}
        
        badge_data = self.convert_badge_code_to_name(badge_code)
        return {"carPlate": validated, "badge": badge_data}
    
    def convert_badge_code_to_name(self, badge_code: str) -> dict:
        """
        Parse badge code: "16TB" → {vehicleType: "turism", badge: "B"}
        
        Formats:
        - 16TB: vehicle type 16 (turism), badge B
        - SIN DISTINTIVO: no badge (returns 'n')
        """
        if badge_code == "SIN DISTINTIVO":
            return {"vehicleType": None, "badge": "n", "STOL": ""}
        
        # Parse "16TB" format
        vehicle_type = badge_code[:2]  # "16"
        badge = badge_code[2:]         # "TB" → "B"
        
        type_map = {
            "16": "turism",
            "17": "commercial",
            # ... more mappings
        }
        
        return {
            "vehicleType": type_map.get(vehicle_type, "unknown"),
            "badge": badge[-1] if badge else "n",
            "STOL": ""
        }
```

### Dataset Management

#### Auto-Extraction on Startup

**File:** `main.py`

```python
import py7zr
import os
from pathlib import Path

# Auto-extract dataset if not present
DATA_DIR = Path(__file__).parent / "data"
ARCHIVE_PATH = DATA_DIR / "environmentalBadge.7z"
EXTRACTED_PATH = DATA_DIR / "environmentalBadge.txt"

if not EXTRACTED_PATH.exists() and ARCHIVE_PATH.exists():
    print("Extracting environmental badge dataset...")
    with py7zr.SevenZipFile(ARCHIVE_PATH, mode='r') as archive:
        archive.extractall(path=DATA_DIR)
    print("Dataset extracted successfully!")

# FastAPI app initialization
app = FastAPI(title=settings.API_TITLE, version=settings.API_VERSION)
```

#### Dataset Optimization

**File:** `util/optimize_dataset.py`

Cleans and optimizes the raw dataset:

```python
import pandas as pd

def optimize_dataset(input_file, output_file):
    """
    Optimize environmental badge dataset:
    1. Read pipe-delimited file
    2. Rename columns to PLATE, BADGE
    3. Remove duplicates
    4. Sort by plate
    5. Remove "16" prefix from badges
    6. Replace "SIN DISTINTIVO" → "n"
    7. Add STOL column
    8. Save as CSV with headers
    """
    df = pd.read_csv(input_file, sep='|', header=None)
    df.columns = ['PLATE', 'BADGE']  # Rename immediately
    
    df = df.drop_duplicates(subset=['PLATE'])
    df = df.sort_values('PLATE')
    df['BADGE'] = df['BADGE'].str.replace('^16', '', regex=True)
    df['BADGE'] = df['BADGE'].replace('SIN DISTINTIVO', 'n')
    df['STOL'] = ''
    
    df.to_csv(output_file, sep='|', header=True, index=False)
```

#### Missing Plate Generation

**File:** `util/generate_complete_dataset.py`

Generates missing Spanish license plates:

```python
import itertools

CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ"

def generate_missing_plates(existing_df, start="0000BBB", end="0000PPP"):
    """
    Generate all possible Spanish plates in range:
    - Format: NNNNLLL (4 digits, 3 consonants)
    - Start: 0000BBB
    - End: 0000PPP
    - Missing plates assigned badge='n'
    """
    all_plates = []
    
    for c1, c2, c3 in itertools.product(CONSONANTS, repeat=3):
        plate = f"0000{c1}{c2}{c3}"
        if plate > end:
            break
        if plate >= start:
            all_plates.append(plate)
    
    existing_plates = set(existing_df['PLATE'])
    missing_plates = [p for p in all_plates if p not in existing_plates]
    
    # Add missing with badge='n'
    missing_df = pd.DataFrame({
        'PLATE': missing_plates,
        'BADGE': 'n',
        'STOL': ''
    })
    
    return pd.concat([existing_df, missing_df]).sort_values('PLATE')
```

### CSV Lookup Utility

**File:** `util/get_badge_from_plates.py`

```python
import pandas as pd

def get_badge_from_plate(carPlate: str, file_path: str) -> str | None:
    """
    Lookup badge from CSV file
    
    Args:
        carPlate: Formatted Spanish license plate
        file_path: Path to environmentalBadge.txt
        
    Returns:
        Badge code string or None if not found
    """
    df = pd.read_csv(file_path, sep='|')
    formatted_plate = carPlate.upper().strip()
    
    result = df[df['PLATE'] == formatted_plate]
    
    if not result.empty:
        return result.iloc[0]['BADGE']
    return None
```

### Docker Configuration

**File:** `ebAPI/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install uvicorn with standard extras
RUN pip install "uvicorn[standard]"

# Copy application
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Dependencies (requirements.txt):**
```
fastapi
pydantic-settings
pandas
py7zr
termcolor
```

### Testing

Run ebAPI locally:
```bash
cd ebAPI
pip install -r requirements.txt
uvicorn main:app --reload --port 6904
```

Test endpoint:
```bash
# Valid Spanish plate
curl "http://localhost:6904/api?carPlate=1234ABC"

# Invalid format
curl "http://localhost:6904/api?carPlate=INVALID"

# View API documentation
open http://localhost:6904/docs
```

## AI Service - ANPR Processing

### Core Components

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

## Service Comparison

| Feature | AI Service | ebAPI Service |
|---------|-----------|---------------|
| **Port** | 6902 | 6904 |
| **Purpose** | ANPR / Plate Recognition | Environmental Badge Lookup |
| **Technology** | Python 3.11+ | Python 3.11-slim |
| **Key Libraries** | OpenCV, pytesseract | pandas, py7zr |
| **Input** | Image file (multipart/form-data) | License plate string (query param) |
| **Output** | {plate_number, confidence} | {carPlate, badge: {...}} |
| **Processing** | Computer vision, OCR | CSV lookup, validation |
| **Dataset** | AI models (in development) | 4M+ vehicle records (592MB) |
| **Docker Image Size** | ~800MB (with OpenCV) | ~200MB (slim) |
| **Tests** | 17 passing (pytest, 100%) | Integration tests |
| **Startup Time** | ~5 seconds | ~2 seconds (+ extraction if needed) |

## Integration Example

Typical workflow combining both services:

```python
# 1. User uploads vehicle image
image_file = request.files['image']

# 2. AI Service recognizes plate
ai_response = requests.post(
    "http://ai:6902/api/recognize",
    files={"image": image_file}
)
plate_number = ai_response.json()["plate_number"]  # "1234ABC"

# 3. ebAPI Service looks up badge
badge_response = requests.get(
    f"http://ebapi:6904/api?carPlate={plate_number}"
)
badge_info = badge_response.json()["badge"]  # {vehicleType, badge}

# 4. Return combined result
return {
    "plate": plate_number,
    "confidence": ai_response.json()["confidence"],
    "environmentalBadge": badge_info["badge"],  # "B"
    "vehicleType": badge_info["vehicleType"]     # "turism"
}
```

This can be orchestrated through Node-RED flows for complex workflows.

## Next Steps

- Explore [AI API Endpoints](/api/endpoints/) for ANPR recognition
- Review [ebAPI Endpoints](/api/ebapi-endpoints/) for badge lookup
- Learn about [Testing Strategy](/testing/backend/) for both services
- Set up [Dataset Management](/guides/dataset-management/) for environmental badge data
- Configure [Docker Setup](/architecture/docker/) for multi-service deployment
