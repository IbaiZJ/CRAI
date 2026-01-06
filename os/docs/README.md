Perfecto 💪
Vamos a crear **un documento completo, claro y evaluable**, pensado para **alguien que empieza desde cero**, pero escrito con **nivel universitario** y **alineado con la rúbrica**.

👉 Te lo dejo **listo para usar como README / memoria OS**.
👉 Puedes copiarlo tal cual a `README.md` o a un PDF.

---

# CRAI OS – Operating Systems Simulation

## Complete Documentation (Beginner-Friendly)

---

## 1. Introduction

The **CRAI OS module** is a simulation designed to demonstrate **core Operating Systems concepts**, especially **concurrency, synchronization, and real-time control**, within a realistic traffic-monitoring scenario.

The system simulates:

* Vehicles passing through traffic cameras
* Concurrent processing using multiple threads
* Rule validation (ITV, environmental badge, stolen vehicles)
* Alert generation and delivery to an external system (Node-RED)

Although simplified, the architecture closely resembles a **real-world distributed monitoring system**.

---

## 2. Educational Objectives

This simulation has been designed to demonstrate:

* Multithreading and concurrent execution
* Synchronization using shared-memory mechanisms
* Message passing as an alternative concurrency model
* Producer–consumer problems
* Real-time monitoring and dynamic system control
* Safe interaction between concurrent components
* Integration with external systems via REST and webhooks

---

## 3. High-Level System Overview

### 3.1 Real-World Analogy

| Real System            | Simulation    |
| ---------------------- | ------------- |
| Road                   | Vehicle Queue |
| Camera                 | Thread        |
| Traffic Control Center | OS Simulation |
| Police System          | Node-RED      |
| Alerts                 | JSON Messages |

The system continuously processes vehicles and reacts to infractions in real time.

---

## 4. Core Components

### 4.1 Vehicles

A **vehicle** is a data object containing:

* License plate
* Priority
* Environmental badge
* ITV status
* Theft status
* Owner information

Vehicles can be:

* Automatically generated
* Manually injected through an API

---

### 4.2 Cameras (Threads)

Each **camera** is implemented as an independent **thread**.

Responsibilities:

1. Retrieve a vehicle from the shared queue
2. Simulate OCR reading
3. Apply validation rules
4. Generate alerts if violations are detected

Multiple camera threads run **in parallel**, simulating real traffic conditions.

---

### 4.3 Vehicle Queue (Producer–Consumer)

The vehicle queue is a **bounded priority blocking queue**.

Characteristics:

* Limited capacity
* Priority-based ordering
* Thread-safe blocking behavior

This implements a classic **Producer–Consumer synchronization problem**:

* Producers: vehicle generators / API
* Consumers: camera threads

---

## 5. Simulation Flow (Step-by-Step)

1. Simulation is started via REST API
2. Vehicles are generated or injected
3. Vehicles enter the shared queue
4. Camera threads consume vehicles concurrently
5. Each vehicle is validated
6. Violations generate alerts
7. Alerts are stored and sent to Node-RED

All steps occur **while the system is running**, without interruption.

---

## 6. Synchronization Models Used

### 6.1 Shared Memory Synchronization

Inside the OS simulation:

* `BlockingQueue` ensures safe access to shared vehicles
* `ConcurrentHashMap` stores shared data safely
* `synchronized` and `volatile` protect shared state

This model is:

* Fast
* Efficient
* Suitable for single-process concurrency

---

### 6.2 Message Passing Synchronization

The system also uses **message passing**, avoiding shared memory.

#### External Message Passing (Implemented)

* Alerts are sent to Node-RED using HTTP POST
* Messages are JSON-based
* Communication is asynchronous
* No shared memory exists between systems

This demonstrates a **distributed concurrency model**.

#### Message Types

* Police alerts
* ITV violations
* Environmental badge violations

---

### 6.3 Alert Queue (Asynchronous Alert Processing)

In addition to the vehicle queue, the system implements an **alert queue** to manage detected infractions in a safe and scalable way.

