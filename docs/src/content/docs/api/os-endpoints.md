---
title: OS Service API
description: Spring Boot service for vehicle simulation, camera management, and police control
---

The OS (Operating System) service is a Spring Boot application providing vehicle simulation, camera management, and police control operations. It's built with Java 17 and integrates with the MySQL database.

## Base URL

```
Development: http://localhost:6906
```

## Technology Stack

- **Spring Boot 3.2.5**: Enterprise Java framework
- **Java 17**: Modern Java features
- **Maven**: Build and dependency management
- **Jackson**: JSON/XML processing
- **MySQL**: Database connectivity

## Controllers Overview

The OS service exposes multiple REST controllers:

| Controller | Path | Description |
|------------|------|-------------|
| CameraController | `/cameras` | Camera CRUD operations |
| VehicleController | `/vehicles` | Vehicle management |
| SimulationController | `/simulations` | Simulation control |
| PoliceController | `/police` | Police checkpoint control |
| ControlController | `/control` | System-level controls |

## Camera Management

### Camera Controller

Manages camera entities for traffic monitoring.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cameras` | List all cameras |
| GET | `/cameras/{id}` | Get camera by ID |
| POST | `/cameras` | Create new camera |
| PUT | `/cameras/{id}` | Update camera |
| DELETE | `/cameras/{id}` | Delete camera |

**Camera Object:**
```json
{
  "id": 1,
  "name": "Camera North",
  "location": "Highway A-1 km 45",
  "status": "ACTIVE",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "createdAt": "2025-01-15T10:30:00"
}
```

### Example Requests

**List Cameras:**
```bash
curl http://localhost:6906/cameras
```

**Create Camera:**
```bash
curl -X POST http://localhost:6906/cameras \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Camera South",
    "location": "Highway M-40 km 12",
    "status": "ACTIVE",
    "latitude": 40.3890,
    "longitude": -3.6821
  }'
```

## Vehicle Management

### Vehicle Controller

Manages vehicle records and tracking.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/vehicles` | List all vehicles |
| GET | `/vehicles/{id}` | Get vehicle by ID |
| GET | `/vehicles/plate/{plate}` | Get vehicle by plate |
| POST | `/vehicles` | Register new vehicle |
| PUT | `/vehicles/{id}` | Update vehicle |
| DELETE | `/vehicles/{id}` | Delete vehicle |

**Vehicle Object:**
```json
{
  "id": 1,
  "plate": "1234ABC",
  "brand": "Toyota",
  "model": "Corolla",
  "color": "White",
  "badge": "C",
  "itvDate": "2025-06-15",
  "createdAt": "2025-01-15T10:30:00"
}
```

### Example Requests

**Get Vehicle by Plate:**
```bash
curl http://localhost:6906/vehicles/plate/1234ABC
```

**Register Vehicle:**
```bash
curl -X POST http://localhost:6906/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "5678XYZ",
    "brand": "Honda",
    "model": "Civic",
    "color": "Blue"
  }'
```

## Simulation Control

### Simulation Controller

Controls traffic simulation scenarios.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/simulations` | List all simulations |
| GET | `/simulations/{id}` | Get simulation by ID |
| POST | `/simulations/start` | Start new simulation |
| POST | `/simulations/{id}/stop` | Stop simulation |
| POST | `/simulations/{id}/pause` | Pause simulation |
| POST | `/simulations/{id}/resume` | Resume simulation |
| GET | `/simulations/{id}/status` | Get simulation status |

**Simulation Object:**
```json
{
  "id": 1,
  "name": "Rush Hour Test",
  "status": "RUNNING",
  "vehicleCount": 50,
  "duration": 3600,
  "startedAt": "2025-01-15T08:00:00",
  "config": {
    "vehiclesPerMinute": 10,
    "speedLimit": 120
  }
}
```

### Example Requests

**Start Simulation:**
```bash
curl -X POST http://localhost:6906/simulations/start \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Traffic",
    "vehicleCount": 100,
    "duration": 7200,
    "config": {
      "vehiclesPerMinute": 15,
      "speedLimit": 100
    }
  }'
