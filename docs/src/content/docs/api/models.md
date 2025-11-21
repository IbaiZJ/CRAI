---
title: API Models
description: Data models and schemas used in the CRAI API
---

Pydantic models and schemas used for request/response validation.

## Request Models

### PlateRecognitionRequest

```python
class PlateRecognitionRequest(BaseModel):
    image_data: str = Field(..., description="Base64 encoded image")
```

## Response Models

### PlateRecognitionResponse

```python
class PlateRecognitionResponse(BaseModel):
    plate_number: str = Field(..., description="Recognized plate number")
    confidence: float = Field(..., ge=0.0, le=1.0)
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: datetime = Field(default_factory=datetime.now)
```

**Example:**
```json
{
  "plate_number": "ABC-1234",
  "confidence": 0.95,
  "processing_time": 0.123,
  "timestamp": "2024-01-01T12:00:00"
}
```

### HealthResponse

```python
class HealthResponse(BaseModel):
    status: str
    version: str
```

**Example:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### ErrorResponse

```python
class ErrorResponse(BaseModel):
    detail: str
    status_code: int
```

**Example:**
```json
{
  "detail": "File must be an image",
  "status_code": 400
}
```

## Field Validation

### Plate Number Format
- Pattern: Letters and numbers with optional separator
- Example: `ABC-1234`, `XYZ123`, `AB-12-CD`

### Confidence Score
- Type: Float
- Range: 0.0 to 1.0
- Represents recognition confidence percentage

### Processing Time
- Type: Float
- Unit: Seconds
- Typical range: 0.1 to 2.0 seconds

## Next Steps

- Explore [API Endpoints](/api/endpoints/)
- Learn about [Authentication](/api/authentication/)
