---
title: ebAPI Endpoints
description: Environmental Badge API endpoints for Spanish vehicle classification
---

Complete reference of all endpoints in the ebAPI service (Environmental Badge API).

**Base URL:** `http://localhost:6904`

## Endpoints List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | Look up environmental badge |
| GET | `/docs` | Swagger UI documentation |
| GET | `/redoc` | ReDoc documentation |

## Badge Lookup

### GET /api

Look up the environmental badge classification for a Spanish vehicle by its license plate.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `carPlate` | string | Yes | Spanish license plate number |

**Request:**
```http
GET /api?carPlate=1234ABC HTTP/1.1
Host: localhost:6904
```

**Response 200:**
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

### Badge Types

Spanish environmental badges:

| Badge | Color | Description |
|-------|-------|-------------|
| `0` | Blue | Zero emissions (electric, hydrogen) |
| `ECO` | Blue/Green | Hybrid, CNG, LPG |
| `C` | Green | Gasoline from 2006, Diesel from 2014 |
| `B` | Yellow | Gasoline from 2000, Diesel from 2006 |
| None | - | Older vehicles |

### Vehicle Types

| Type | Description |
|------|-------------|
| `turism` | Passenger car |
| `motocicleta` | Motorcycle |
| `furgoneta` | Van |
| `camion` | Truck |

**Error Responses:**

**422 Unprocessable Entity:**
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

**404 Not Found:**
```json
{
  "detail": "Vehicle not found in database"
}
```

## Examples

### Using cURL

```bash
# Basic lookup
curl "http://localhost:6904/api?carPlate=1234ABC"

# Multiple lookups
for plate in 1234ABC 5678DEF 9012GHI; do
  curl "http://localhost:6904/api?carPlate=$plate"
done
```

### Using Python

```python
import requests

# Single lookup
response = requests.get(
    "http://localhost:6904/api",
    params={"carPlate": "1234ABC"}
)
data = response.json()
print(f"Badge: {data['badge']['badge']}")

# Batch lookup
plates = ["1234ABC", "5678DEF", "9012GHI"]
for plate in plates:
    response = requests.get(
        "http://localhost:6904/api",
        params={"carPlate": plate}
    )
    print(f"{plate}: {response.json()}")
```

### Using JavaScript/Fetch

```javascript
// Single lookup
const response = await fetch('http://localhost:6904/api?carPlate=1234ABC');
const data = await response.json();
console.log(`Badge: ${data.badge.badge}`);

// With async/await wrapper
async function lookupBadge(plate) {
  const response = await fetch(`http://localhost:6904/api?carPlate=${plate}`);
  return response.json();
}

// Usage
const result = await lookupBadge('1234ABC');
console.log(result);
```

### Using TypeScript

```typescript
interface BadgeInfo {
  vehicleType: string;
  badge: string;
  STOL: string;
}

interface BadgeResponse {
  carPlate: string;
  badge: BadgeInfo;
}

async function lookupBadge(plate: string): Promise<BadgeResponse> {
  const response = await fetch(`http://localhost:6904/api?carPlate=${plate}`);
  return response.json();
}
```

## Data Source

The ebAPI uses a CSV database of known vehicles located at `ebAPI/data/badges.csv`.

**CSV Format:**
```csv
plate,vehicleType,badge,STOL
1234ABC,turism,B,
5678DEF,turism,C,
9012GHI,turism,ECO,
```

## Related APIs

- [itvAPI Endpoints](/api/itvapi-endpoints/) - ITV date lookup
- [OS Endpoints](/api/os-endpoints/) - Vehicle simulation

## Next Steps

- View [Data Models](/api/models/)
- Explore [itvAPI Endpoints](/api/itvapi-endpoints/)
- Check [OS Endpoints](/api/os-endpoints/)