```

**Stop Simulation:**
```bash
curl -X POST http://localhost:6906/simulations/1/stop
```

## Police Control

### Police Controller

Manages police checkpoints and control operations.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/police/checkpoints` | List checkpoints |
| GET | `/police/checkpoints/{id}` | Get checkpoint |
| POST | `/police/checkpoints` | Create checkpoint |
| PUT | `/police/checkpoints/{id}` | Update checkpoint |
| DELETE | `/police/checkpoints/{id}` | Delete checkpoint |
| GET | `/police/alerts` | Get active alerts |
| POST | `/police/alerts` | Create alert |

**Checkpoint Object:**
```json
{
  "id": 1,
  "name": "Checkpoint A1-North",
  "location": "Highway A-1 km 45",
  "status": "ACTIVE",
  "officerCount": 3,
  "startTime": "2025-01-15T06:00:00",
  "endTime": "2025-01-15T14:00:00"
}
```

**Alert Object:**
```json
{
  "id": 1,
  "plate": "1234ABC",
  "alertType": "EXPIRED_ITV",
  "severity": "HIGH",
  "cameraId": 1,
  "timestamp": "2025-01-15T10:30:00",
  "resolved": false
}
```

### Example Requests

**Create Checkpoint:**
```bash
curl -X POST http://localhost:6906/police/checkpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Highway Control",
    "location": "A-2 km 30",
    "officerCount": 4
  }'
```

**Create Alert:**
```bash
curl -X POST http://localhost:6906/police/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "plate": "1234ABC",
    "alertType": "NO_BADGE",
    "severity": "MEDIUM",
    "cameraId": 1
  }'
```

## System Controls

### Control Controller

Provides system-level operations.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/control/status` | System status |
| POST | `/control/reset` | Reset system |
| GET | `/control/stats` | System statistics |
| GET | `/control/health` | Health check |

**Status Response:**
```json
{
  "status": "RUNNING",
  "uptime": 86400,
  "activeSimulations": 2,
  "activeCameras": 10,
  "totalVehicles": 1500,
  "alertsToday": 45
}
```

## Integration with CRAI

The OS service integrates with other CRAI services:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Node-RED   │────▶│ OS Service  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                           │                    │
                           │                    ▼
                    ┌──────▼──────┐     ┌─────────────┐
                    │    AI       │     │   MySQL     │
                    │  Service    │     │  Database   │
                    └─────────────┘     └─────────────┘
```

### Data Flow

1. **AI Service** detects license plates from video
2. Plates sent to **Node-RED** for orchestration
3. Node-RED queries **ebAPI** and **itvAPI** for badge and ITV
4. Results sent to **OS Service** for storage/alerts
5. **Frontend** displays real-time data

## Scheduled Tasks

The OS service uses Spring's `@EnableScheduling` for:

- Periodic simulation updates
- Alert expiration checks
- Statistics aggregation
- Database cleanup tasks

## Project Structure

```
os/
├── src/main/java/com/crai/os/
│   ├── OsApplication.java         # Entry point
│   ├── config/                    # Configuration
│   ├── controller/
│   │   ├── CameraController.java
│   │   ├── VehicleController.java
│   │   ├── SimulationController.java
│   │   ├── PoliceController.java
│   │   └── ControlController.java
│   ├── service/                   # Business logic
│   ├── repository/                # Data access
│   ├── model/                     # Entity models
│   ├── exception/                 # Custom exceptions
│   └── utils/                     # Utilities
├── src/main/resources/
│   └── application.properties
├── src/test/                      # Unit tests
├── pom.xml
└── Dockerfile
```

## Configuration

### application.properties

```properties
server.port=8080
spring.application.name=os

# Database
spring.datasource.url=jdbc:mysql://mysql:3306/crai
spring.datasource.username=crai_user
spring.datasource.password=crai_pass

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

## Error Handling

Standard HTTP error responses:

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

**Error Response:**
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Vehicle not found with plate: 1234ABC",
  "path": "/vehicles/plate/1234ABC"
}
```

## Testing

Run tests with Maven:

```bash
cd os
./mvnw test

# With coverage
./mvnw verify
```

Coverage reports generated at `target/site/jacoco/`.

## Next Steps

- View [API Overview](/api/overview/) for all services
- Learn about [Architecture](/architecture/overview/)
- Explore [Docker Setup](/architecture/docker/)
