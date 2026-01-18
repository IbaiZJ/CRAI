---
title: Testing Overview
description: Complete testing strategy for CRAI
---

CRAI has comprehensive testing across all services including Python, TypeScript, and Java components.

## Testing Strategy

### AI Service Testing
- **Unit Tests**: Detectors, OCR, configuration
- **Integration Tests**: Full pipeline testing
- **Coverage**: pytest with XML reporting

### ebAPI/itvAPI Testing
- **Unit Tests**: Service layer testing
- **API Tests**: Endpoint testing with FastAPI TestClient
- **Coverage**: pytest with coverage reporting

### OS (Spring Boot) Testing
- **Unit Tests**: JUnit 5 with Mockito
- **Integration Tests**: Spring Boot Test
- **Coverage**: JaCoCo reporting

### Frontend Testing
- **Unit Tests**: Vitest for components
- **E2E Tests**: Playwright (planned)

## Test Structure

```
ai/tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── test_config.py           # Configuration tests
├── test_detectors.py        # Detector tests
├── test_main.py             # Main app tests
├── test_ocr.py              # OCR tests
├── test_plate_queue.py      # Queue tests
└── test_terminal_logger.py  # Logger tests

ebAPI/tests/
├── conftest.py
└── test_main.py

itvAPI/tests/
├── conftest.py
└── test_main.py

os/src/test/java/
└── com/crai/os/
    ├── controller/
    ├── service/
    └── repository/
```

## Running Tests

### AI Service Tests

```bash
cd ai

# Run all tests
pytest

# Verbose output
pytest -v

# With coverage
pytest --cov=src --cov-report=term-missing

# Specific file
pytest tests/test_detectors.py

# Specific test
pytest tests/test_main.py::test_main_exists
```

### ebAPI Tests

```bash
cd ebAPI

# Run all tests
pytest

# With coverage
pytest --cov=. --cov-report=xml
```

### itvAPI Tests

```bash
cd itvAPI

# Run all tests
pytest

# With coverage
pytest --cov=. --cov-report=xml
```

### OS (Spring Boot) Tests

```bash
cd os

# Run all tests
./mvnw test

# With coverage report
./mvnw test jacoco:report

# Skip tests for build
./mvnw package -DskipTests
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Test Configuration

### pytest Configuration

**File:** `ai/pytest.ini`

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
    --cov=src
    --cov-report=term-missing
    --cov-report=xml

markers =
    slow: tests that take a long time
    integration: integration tests
    unit: unit tests
```

### Spring Boot Test Configuration

**File:** `os/pom.xml`

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>

<plugins>
    <plugin>
        <groupId>org.jacoco</groupId>
        <artifactId>jacoco-maven-plugin</artifactId>
        <version>0.8.10</version>
    </plugin>
</plugins>
```

## Writing Tests

### Python Test Example (AI Service)

```python
import pytest
from src.detectors.yolo_detector import YoloDetector

class TestYoloDetector:
    """Tests for YOLO vehicle detector"""
    
    @pytest.fixture
    def detector(self):
        return YoloDetector()
    
    def test_detector_initialization(self, detector):
        assert detector is not None
    
    def test_detect_vehicles(self, detector):
        # Mock image
        import numpy as np
        image = np.zeros((640, 640, 3), dtype=np.uint8)
        
        results = detector.detect(image)
        assert isinstance(results, list)
```

### FastAPI Test Example

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_badge_lookup():
    """Test environmental badge lookup"""
    response = client.get("/api", params={"carPlate": "1234ABC"})
    assert response.status_code == 200
    data = response.json()
    assert "badge" in data
```

### Spring Boot Test Example

```java
@SpringBootTest
class VehicleServiceTest {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Test
    void shouldReturnAllVehicles() {
        List<Vehicle> vehicles = vehicleService.findAll();
        assertThat(vehicles).isNotNull();
    }
}
```

## Coverage Reports

### Terminal Report

```bash
pytest --cov=src --cov-report=term-missing
```

### XML Report (for CI/CD)

```bash
pytest --cov=src --cov-report=xml
```

### HTML Report

```bash
pytest --cov=src --cov-report=html
# Open htmlcov/index.html
```

### JaCoCo Report (Java)

```bash
./mvnw jacoco:report
# Open target/site/jacoco/index.html
```

## Test Markers

```python
@pytest.mark.unit
def test_config_loading():
    """Unit test for configuration"""
    pass

@pytest.mark.integration
def test_full_pipeline():
    """Integration test for detection pipeline"""
    pass

@pytest.mark.slow
def test_model_inference():
    """Slow test requiring model loading"""
    pass

# Run by marker
pytest -m unit
pytest -m "not slow"
pytest -m "integration"
```

## Best Practices

1. **Arrange-Act-Assert** pattern for test structure
2. **Use fixtures** for shared setup
3. **Mock external dependencies** (APIs, databases)
4. **Test edge cases** and error handling
5. **Keep tests independent** and isolated
6. **Name tests descriptively**: `test_should_return_badge_for_valid_plate`

## SonarQube Integration

All services report to SonarCloud:

```properties
# sonar-project.properties
sonar.projectKey=your-project-key
sonar.organization=your-org
sonar.sources=src
sonar.tests=tests
sonar.python.coverage.reportPaths=coverage.xml
```

## CI/CD Testing

Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Changes in respective service directories

See [CI/CD Documentation](/testing/ci-cd/) for details.

## Next Steps

- Detailed [Backend Tests](/testing/backend/)
- Learn about [Frontend Tests](/testing/frontend/)
- Review [CI/CD Pipeline](/testing/ci-cd/)
