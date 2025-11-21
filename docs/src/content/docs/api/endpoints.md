---
title: API Endpoints
description: Detailed documentation of all API endpoints
---

Complete reference of all available API endpoints in CRAI.

## Endpoints List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root information |
| GET | `/api/health` | Health check |
| GET | `/api/hello` | Test endpoint |
| POST | `/api/recognize` | Recognize license plate |

## Root Endpoint

### GET /

Returns basic API information.

**Response 200:**
```json
{
  "message": "CRAI API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

## Health Endpoints

### GET /api/health

Check if the API is running and healthy.

**Response 200:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### GET /api/hello

Simple test endpoint.

**Response 200:**
```json
{
  "message": "Hello World"
}
```

## Recognition Endpoints

### POST /api/recognize

Recognize license plate from an uploaded image.

**Parameters:**
- `image` (file, required): Image file containing a license plate

**Accepted formats:** JPG, JPEG, PNG, WEBP

**Request:**
```http
POST /api/recognize HTTP/1.1
Content-Type: multipart/form-data
```

**Response 200:**
```json
{
  "plate_number": "ABC-1234",
  "confidence": 0.95,
  "processing_time": 0.123,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "detail": "File must be an image"
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": [
    {
      "loc": ["body", "image"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Examples

### Using cURL

```bash
curl -X POST "http://localhost:6902/api/recognize" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/image.jpg"
```

### Using Python

```python
import requests

url = "http://localhost:6902/api/recognize"

with open("image.jpg", "rb") as f:
    files = {"image": ("image.jpg", f, "image/jpeg")}
    response = requests.post(url, files=files)
    
print(response.json())
```

### Using JavaScript

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:6902/api/recognize', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

## Next Steps

- View [API Models](/api/models/)
- Learn about [Authentication](/api/authentication/)
