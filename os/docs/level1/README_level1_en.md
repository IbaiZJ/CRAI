
---

# 📄 **README.md — Multithreaded Simulation (Vehicles + Camera + OCR)**

*(Ready to copy and paste into your repository)*

---

# 🚗📸 Concurrent Simulation of Vehicles, Camera, and OCR

This project implements a **multithreaded simulation in Java** based on the real domain of the PBL: vehicle access control through license plate capture and environmental classification using OCR.

The system models a scenario where:

1. Multiple **vehicles** arrive concurrently
2. A **camera** captures their license plates (critical shared resource)
3. Plates are stored in a **limited buffer**
4. An **OCR module** processes each plate and determines whether the vehicle is **allowed** or **denied**

---

# 📘 Table of Contents

* [General Description](#general-description)
* [Simulation Architecture](#simulation-architecture)
* [UML Diagram](#uml-diagram)
* [Synchronization Mechanisms](#synchronization-mechanisms)
* [Technical Justification](#technical-justification)
* [How to Run the Simulation](#how-to-run-the-simulation)
* [Execution Traces](#execution-traces)
* [Relation to the Real Project Domain](#relation-to-the-real-project-domain)
* [Future Improvements](#future-improvements)

---

# 🧩 **General Description**

This simulation models a small intelligent-traffic system where multiple vehicles attempt to access a restricted area.

Each vehicle:

1. Arrives in parallel (modeled using `Thread`)
2. Uses a **shared camera** to capture its license plate
3. Places the captured plate into a buffer (producer)
4. The OCR module (consumer) processes the plates one by one

This scenario allows the study of:

* Mutual exclusion
* Race conditions
* Monitor-based synchronization
* Producer–Consumer pattern
* Deadlock prevention

---

# 🏗️ **Simulation Architecture**

### ✔ Vehicle (Thread)

* Arrives at random intervals
* Uses the camera (critical section)
* Produces license plates into the OCR buffer

### ✔ Camera (Monitor)

* Only one vehicle can use it at a time
* Implemented using `synchronized`

### ✔ BufferOCR (Monitor with condition variables)

* Limited queue
* `produce()` blocks when full
* `consume()` blocks when empty
* Uses `wait()` and `notifyAll()`

### ✔ OCR (Thread)

* Continuous consumer
* Processes plates from the buffer
* Performs environmental classification

---

# 📊 **UML Diagram**

![UML Diagram](level1/image_level1.png)

---

# 🔒 **Synchronization Mechanisms**

## **1. Camera as a Critical Resource**

The camera is implemented as a **monitor**:

```java
public synchronized String capturePlate(int vehicleId)
```

Guarantees:

* Mutual exclusion
* No overlapping plate captures
* Faithful representation of a physical camera

---

## **2. Producer–Consumer Pattern in OCR**

`BufferOCR` implements:

```java
wait();
notifyAll();
synchronized
```

This ensures:

* Ordered waiting
* No busy waiting
* No lost plates
* Deadlock-free behavior

---

# 🧠 **Technical Justification**

### ✔ Why use monitors (`synchronized`)?

Monitors automatically handle:

* Mutual exclusion
* Condition variables
* Ordered blocking in critical sections

Safer and cleaner than manual semaphores.

---

### ✔ Why a limited buffer?

It reproduces real-world system behavior:

* System saturation
* Rush-hour congestion
* Waiting and retry mechanisms
* Controlled throughput

---

### ✔ Why threads for vehicles?

Because in real traffic:

* Vehicles **do not arrive in order**
* They arrive at unpredictable intervals
* Their behavior is inherently concurrent

The simulation reflects real-world dynamics accurately.

---

# ▶️ **How to Run the Simulation**

1. Compile the project:

```
javac src/*.java
```

2. Run the main class:

```
java Main
```

---

# 📟 **Execution Traces (Expected Output)**

Example:

```
🚗 Vehicle 3 arrives at the area
📸 Camera capturing license plate of vehicle 3
📸 Camera: captured → ABC003
➡️ Added to OCR queue: ABC003
🔍 OCR processing: ABC003
✔ OCR ABC003: Label C → ALLOWED
```

These traces demonstrate:

* Exclusive access to the camera
* Correct producer–consumer order
* Deadlock-free behavior

---

# 🌍 **Relation to the Real Project Domain**

This simulation perfectly replicates the real workflow of the PBL project:

**Real Vehicles → Camera → OCR → Environmental Classification → Access Decision**

Realistic concurrency includes:

* Traffic bursts
* High-load access attempts
* Variable processing time
* Resource dependency

This makes it ideal for validating:

* Performance
* Data consistency
* System stability under load
* Correct synchronization

---

# 🚀 **Future Improvements**

* Multiple cameras
* Several OCR modules (consumer pool)
* Average processing-time calculation
* JSON/CSV export
* Real-time visualization

---