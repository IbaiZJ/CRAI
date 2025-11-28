---
title: ebAPI Endpoints
description: Environmental Badge API endpoints for Spanish license plate classification lookup
---

The ebAPI service provides environmental badge lookup for Spanish vehicles. It validates license plate format and returns classification data from a comprehensive 4M+ vehicle dataset.

## Base URL

```
Development: http://localhost:6904
Production: https://ebapi.your-domain.com
```

## Authentication

Currently, the ebAPI does not require authentication. All endpoints are publicly accessible.

## API Endpoint

### GET /api

Look up environmental badge for a Spanish license plate.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `carPlate` | string | Yes | Spanish license plate (NNNNLLL format) |

**Request Example:**

```bash
curl "http://localhost:6904/api?carPlate=1234ABC"
```

**Success Response (200 OK):**

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

**Not Found Response (200 OK):**

When plate is valid but not in dataset:

```json
{
  "carPlate": "1234ABC",
  "badge": null
}
```

**Invalid Plate Response (200 OK):**

When plate format is invalid:

```json
{
  "carPlate": null,
  "badge": null
}
```

## Response Schema

### BadgeData Object

| Field | Type | Description |
|-------|------|-------------|
| `vehicleType` | string | Vehicle category (e.g., "turism", "commercial") |
| `badge` | string | Environmental badge classification |
| `STOL` | string | Additional classification (usually empty) |

### Badge Classifications

Spanish environmental badge system:

| Badge | Name | Description |
|-------|------|-------------|
| `0` | Cero emisiones | Zero emissions (electric, hydrogen) |
| `ECO` | ECO | Efficient hybrid and alternative fuel vehicles |
| `C` | C | Vehicles meeting Euro 4/5/6 standards |
| `B` | B | Older vehicles meeting Euro 3/4 standards |
| `n` | Sin distintivo | No badge - high-emission vehicles |

## Spanish License Plate Format

### Validation Rules

Spanish plates must follow the **NNNNLLL** format:
- 4 digits (0-9)
- 3 consonants (excluding vowels A, E, I, O, U)

**Valid consonants:** B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z

### Examples

**Valid plates:**
- `1234ABC` ✅
- `0000BBB` ✅
- `9999ZZZ` ✅
- `5678XYZ` ✅

**Invalid plates:**
- `ABCD123` ❌ (letters before numbers)
- `1234AEI` ❌ (contains vowels)
- `123ABC` ❌ (only 3 digits)
- `12345AB` ❌ (5 digits, 2 letters)

### Format Processing

The API automatically:
- Converts to uppercase
- Trims whitespace
- Validates format with regex: `^\d{4}[B-DF-HJ-NP-TV-Z]{3}$`

## Badge Code Parsing

Raw badge codes from the dataset are parsed into structured format.

### Code Format

Badge codes follow the pattern: `[VehicleType][Badge]`

Examples:
- `16TB` → Vehicle type 16 (turism), Badge B
- `17TC` → Vehicle type 17 (commercial), Badge C
- `16TECO` → Vehicle type 16 (turism), Badge ECO

### Vehicle Type Mapping

| Code | Vehicle Type |
|------|--------------|
| `16` | turism |
| `17` | commercial |
| `18` | motorcycle |
| _other_ | unknown |

### Special Cases

- `SIN DISTINTIVO` → `{vehicleType: null, badge: "n", STOL: ""}`
- Empty or null badge code → `badge: "n"`

## Request Examples

### cURL

```bash
# Basic request
curl "http://localhost:6904/api?carPlate=1234ABC"

# With JSON output formatting
curl -s "http://localhost:6904/api?carPlate=1234ABC" | jq

# Multiple requests
curl "http://localhost:6904/api?carPlate=1234ABC"
curl "http://localhost:6904/api?carPlate=5678XYZ"
```

### Python

```python
import requests

def get_badge(plate: str) -> dict:
    """Get environmental badge for Spanish plate"""
    response = requests.get(
        "http://localhost:6904/api",
        params={"carPlate": plate}
    )
    return response.json()

# Example usage
result = get_badge("1234ABC")
print(f"Plate: {result['carPlate']}")
print(f"Badge: {result['badge']['badge']}")
print(f"Vehicle Type: {result['badge']['vehicleType']}")
```