This queue is used to **decouple vehicle processing from external communication**, preventing camera threads from being blocked by network operations.

---

#### Purpose of the Alert Queue

Sending alerts to an external system (Node-RED) involves:

* Network communication
* Potential latency
* Temporary failures

If camera threads were responsible for sending alerts directly, the entire simulation would slow down or block.

To avoid this, the system introduces an **intermediate alert queue**.

---

#### How the Alert Queue Works (Step-by-Step)

1. A camera thread detects a vehicle infraction
2. A `PoliceMessage` object is created
3. The message is placed into the alert queue
4. The camera thread immediately continues processing vehicles
5. The `PoliceService` consumes alerts from the queue and sends them to Node-RED asynchronously

This ensures that **camera threads never block** due to external communication.

---

#### Concurrency Model Applied

The alert queue implements a **second Producer–Consumer pattern** within the system:

| Role      | Component      |
| --------- | -------------- |
| Producers | Camera threads |
| Queue     | Alert queue    |
| Consumer  | PoliceService  |

The queue is **thread-safe**, guaranteeing:

* No race conditions
* No lost alerts
* Safe concurrent access

---

#### Relation to Message Passing

The alert queue represents **internal message passing** within the OS simulation.

Once alerts are dequeued and sent to Node-RED, **external message passing** takes place using HTTP and JSON messages.

This dual approach demonstrates:

* Internal synchronization using shared memory
* External synchronization using message passing
* Clear separation of responsibilities

---

### 6.4 Comparison: Shared Memory vs Message Passing

| Aspect              | Shared Memory | Message Passing |
| ------------------- | ------------- | --------------- |
| Performance         | High          | Medium          |
| Complexity          | High          | Lower           |
| Scalability         | Limited       | High            |
| Fault Isolation     | Low           | High            |
| Distributed Systems | Poor          | Excellent       |

The CRAI OS system **combines both approaches**, reflecting real-world architectures.

---

## 7. Real-Time Monitoring and Control

### 7.1 Monitoring Interfaces

The simulation exposes REST endpoints to query state **while running**:

* Simulation status
* Active cameras
* Queue state
* Generated alerts

This enables **live inspection** of the system.

---

### 7.2 Dynamic Runtime Control

System parameters can be modified during execution:

* Number of cameras
* Vehicle generation rate
* Probability of infractions
* OCR delay

Changes take effect **immediately**, without restarting the system.

---

### 7.3 Thread Safety Guarantees

All shared state modifications are:

* Thread-safe
* Atomic where required
* Protected against race conditions

This ensures consistent behavior under concurrent access.

---

## 8. REST API Overview

### Simulation Control

* `POST /simulation/start`
* `POST /simulation/stop`
* `GET /simulation/status`

### Runtime Configuration

* `PUT /admin/update`
* `PUT /admin/cameras`
* `PUT /admin/itv-prob`
* `PUT /admin/steal-prob`
* `GET /admin/status`

### Vehicles and Alerts

* `POST /vehicle/send`
* `GET /police/alerts`
* `DELETE /police/alerts`

---

## 9. Integration with Node-RED

Node-RED acts as:

* External control system
* Alert consumer
* Visualization and notification layer

Communication is **bidirectional**:

* OS → Node-RED: alerts via webhook
* Node-RED → OS: control and configuration

This simulates **real industrial integration**.

---

## 10. Testing and Validation

The system includes automated tests:

* Service-level logic
* Synchronization behavior
* State consistency

Test execution:

```bash
mvn test
```

Coverage reports:

```
target/site/jacoco/index.html
```

---

## 11. Academic Value

This simulation demonstrates:

* Correct use of concurrency primitives
* Practical synchronization problems
* Real-time system behavior
* Clean layered architecture
* External system integration

It goes beyond a theoretical exercise and reflects **professional system design**.

---

## 12. Final Summary

* Vehicles are processed concurrently
* Cameras are independent threads
* Synchronization is correctly handled
* Message passing avoids shared memory where appropriate
* The system can be monitored and controlled in real time
* Architecture mirrors real-world traffic control systems

---

