---
title: Testing Overview
description: Complete testing strategy for CRAI
---

CRAI has a comprehensive testing strategy covering backend and frontend with automated CI/CD.

## Testing Strategy

### Backend Testing
- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoints and services
- **Coverage**: 100% code coverage maintained

### Frontend Testing (Planned)
- **Component Tests**: React components
- **E2E Tests**: User workflows
- **Visual Regression**: UI consistency

## Test Structure

```
ai/tests/
├── __init__.py
├── conftest.py          # Shared fixtures
├── pytest.ini           # Configuration
└── api/
    ├── test_main.py     # App tests
    └── test_router.py   # Endpoint tests
```

## Running Tests

### Backend Tests

```bash
cd ai

# Run all tests
pytest

# Verbose output
pytest -v

# With coverage
pytest --cov=api --cov-report=term-missing

# Specific file
pytest tests/api/test_main.py

# Specific test
pytest tests/api/test_main.py::test_hello_endpoint
```

### Test Results

Current backend test results:
- ✅ 17 tests passing
- ✅ 100% code coverage
- ✅ 0.25s execution time

## Test Configuration

**File:** `pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

addopts = 
    -v
    --strict-markers
    --tb=short
    --cov=api
    --cov-report=term-missing
    --cov-report=html

markers =
    slow: tests that take a long time
    integration: integration tests
    unit: unit tests
    api: API tests
```

## Writing Tests

### Basic Test Example

```python
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_hello_endpoint():
    """Test the hello endpoint"""
    response = client.get("/api/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}
```

### Using Fixtures

```python
import pytest

@pytest.fixture
def test_client():
    with TestClient(app) as client:
        yield client

def test_with_fixture(test_client):
    response = test_client.get("/api/hello")
    assert response.status_code == 200
```

## Coverage Reports

### Terminal Report

```bash
pytest --cov=api --cov-report=term-missing
```

### HTML Report

```bash
pytest --cov=api --cov-report=html
# Open htmlcov/index.html
```

### CI Coverage

GitHub Actions automatically:
- Runs all tests
- Generates coverage reports
- Saves artifacts

## Test Markers

```python
@pytest.mark.api
def test_api_endpoint():
    """API test"""
    pass

@pytest.mark.slow
def test_slow_operation():
    """Slow test"""
    pass

# Run by marker
pytest -m api
pytest -m "not slow"
```

## Best Practices

1. **One assertion per test** when possible
2. **Descriptive test names**: `test_should_return_error_when_invalid_input`
3. **Use fixtures** for setup/teardown
4. **Mock external dependencies**
5. **Test edge cases** and error conditions

## CI/CD Testing

Tests run automatically on:
- Every push to `main` or `ai` branches
- Every pull request
- Changes in `ai/` directory

See [CI/CD Documentation](/testing/ci-cd/) for details.

## Next Steps

- Detailed [Backend Tests](/testing/backend/)
- Learn about [Frontend Tests](/testing/frontend/)
- Review [CI/CD Pipeline](/testing/ci-cd/)
