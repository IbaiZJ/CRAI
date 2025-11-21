---
title: Backend Tests
description: Backend testing with pytest
---

Comprehensive guide to testing the CRAI FastAPI backend.

## Test Files

```
ai/tests/
├── conftest.py
└── api/
    ├── test_main.py        # Application tests
    └── test_router.py      # Endpoint tests
```

## Test Categories

### Application Tests

**File:** `tests/api/test_main.py`

```python
class TestMainApp:
    """Tests for main application"""
    
    def test_app_exists(self):
        assert app is not None
    
    def test_app_title(self):
        assert app.title is not None
    
    def test_app_version(self):
        assert app.version is not None
```

### Endpoint Tests

```python
class TestHealthEndpoints:
    """Tests for health endpoints"""
    
    def test_hello_endpoint(self):
        response = client.get("/api/hello")
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_hello_endpoint_response_type(self):
        response = client.get("/api/hello")
        assert response.headers["content-type"] == "application/json"
```

### HTTP Method Tests

```python
class TestHTTPMethods:
    """Tests for HTTP method validation"""
    
    def test_hello_post_not_allowed(self):
        response = client.post("/api/hello")
        assert response.status_code == 405
    
    def test_hello_put_not_allowed(self):
        response = client.put("/api/hello")
        assert response.status_code == 405
```

## Running Tests

```bash
# All tests
pytest

# Specific file
pytest tests/api/test_main.py

# Specific class
pytest tests/api/test_main.py::TestMainApp

# Specific test
pytest tests/api/test_main.py::TestMainApp::test_app_exists

# With coverage
pytest --cov=api --cov-report=term-missing
```

## Test Coverage

Current coverage: **100%**

```
Name                    Stmts   Miss  Cover
-------------------------------------------
api/core/config.py          7      0   100%
api/main.py                 5      0   100%
api/routers/router.py       6      0   100%
-------------------------------------------
TOTAL                      18      0   100%
```

## Next Steps

- Review [Testing Overview](/testing/overview/)
- Check [CI/CD Pipeline](/testing/ci-cd/)
