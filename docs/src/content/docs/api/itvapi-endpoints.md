---
title: itvAPI Endpoints
description: ITV Date API endpoints for Spanish vehicle technical inspection date lookup
---

The itvAPI service provides ITV (Inspección Técnica de Vehículos) date lookup for Spanish vehicles. It validates license plate format and returns the next inspection date from the dataset.

## Base URL

```
Development: http://localhost:6905
```

## Authentication

Currently, the itvAPI does not require authentication. All endpoints are publicly accessible.

## API Endpoint

### GET /api

Look up ITV inspection date for a Spanish license plate.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `carPlate` | string | Yes | Spanish license plate (NNNNLLL format) |

**Request Example:**

```bash
curl "http://localhost:6905/api?carPlate=1234ABC"
```

**Success Response (200 OK):**

```json
{
  "carPlate": "1234ABC",
  "itv_date": "2025-06-15"
}
```

**Not Found Response (200 OK):**

When plate is valid but not in dataset:

```json
{
  "carPlate": "1234ABC",
  "itv_date": null
}
```

**Invalid Plate Response (200 OK):**

When plate format is invalid:

```json
{
  "carPlate": null,
  "itv_date": null
}
```

## Response Schema

### ITVResponse Object

| Field | Type | Description |
|-------|------|-------------|
| `carPlate` | string \| null | Validated license plate or null if invalid |
| `itv_date` | string \| null | ITV expiration date (YYYY-MM-DD) or null |

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

## Request Examples

### cURL

```bash
# Basic request
curl "http://localhost:6905/api?carPlate=1234ABC"

# With JSON output formatting
curl -s "http://localhost:6905/api?carPlate=1234ABC" | jq

# Multiple requests
for plate in 1234ABC 5678XYZ 9999ZZZ; do
  curl -s "http://localhost:6905/api?carPlate=$plate"
  echo
done
```

### Python

```python
import requests

def get_itv_date(plate: str) -> dict:
    """Get ITV inspection date for Spanish plate"""
    response = requests.get(
        "http://localhost:6905/api",
        params={"carPlate": plate}
    )
    return response.json()

# Example usage
result = get_itv_date("1234ABC")
print(f"Plate: {result['carPlate']}")
print(f"ITV Date: {result['itv_date']}")

# Check if ITV is expired
from datetime import datetime
if result['itv_date']:
    itv_date = datetime.strptime(result['itv_date'], "%Y-%m-%d")
    if itv_date < datetime.now():
        print("⚠️ ITV expired!")
    else:
        print("✅ ITV valid")
```

### JavaScript/TypeScript

```typescript
interface ITVResponse {
  carPlate: string | null;
  itv_date: string | null;
}

async function getITVDate(plate: string): Promise<ITVResponse> {
  const response = await fetch(
    `http://localhost:6905/api?carPlate=${plate}`
  );
  return response.json();
}

// Example usage
const result = await getITVDate("1234ABC");
console.log(`Plate: ${result.carPlate}`);
console.log(`ITV Date: ${result.itv_date}`);

// Check if expired
if (result.itv_date) {
  const itvDate = new Date(result.itv_date);
  const isExpired = itvDate < new Date();
  console.log(isExpired ? "⚠️ ITV expired!" : "✅ ITV valid");
}
```

## Interactive Documentation

The itvAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:6905/docs
- **ReDoc**: http://localhost:6905/redoc
- **OpenAPI JSON**: http://localhost:6905/openapi.json

## Service Architecture

### Project Structure

```
itvAPI/
├── main.py                # FastAPI application
├── conf/
│   └── config.py          # Settings
├── routers/
│   └── router.py          # API endpoint
├── service/
│   └── service.py         # ITV lookup service
├── util/
│   └── util.py            # Dataset extraction
├── data/
│   └── itv_dates.7z       # Compressed dataset
├── tests/
├── requirements.txt
└── Dockerfile
```

### Startup Behavior

On application startup, the service:
1. Checks for extracted dataset file
2. If not present, extracts from `.7z` archive
3. Loads dataset into memory for fast lookups

## Integration with CRAI

The itvAPI is typically called via Node-RED workflows:

```
AI Service → Node-RED → itvAPI
   │            │           │
   └── plate ───┴───────────┴─► ITV date lookup
```

### Node-RED Integration Example

```javascript
// Node-RED function node
const plate = msg.payload.plate;
const url = `http://itvAPI:8000/api?carPlate=${plate}`;

msg.url = url;
return msg;
```

## Error Handling

The API follows consistent error handling:

| Scenario | carPlate | itv_date |
|----------|----------|----------|
| Valid plate, found | `"1234ABC"` | `"2025-06-15"` |
| Valid plate, not found | `"1234ABC"` | `null` |
| Invalid plate format | `null` | `null` |

## Performance

- **Average response time**: < 50ms
- **Dataset size**: Varies by deployment
- **Memory usage**: Dataset loaded in memory
- **Concurrent requests**: Handles multiple parallel requests

## Next Steps

- View [ebAPI Endpoints](/api/ebapi-endpoints/) for environmental badge lookup
- Learn about [API Overview](/api/overview/) for all services
- Explore [Architecture](/architecture/overview/) for service integration
