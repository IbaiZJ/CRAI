---
title: API Overview
description: Overview of the CRAI REST API
---

The CRAI API is a RESTful API built with FastAPI that provides endpoints for license plate recognition and system management.

## Base URL

```
Development: http://localhost:6902
Production: https://api.your-domain.com
```

## API Endpoints

### Health & Status

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

### Recognition Endpoints

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

## Interactive Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:6902/docs
- **ReDoc**: http://localhost:6902/redoc
- **OpenAPI JSON**: http://localhost:6902/openapi.json

## Authentication

Currently, the API does not require authentication. Future versions will include:
- API Key authentication
- JWT tokens
- OAuth2

## Rate Limiting

Rate limiting is planned for future releases:
- 100 requests per minute per IP
- 1000 requests per hour per IP

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (frontend development)
- `http://localhost:3000` (alternative frontend port)
- Production domain (to be configured)

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

### cURL Examples

```bash
# Health check
curl http://localhost:6902/api/health

# Hello endpoint
curl http://localhost:6902/api/hello

# Recognize plate
curl -X POST http://localhost:6902/api/recognize \
  -F "image=@/path/to/image.jpg"
```

### Python Examples

```python
import requests

# Health check
response = requests.get("http://localhost:6902/api/health")
print(response.json())

# Recognize plate
with open("image.jpg", "rb") as f:
    files = {"image": f}
    response = requests.post(
        "http://localhost:6902/api/recognize",
        files=files
    )
    print(response.json())
```

### JavaScript Examples

```javascript
// Using Fetch API
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:6902/api/recognize', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Using Axios
import axios from 'axios';

const formData = new FormData();
formData.append('image', file);

axios.post('http://localhost:6902/api/recognize', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

## API Versioning

Currently at version 1.0.0. Future versions will use URL-based versioning:
- v1: `/api/v1/...`
- v2: `/api/v2/...`

## Next Steps

- Explore [API Endpoints](/api/endpoints/) in detail
- View [API Models](/api/models/)
- Learn about [Authentication](/api/authentication/)
