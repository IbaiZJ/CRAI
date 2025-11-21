---
title: Authentication
description: API authentication and authorization
---

Currently, the CRAI API does not require authentication. This page documents planned authentication features.

## Current Status

The API is currently **open** and does not require authentication. All endpoints are publicly accessible.

## Planned Features

### API Key Authentication

API keys will be required for all endpoints:

```http
GET /api/recognize
X-API-Key: your-api-key-here
```

**Example:**
```python
import requests

headers = {
    "X-API-Key": "your-api-key-here"
}

response = requests.get(
    "http://localhost:6902/api/recognize",
    headers=headers
)
```

### JWT Authentication

JSON Web Tokens for user authentication:

```http
GET /api/recognize
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Login flow:**
```python
# 1. Login
response = requests.post("/api/auth/login", json={
    "username": "user",
    "password": "pass"
})
token = response.json()["access_token"]

# 2. Use token
headers = {"Authorization": f"Bearer {token}"}
response = requests.get("/api/recognize", headers=headers)
```

### OAuth2

OAuth2 integration for third-party authentication.

## Rate Limiting (Planned)

- 100 requests/minute per API key
- 1000 requests/hour per API key
- Response header: `X-RateLimit-Remaining`

## Next Steps

- Review [API Overview](/api/overview/)
- Check [API Endpoints](/api/endpoints/)