### JavaScript/TypeScript

```typescript
interface BadgeResponse {
  carPlate: string | null;
  badge: {
    vehicleType: string;
    badge: string;
    STOL: string;
  } | null;
}

async function getBadge(plate: string): Promise<BadgeResponse> {
  const response = await fetch(
    `http://localhost:6904/api?carPlate=${encodeURIComponent(plate)}`
  );
  return response.json();
}

// Example usage
const result = await getBadge("1234ABC");
if (result.badge) {
  console.log(`Badge: ${result.badge.badge}`);
  console.log(`Type: ${result.badge.vehicleType}`);
} else {
  console.log("Badge not found");
}
```

### Node-RED

**HTTP Request Node Configuration:**

```
Method: GET
URL: http://ebapi_service:8000/api
Add query parameter:
  - Name: carPlate
  - Value: {{payload.plate}}
```

**Function Node (Parse Response):**

```javascript
const response = msg.payload;

if (response.badge) {
    msg.payload = {
        plate: response.carPlate,
        badge: response.badge.badge,
        vehicleType: response.badge.vehicleType,
        hasValidBadge: response.badge.badge !== 'n'
    };
} else {
    msg.payload = {
        plate: response.carPlate,
        error: "Badge not found"
    };
}

return msg;
```

## Error Handling

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | Success (includes invalid plate cases) |
| `422` | Validation error (missing query parameter) |
| `500` | Internal server error |

### Error Response Format

**Missing query parameter (422):**

```json
{
  "detail": [
    {
      "loc": ["query", "carPlate"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Interactive Documentation

The ebAPI provides interactive Swagger documentation:

**Swagger UI:** http://localhost:6904/docs

Features:
- Try out endpoints directly
- View request/response schemas
- See example values
- Test with different inputs

**ReDoc:** http://localhost:6904/redoc

Alternative documentation format with better readability.

## Rate Limiting

Currently no rate limiting is implemented. Future versions may include:
- Per-IP rate limits
- API key authentication
- Request throttling

## Dataset Information

### Size and Format

- **Compressed:** 40MB (environmentalBadge.7z)
- **Extracted:** 592MB (environmentalBadge.txt)
- **Format:** Pipe-delimited CSV (`|`)
- **Records:** 4,000,000+ Spanish vehicles

### Auto-Extraction

On first startup, ebAPI automatically:
1. Checks if `data/environmentalBadge.txt` exists
2. If not, extracts from `data/environmentalBadge.7z`
3. Loads dataset into memory with pandas
4. Ready to serve requests

### Dataset Structure

```
PLATE|BADGE|STOL
0000BBB|n|
0000BBC|n|
1234ABC|16TB|
5678XYZ|17TC|
```

## Performance

### Lookup Speed

- Average lookup time: <10ms
- Loaded into pandas DataFrame
- Efficient indexing by plate number

### Caching

Currently no caching layer. Recommendations:
- Add Redis for frequently accessed plates
- Implement in-memory LRU cache
- Cache negative results (not found)

## Integration with AI Service

Typical workflow combining ANPR and badge lookup:

```python
import requests

# 1. Recognize plate from image
ai_response = requests.post(
    "http://localhost:6902/api/recognize",
    files={"image": open("vehicle.jpg", "rb")}
)
plate = ai_response.json()["plate_number"]  # "1234ABC"

# 2. Look up environmental badge
badge_response = requests.get(
    f"http://localhost:6904/api?carPlate={plate}"
)
badge = badge_response.json()["badge"]

# 3. Combined result
result = {
    "plate": plate,
    "confidence": ai_response.json()["confidence"],
    "badge": badge["badge"],
    "vehicleType": badge["vehicleType"]
}
```

## Next Steps

- Review [Backend Architecture](/architecture/backend/) for implementation details
- Learn about [Dataset Management](/guides/dataset-management/)
- Explore [API Overview](/api/overview/) for all services
- Set up [Docker environment](/architecture/docker/) for development
