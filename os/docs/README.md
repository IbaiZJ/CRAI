# CRAI OS - Operating Systems Simulation

Main entry point for the OS module documentation.

## Documentation map

- `os/docs/README.md`: main overview and navigation (this file).
- `os/docs/guides/monitoring-control.md`: runtime monitoring and control endpoints.
- `os/docs/guides/message-passing-monitoring.md`: message passing model and comparison to monitors/semaphores.
- `os/docs/schemas/police-message.schema.json`: alert message schema used for validation.
- `os/docs/diagrams/sequence.puml`: request-to-alert sequence flow.
- `os/docs/diagrams/class.puml`: class diagram of core services and models.
- `os/docs/diagrams/state.puml`: simulation state machine.
- `os/docs/diagrams/useCase.puml`: use case diagram.
- `os/docs/diagrams/deployment.puml`: deployment diagram.

## Table of contents

- [Introduction](#introduction)
- [Educational objectives](#educational-objectives)
- [System overview](#system-overview)
- [Core components](#core-components)
- [Simulation flow](#simulation-flow)
- [Concurrency and synchronization](#concurrency-and-synchronization)
- [Real-time monitoring and control](#real-time-monitoring-and-control)
- [REST API overview](#rest-api-overview)
- [Integration with Node-RED](#integration-with-node-red)
- [Schema validation](#schema-validation)
- [Testing and validation](#testing-and-validation)
- [Diagrams](#diagrams)

## Introduction

The **CRAI OS module** is a simulation designed to demonstrate **core Operating Systems concepts**, especially **concurrency, synchronization, and real-time control**, within a realistic traffic-monitoring scenario.

The system simulates:

- Vehicles passing through traffic cameras
- Concurrent processing using multiple threads
- Rule validation (ITV, environmental badge, stolen vehicles)
- Alert generation and delivery to an external system (Node-RED)

Although simplified, the architecture closely resembles a **real-world distributed monitoring system**.

## Educational objectives

This simulation has been designed to demonstrate:

- Multithreading and concurrent execution
- Synchronization using shared-memory mechanisms
- Message passing as an alternative concurrency model
- Producer-consumer problems
- Real-time monitoring and dynamic system control
- Safe interaction between concurrent components
- Integration with external systems via REST and webhooks

## System overview

### Real-world analogy

| Real System            | Simulation    |
| ---------------------- | ------------- |
| Road                   | Vehicle Queue |
| Camera                 | Thread        |
| Traffic Control Center | OS Simulation |
| Police System          | Node-RED      |
| Alerts                 | JSON Messages |

The system continuously processes vehicles and reacts to infractions in real time.

## Core components

### Vehicles

A **vehicle** is a data object containing:

- License plate
- Priority
- Environmental badge
- ITV status
- Theft status
- Owner information

Vehicles can be:

- Automatically generated
- Manually injected through an API

### Cameras (threads)

Each **camera** is implemented as an independent **thread**.

Responsibilities:

1. Retrieve a vehicle from the shared queue
2. Simulate OCR reading
3. Apply validation rules
4. Generate alerts if violations are detected

Multiple camera threads run **in parallel**, simulating real traffic conditions.

### Vehicle queue (producer-consumer)

The vehicle queue is a **bounded priority blocking queue**.

Characteristics:

- Limited capacity
- Priority-based ordering
- Thread-safe blocking behavior

This implements a classic **Producer-Consumer synchronization problem**:

- Producers: vehicle generators / API
- Consumers: camera threads

## Simulation flow

1. Simulation is started via REST API
2. Vehicles are generated or injected
3. Vehicles enter the shared queue
4. Camera threads consume vehicles concurrently
5. Each vehicle is validated
6. Violations generate alerts
7. Alerts are stored and sent to Node-RED

All steps occur **while the system is running**, without interruption.

## Concurrency and synchronization

For detailed explanations, see `os/docs/guides/message-passing-monitoring.md`.

### Shared memory synchronization

Inside the OS simulation:

- `BlockingQueue` ensures safe access to shared vehicles
- `ConcurrentHashMap` stores shared data safely
- `synchronized` and `volatile` protect shared state

This model is:

- Fast
- Efficient
- Suitable for single-process concurrency

### Message passing synchronization

The system also uses **message passing**, avoiding shared memory.

#### External message passing (implemented)

- Alerts are sent to Node-RED using HTTP POST
- Messages are JSON-based
- Communication is asynchronous
- No shared memory exists between systems

This demonstrates a **distributed concurrency model**.

#### Message types

- Police alerts
- ITV violations
- Environmental badge violations

### Alert queue (asynchronous alert processing)

In addition to the vehicle queue, the system implements an **alert queue** to manage detected infractions in a safe and scalable way.

This queue is used to **decouple vehicle processing from external communication**, preventing camera threads from being blocked by network operations.

#### Purpose of the alert queue

Sending alerts to an external system (Node-RED) involves:

- Network communication
- Potential latency
- Temporary failures

If camera threads were responsible for sending alerts directly, the entire simulation would slow down or block.

To avoid this, the system introduces an **intermediate alert queue**.

#### How the alert queue works (step-by-step)

1. A camera thread detects a vehicle infraction
2. A `PoliceMessage` object is created
3. The message is placed into the alert queue
4. The camera thread immediately continues processing vehicles
5. The `PoliceService` consumes alerts from the queue and sends them to Node-RED asynchronously

This ensures that **camera threads never block** due to external communication.

#### Concurrency model applied

The alert queue implements a **second Producer-Consumer pattern** within the system:

| Role      | Component      |
| --------- | -------------- |
| Producers | Camera threads |
| Queue     | Alert queue    |
| Consumer  | PoliceService  |

The queue is **thread-safe**, guaranteeing:

- No race conditions
- No lost alerts
- Safe concurrent access

#### Relation to message passing

The alert queue represents **internal message passing** within the OS simulation.

Once alerts are dequeued and sent to Node-RED, **external message passing** takes place using HTTP and JSON messages.

This dual approach demonstrates:

- Internal synchronization using shared memory
- External synchronization using message passing
- Clear separation of responsibilities

### Comparison: shared memory vs message passing

| Aspect              | Shared Memory | Message Passing |
| ------------------- | ------------- | --------------- |
| Performance         | High          | Medium          |
| Complexity          | High          | Lower           |
| Scalability         | Limited       | High            |
| Fault Isolation     | Low           | High            |
| Distributed Systems | Poor          | Excellent       |

The CRAI OS system **combines both approaches**, reflecting real-world architectures.

## Real-time monitoring and control

For runtime endpoints and thread-safety guarantees, see `os/docs/guides/monitoring-control.md`.

### Monitoring interfaces

The simulation exposes REST endpoints to query state **while running**:

- Simulation status
- Active cameras
- Queue state
- Generated alerts

This enables **live inspection** of the system.

### Dynamic runtime control

System parameters can be modified during execution:

- Number of cameras
- Vehicle generation rate
- Probability of infractions
- OCR delay

Changes take effect **immediately**, without restarting the system.

### Thread safety guarantees

All shared state modifications are:

- Thread-safe
- Atomic where required
- Protected against race conditions

This ensures consistent behavior under concurrent access.

## REST API overview

### Simulation control

- `POST /simulation/start`
- `POST /simulation/stop`
- `GET /simulation/status`

### Runtime configuration

- `PUT /admin/update`
- `PUT /admin/cameras`
- `PUT /admin/itv-prob`
- `PUT /admin/steal-prob`
- `GET /admin/status`

### Vehicles and alerts

- `POST /vehicle/send`
- `GET /police/alerts`
- `DELETE /police/alerts`

## Integration with Node-RED

Node-RED acts as:

- External control system
- Alert consumer
- Visualization and notification layer

Communication is **bidirectional**:

- OS -> Node-RED: alerts via webhook
- Node-RED -> OS: control and configuration

This simulates **real industrial integration**.

## Schema validation

To ensure alerts follow an agreed format between systems, a JSON Schema is provided:

- `os/docs/schemas/police-message.schema.json`

Node-RED validates incoming alerts against this schema before processing.

## Testing and validation

The system includes automated tests:

- Service-level logic
- Synchronization behavior
- State consistency

Test execution:

```bash
mvn test
```

## Diagrams

- `os/docs/diagrams/sequence.puml`: sequence flow of vehicles and alerts.
- `os/docs/diagrams/class.puml`: core types and service relationships.
- `os/docs/diagrams/state.puml`: simulation state transitions.
- `os/docs/diagrams/useCase.puml`: user/system interactions.
- `os/docs/diagrams/deployment.puml`: runtime deployment layout.
