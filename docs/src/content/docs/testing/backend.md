---
title: Backend Tests
description: Backend testing for all CRAI services
---

Comprehensive guide to testing CRAI's Python and Java backend services.

## AI Service Tests

### Test Structure

```
ai/tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── test_config.py           # Configuration tests
├── test_detectors.py        # Detector tests
├── test_main.py             # Main application tests
├── test_ocr.py              # OCR tests
├── test_plate_queue.py      # Queue tests
└── test_terminal_logger.py  # Logger tests
```

### Test Categories

#### Configuration Tests

**File:** `tests/test_config.py`

```python
from src.config.config import Config

class TestConfig:
    def test_config_loads(self):
        config = Config()
        assert config is not None
    
    def test_video_device_configured(self):
        config = Config()
        assert hasattr(config, 'VIDEO_DEVICE')
```

#### Detector Tests

**File:** `tests/test_detectors.py`

```python
import pytest
import numpy as np

class TestYoloDetector:
    @pytest.fixture
    def mock_image(self):
        return np.zeros((640, 640, 3), dtype=np.uint8)
    
    def test_detector_exists(self):
        from src.detectors.yolo_detector import YoloDetector
        assert YoloDetector is not None
    
    def test_detect_vehicles(self, mock_image):
        from src.detectors.yolo_detector import YoloDetector
        detector = YoloDetector()
        results = detector.detect(mock_image)
        assert isinstance(results, list)
```

#### OCR Tests

**File:** `tests/test_ocr.py`

```python
class TestOCR:
    def test_ocr_initialization(self):
        from src.detectors.ocr import PlateOCR
        ocr = PlateOCR()
        assert ocr is not None
    
    def test_read_plate(self):
        # Test with mock plate image
        pass
```

### Running AI Tests

```bash
cd ai

# All tests
pytest -v

# Specific module
pytest tests/test_detectors.py -v

# With coverage
pytest --cov=src --cov-report=xml
```

## ebAPI Tests

### Test Structure

```
ebAPI/tests/
├── conftest.py
└── test_main.py
```

### Test Examples

**File:** `tests/test_main.py`

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_badge_lookup():
    """Test environmental badge lookup"""
    response = client.get("/api", params={"carPlate": "1234ABC"})
    assert response.status_code == 200
    data = response.json()
    assert "carPlate" in data
    assert "badge" in data

def test_invalid_plate():
    """Test with invalid plate format"""
    response = client.get("/api", params={"carPlate": "INVALID"})
    assert response.status_code in [200, 400]

def test_missing_plate_parameter():
    """Test without plate parameter"""
    response = client.get("/api")
    assert response.status_code == 422
```

### Running ebAPI Tests

```bash
cd ebAPI

# All tests
pytest -v

# With coverage
pytest --cov=. --cov-report=xml
```

## itvAPI Tests

### Test Structure

```
itvAPI/tests/
├── conftest.py
└── test_main.py
```

### Test Examples

**File:** `tests/test_main.py`

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_itv_lookup():
    """Test ITV date lookup"""
    response = client.get("/api", params={"carPlate": "1234ABC"})
    assert response.status_code == 200
    data = response.json()
    assert "carPlate" in data
    assert "itv_date" in data

def test_swagger_docs():
    """Test API documentation available"""
    response = client.get("/docs")
    assert response.status_code == 200
```

### Running itvAPI Tests

```bash
cd itvAPI

# All tests
pytest -v

# With coverage
pytest --cov=. --cov-report=xml
```

## OS (Spring Boot) Tests

### Test Structure

```
os/src/test/java/com/crai/os/
├── controller/
│   ├── VehicleControllerTest.java
│   ├── CameraControllerTest.java
│   └── PoliceControllerTest.java
├── service/
│   ├── VehicleServiceTest.java
│   └── SimulationServiceTest.java
└── repository/
    └── VehicleRepositoryTest.java
```

### Controller Tests

```java
@WebMvcTest(VehicleController.class)
class VehicleControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private VehicleService vehicleService;
    
    @Test
    void shouldReturnAllVehicles() throws Exception {
        when(vehicleService.findAll())
            .thenReturn(List.of(new Vehicle()));
        
        mockMvc.perform(get("/api/vehicles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
    
    @Test
    void shouldCreateVehicle() throws Exception {
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("1234ABC");
        
        when(vehicleService.save(any()))
            .thenReturn(vehicle);
        
        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"plate\":\"1234ABC\"}"))
            .andExpect(status().isCreated());
    }
}
```

### Service Tests

```java
@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {
    
    @Mock
    private VehicleRepository vehicleRepository;
    
    @InjectMocks
    private VehicleService vehicleService;
    
    @Test
    void shouldFindAllVehicles() {
        when(vehicleRepository.findAll())
            .thenReturn(List.of(new Vehicle()));
        
        List<Vehicle> vehicles = vehicleService.findAll();
        
        assertThat(vehicles).hasSize(1);
        verify(vehicleRepository).findAll();
    }
    
    @Test
    void shouldFindByPlate() {
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("1234ABC");
        
        when(vehicleRepository.findByPlate("1234ABC"))
            .thenReturn(Optional.of(vehicle));
        
        Optional<Vehicle> result = vehicleService.findByPlate("1234ABC");
        
        assertThat(result).isPresent();
        assertThat(result.get().getPlate()).isEqualTo("1234ABC");
    }
}
```

### Repository Tests

```java
@DataJpaTest
class VehicleRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Test
    void shouldFindByPlate() {
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("1234ABC");
        entityManager.persist(vehicle);
        
        Optional<Vehicle> found = vehicleRepository.findByPlate("1234ABC");
        
        assertThat(found).isPresent();
    }
}
```

### Running Spring Boot Tests

```bash
cd os

# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=VehicleServiceTest

# With coverage report
./mvnw test jacoco:report
```

## Shared Fixtures

### Python Fixtures (conftest.py)

```python
import pytest
import numpy as np

@pytest.fixture(scope="session")
def sample_image():
    """Create a sample test image"""
    return np.random.randint(0, 255, (640, 480, 3), dtype=np.uint8)

@pytest.fixture
def mock_plate_response():
    """Mock plate lookup response"""
    return {
        "carPlate": "1234ABC",
        "badge": {"badge": "B", "vehicleType": "turism"}
    }
```

## Code Coverage

### Python Coverage

```bash
# Generate XML for CI
pytest --cov=src --cov-report=xml

# Generate HTML for local review
pytest --cov=src --cov-report=html
```

### Java Coverage (JaCoCo)

```bash
# Generate report
./mvnw jacoco:report

# View report
open target/site/jacoco/index.html
```

## Next Steps

- Review [Testing Overview](/testing/overview/)
- Learn about [Frontend Tests](/testing/frontend/)
- Check [CI/CD Pipeline](/testing/ci-cd/)
