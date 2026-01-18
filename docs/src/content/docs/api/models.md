---
title: Data Models
description: Data models and schemas used across CRAI services
---

Data models and schemas used for request/response validation across all CRAI services.

## ebAPI Models

### BadgeResponse

Response from environmental badge lookup.

```python
class BadgeInfo(BaseModel):
    vehicleType: str
    badge: str
    STOL: str

class BadgeResponse(BaseModel):
    carPlate: str
    badge: BadgeInfo
```

**Example:**
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

| Value | Description | Color |
|-------|-------------|-------|
| `0` | Zero emissions | Blue |
| `ECO` | Hybrid, CNG, LPG | Blue/Green |
| `C` | Clean vehicles | Green |
| `B` | Older clean vehicles | Yellow |
| `""` | No badge eligible | - |

## itvAPI Models

### ITVResponse

Response from ITV date lookup.

```python
class ITVResponse(BaseModel):
    carPlate: str
    itv_date: str  # ISO date format
```

**Example:**
```json
{
  "carPlate": "1234ABC",
  "itv_date": "2025-06-15"
}
```

## OS (Spring Boot) Models

### Vehicle Entity

```java
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String plate;
    
    private String brand;
    private String model;
    private String color;
    private String badge;
    private LocalDate itvDate;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

**JSON Example:**
```json
{
  "id": 1,
  "plate": "1234ABC",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "White",
  "badge": "C",
  "itvDate": "2025-06-15",
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

### Camera Entity

```java
@Entity
@Table(name = "cameras")
public class Camera {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String location;
    private String streamUrl;
    private boolean active;
}
```

**JSON Example:**
```json
{
  "id": 1,
  "name": "Camera 1",
  "location": "Main Entrance",
  "streamUrl": "rtsp://camera1.local/stream",
  "active": true
}
```

### PoliceControl Entity

```java
@Entity
@Table(name = "police_controls")
public class PoliceControl {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean active;
    
    @ManyToOne
    @JoinColumn(name = "camera_id")
    private Camera camera;
}
```

### Simulation Entity

```java
@Entity
@Table(name = "simulations")
public class Simulation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String status; // PENDING, RUNNING, COMPLETED, FAILED
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    @Column(columnDefinition = "JSON")
    private String configuration;
}
```

## AI Service Models

### Detection Result

Internal model for vehicle detection.

```python
@dataclass
class DetectionResult:
    bbox: tuple[int, int, int, int]  # x1, y1, x2, y2
    confidence: float
    class_name: str  # 'car', 'truck', 'motorcycle'
```

### Plate Reading

Result from OCR processing.

```python
@dataclass
class PlateReading:
    plate_text: str
    confidence: float
    bbox: tuple[int, int, int, int]
    timestamp: datetime
```

### API Queue Item

Item sent to external APIs.

```python
@dataclass
class PlateQueueItem:
    plate_text: str
    timestamp: datetime
    frame_id: int
    camera_id: Optional[str]
```

## Error Models

### FastAPI Error Response

```python
class ErrorResponse(BaseModel):
    detail: str
```

**Examples:**

```json
{
  "detail": "Vehicle not found"
}
```

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

### Spring Boot Error Response

```java
public class ErrorResponse {
    private String message;
    private int status;
    private LocalDateTime timestamp;
    private String path;
}
```

**Example:**
```json
{
  "message": "Vehicle not found",
  "status": 404,
  "timestamp": "2024-01-01T12:00:00",
  "path": "/api/vehicles/999"
}
```

## Database Schema

### MySQL Tables

```sql
-- Vehicles table
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    badge VARCHAR(10),
    itv_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cameras table
CREATE TABLE cameras (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    stream_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE
);

-- Police controls table
CREATE TABLE police_controls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    active BOOLEAN DEFAULT FALSE,
    camera_id BIGINT,
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

-- Detections table (for logging)
CREATE TABLE detections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(20) NOT NULL,
    camera_id BIGINT,
    badge VARCHAR(10),
    itv_date DATE,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);
```

## Next Steps

- Explore [ebAPI Endpoints](/api/endpoints/)
- Check [itvAPI Endpoints](/api/itvapi-endpoints/)
- View [OS Endpoints](/api/os-endpoints/)
