---
title: API Overview
description: Overview of the CRAI REST API
---

CRAI provides two independent RESTful APIs built with FastAPI: the **AI Service** for automatic number plate recognition (ANPR) and the **ebAPI Service** for Spanish environmental badge lookup.

## Services Overview

### AI Service - ANPR

**Purpose:** Automatic Number Plate Recognition from images

**Base URL:**
```
Development: http://localhost:6902
Production: https://ai.your-domain.com
```

**Key Features:**
- Image-based plate recognition
- OpenCV preprocessing
- OCR character recognition
- Confidence scoring

### ebAPI Service - Environmental Badge Lookup

**Purpose:** Spanish vehicle environmental classification lookup

**Base URL:**
```
Development: http://localhost:6904
Production: https://ebapi.your-domain.com
```

**Key Features:**
- Spanish plate validation (NNNNLLL format)
- 4M+ vehicle badge database
- Badge classification (0, ECO, C, B, n)
- Fast CSV-based lookup

## API Endpoints Summary

### AI Service Endpoints (Port 6902)

#### GET /
Root endpoint with API information

**Response:**
```json
{
  "message": "CRAI API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

#### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

#### GET /api/hello
Simple test endpoint

**Response:**
```json
{
  "message": "Hello World"
}
```

#### POST /api/recognize
Recognize license plate from uploaded image

**Request:**
```http
POST /api/recognize
Content-Type: multipart/form-data

image: <file>
```

**Response:**
```json
{
  "plate_number": "ABC-1234",
  "confidence": 0.95,
  "processing_time": 0.123,
  "timestamp": "2024-01-01T12:00:00"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid file type
{
  "detail": "File must be an image"
}

// 422 Unprocessable Entity - Validation error
{
  "detail": [
    {
      "loc": ["body", "image"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}

// 500 Internal Server Error
{
  "detail": "Internal server error"
}
```

### ebAPI Service Endpoints (Port 6904)

#### GET /api
Look up environmental badge for Spanish license plate

**Query Parameters:**
- `carPlate` (required): Spanish license plate in NNNNLLL format

**Request:**
```http
GET /api?carPlate=1234ABC
```

**Success Response:**
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

**Badge Classifications:**
- `0`: Zero emissions (electric, hydrogen)
- `ECO`: Efficient hybrid vehicles
- `C`: Euro 4/5/6 standards
- `B`: Euro 3/4 standards
- `n`: No badge (high emissions)

**Not Found Response:**
```json
{
  "carPlate": "1234ABC",
  "badge": null
}
```

**Invalid Plate Response:**
```json
{
  "carPlate": null,
  "badge": null
}
```

## Interactive Documentation

Both services provide automatic interactive API documentation via Swagger UI and ReDoc.

### AI Service Documentation

- **Swagger UI**: http://localhost:6902/docs
- **ReDoc**: http://localhost:6902/redoc
- **OpenAPI JSON**: http://localhost:6902/openapi.json

### ebAPI Service Documentation

- **Swagger UI**: http://localhost:6904/docs
- **ReDoc**: http://localhost:6904/redoc
- **OpenAPI JSON**: http://localhost:6904/openapi.json

## Authentication

Currently, both APIs do not require authentication. All endpoints are publicly accessible.

**Future Plans:**
- API Key authentication
- JWT tokens
- OAuth2 integration
- Service-to-service authentication

## Rate Limiting

Rate limiting is planned for future releases:

**Proposed Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per IP
- Separate limits for ANPR vs badge lookup
- Higher limits for authenticated users

## CORS

Both services are configured with CORS to allow requests from:
- `http://localhost:6901` (frontend on Docker)
- `http://localhost:5173` (frontend dev server)
- `http://localhost:3000` (alternative port)
- Production domain (to be configured)

**Configuration Example:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:6901", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error Handling

All API errors follow this structure:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Request/Response Examples

### AI Service (ANPR) - cURL

```bash
# Health check
curl http://localhost:6902/api/health

# Hello endpoint
curl http://localhost:6902/api/hello

# Recognize plate from image
curl -X POST http://localhost:6902/api/recognize \
  -F "image=@/path/to/vehicle.jpg"
```

### ebAPI Service (Badge Lookup) - cURL

```bash
# Look up badge for Spanish plate
curl "http://localhost:6904/api?carPlate=1234ABC"

# Multiple lookups
curl "http://localhost:6904/api?carPlate=5678XYZ"
curl "http://localhost:6904/api?carPlate=0000BBB"

# With JSON formatting
curl -s "http://localhost:6904/api?carPlate=1234ABC" | jq
```

### Python Examples

```python
import requests

# AI Service - Recognize plate
with open("vehicle.jpg", "rb") as f:
    files = {"image": f}
    ai_response = requests.post(
        "http://localhost:6902/api/recognize",
        files=files
    )
    plate = ai_response.json()["plate_number"]
    print(f"Recognized: {plate}")

# ebAPI Service - Look up badge
badge_response = requests.get(
    "http://localhost:6904/api",
    params={"carPlate": plate}
)
badge = badge_response.json()
print(f"Badge: {badge['badge']['badge']}")
print(f"Type: {badge['badge']['vehicleType']}")
```

### Combined Workflow (Python)

```python
import requests

def process_vehicle_image(image_path: str) -> dict:
    """
    Complete workflow: Recognize plate and look up badge
    """
    # Step 1: ANPR Recognition
    with open(image_path, "rb") as f:
        ai_response = requests.post(
            "http://localhost:6902/api/recognize",
            files={"image": f}
        )
    
    ai_data = ai_response.json()
    plate = ai_data["plate_number"]
    
    # Step 2: Badge Lookup
    badge_response = requests.get(
        f"http://localhost:6904/api?carPlate={plate}"
    )
    
    badge_data = badge_response.json()
    
    # Step 3: Combined Result
    return {
        "plate": plate,
        "confidence": ai_data["confidence"],
        "badge": badge_data["badge"]["badge"] if badge_data["badge"] else None,
        "vehicleType": badge_data["badge"]["vehicleType"] if badge_data["badge"] else None
    }

# Usage
result = process_vehicle_image("vehicle.jpg")
print(result)
```

### JavaScript/TypeScript Examples

```typescript
// AI Service - Recognize plate
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const aiResponse = await fetch('http://localhost:6902/api/recognize', {
  method: 'POST',
  body: formData
});
const aiData = await aiResponse.json();
console.log(`Plate: ${aiData.plate_number}`);

// ebAPI Service - Look up badge
const badgeResponse = await fetch(
  `http://localhost:6904/api?carPlate=${aiData.plate_number}`
);
const badgeData = await badgeResponse.json();
console.log(`Badge: ${badgeData.badge.badge}`);
```

### Node-RED Integration

**Flow Example: Complete Vehicle Processing**

```
[Inject] → [HTTP Request: AI] → [Parse Plate] → [HTTP Request: ebAPI] → [Combine Data] → [Debug]
```

**AI Service HTTP Request Node:**
```
Method: POST
URL: http://ai_service:8000/api/recognize
Body type: multipart/form-data
```

**ebAPI HTTP Request Node:**
```
Method: GET
URL: http://ebapi_service:8000/api
Add query parameter: carPlate={{plate}}
```

**Function Node (Combine Results):**
```javascript
msg.payload = {
    plate: msg.plateNumber,
    confidence: msg.aiConfidence,
    badge: msg.badgeData.badge.badge,
    vehicleType: msg.badgeData.badge.vehicleType,
    timestamp: new Date().toISOString()
};
return msg;
```

## API Comparison

| Feature | AI Service | ebAPI Service |
|---------|-----------|---------------|
| **Purpose** | Plate recognition from images | Badge lookup for Spanish plates |
| **Port** | 6902 | 6904 |
| **Input Type** | Image file (multipart) | Query parameter (string) |
| **Processing** | Computer vision + OCR | Dataset lookup |
| **Response Time** | ~1-3 seconds | <10ms |
| **Requires Upload** | Yes | No |
| **Stateless** | Yes | Yes |
| **Database** | AI models | 4M+ CSV records |

## API Versioning

Both services are currently at version 1.0.0. Future versions will use URL-based versioning:
- v1: `/api/v1/...`
- v2: `/api/v2/...`

## Use Cases

### 1. Complete Vehicle Processing
Recognize plate from image + lookup environmental badge
- Input: Vehicle image
- Output: Plate number, confidence, badge, vehicle type

### 2. Manual Badge Lookup
User enters plate manually, system returns badge
- Input: License plate string
- Output: Badge classification

### 3. Automated Toll/Parking System
- Camera captures vehicle image → AI recognizes plate
- System looks up badge for emission-based pricing
- Apply discount for ECO/0 badges

### 4. Traffic Management
- Recognize plates in traffic cameras
- Filter by environmental badge
- Restrict access by badge type (low emission zones)

### 5. Fleet Management
- Bulk plate recognition from images
- Batch badge lookup for fleet vehicles
- Generate compliance reports

## Performance Best Practices

### AI Service Optimization
- Resize images before upload (max 2MB recommended)
- Use JPEG format for smaller file size
- Crop to plate region if known
- Adjust brightness/contrast for better recognition

### ebAPI Service Optimization
- Validate plate format client-side before API call
- Cache frequently accessed badges (e.g., Redis)
- Batch lookups if processing multiple plates
- Use uppercase plates (API does this automatically)

## Error Handling Best Practices

```python
import requests

def safe_badge_lookup(plate: str) -> dict:
    """Safe badge lookup with error handling"""
    try:
        response = requests.get(
            "http://localhost:6904/api",
            params={"carPlate": plate},
            timeout=5
        )
        response.raise_for_status()
        
        data = response.json()
        
        if data["carPlate"] is None:
            return {"error": "Invalid plate format"}
        
        if data["badge"] is None:
            return {"error": "Badge not found", "plate": data["carPlate"]}
        
        return {"success": True, "data": data}
        
    except requests.exceptions.Timeout:
        return {"error": "Request timeout"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
```

## Next Steps

- Deep dive into [AI API Endpoints](/api/endpoints/) for ANPR details
- Explore [ebAPI Endpoints](/api/ebapi-endpoints/) for badge lookup
- Learn about [Backend Architecture](/architecture/backend/)
- Review [Testing Strategies](/testing/overview/)
- Set up [Development Environment](/getting-started/installation/)
