
---

# 🇬🇧 **FULL DOCUMENTATION (ENGLISH VERSION)**

*(Below you will also get the full Spanish version 🇪🇸)*

---

# 📘 **1. Introduction**

This project implements an **advanced multithreaded simulation** that models the behavior of a smart-city access-control system. Vehicles arrive concurrently, a shared pool of cameras captures their plates, OCR workers process each plate, and classification workers determine whether the vehicle is allowed to enter a restricted urban zone.

The simulation is fully integrated into **Node-RED**, enabling external systems to trigger and parameterize it using HTTP. The simulation operates dynamically and returns structured JSON responses that include performance metrics and environmental classification results.

This document describes:

* The design of the simulation
* Synchronization techniques
* Integration with Node-RED
* Pipeline architecture
* Justification of advanced concurrency strategies
* Efficiency optimizations
* UML diagrams
* Complete bilingual explanation for the PBL

---

# 🧠 **2. Simulation Purpose & Domain Relevance**

Smart cities commonly restrict vehicle entry based on environmental labels. The real PBL system captures a license plate using a physical camera, processes it using OCR, and evaluates the environmental classification to decide whether entry is permitted.

This simulation models that entire workflow:

| Real System Component           | Simulated Equivalent                |
| ------------------------------- | ----------------------------------- |
| Physical camera                 | CameraWorker (Stage 1)              |
| OCR system                      | OCRWorker (Stage 2)                 |
| Environmental evaluation engine | ClassifierWorker (Stage 3)          |
| Traffic flow                    | Multiple concurrent Vehicle threads |
| Integration layer               | Node-RED API                        |

This makes the simulation **directly applicable** to your PBL project and suitable for evaluating system performance under load, concurrency issues, and bottlenecks.

---

# 🏗️ **3. Architecture Overview**

The system includes:

### **3.1 Vehicle Threads**

Each arriving vehicle executes in its own thread. Vehicles can have assigned priority levels (normal, service, emergency). Higher-priority vehicles are processed earlier.

### **3.2 Camera Pool (Stage 1)**

* Multiple camera workers
* Shared priority queue
* Critical resource simulation
* Produces plates into OCR queue

### **3.3 OCR Pool (Stage 2)**

* Slower workers
* Models OCR computation time
* Passes processed plates to classifier queue

### **3.4 Classifier Pool (Stage 3)**

* Evaluates environmental category
* Determines whether the vehicle is allowed

### **3.5 Node-RED Integration**

Node-RED sends JSON via HTTP:

```json
{
  "vehicles": 40,
  "cameras": 3,
  "ocrWorkers": 4,
  "classifiers": 2
}
```

Java reads this input, runs the simulation, and returns:

```json
{
  "processed": 40,
  "allowed": 21,
  "denied": 19,
  "avgTimeMs": 623,
  "peakQueueSize": 17
}
```

---

# 🔄 **4. Multistage Pipeline**

The system is built around a **three-stage pipeline**, each operating concurrently and independently:

```
Vehicles → CameraPool → OCRPool → ClassifierPool → Result
```

This architecture introduces:

* Multiple dependencies between thread groups
* Complex ordering constraints
* Multi-resource synchronization
* Natural back-pressure between queues
* Realistic modeling of congestion

---

# 🔒 **5. Advanced Synchronization Requirements**

The simulation satisfies the **Advanced Synchronization** level:

### ✔ Multiple thread types

* Vehicle
* CameraWorker
* OCRWorker
* ClassifierWorker

### ✔ Multiple resource types

* PriorityBlockingQueue
* ArrayBlockingQueue
* ThreadPoolExecutor

### ✔ Pipeline ordering constraints

Stage N must complete before Stage N+1 may begin.

### ✔ Prioritized scheduling

Emergency vehicles leap ahead using PriorityBlockingQueue.

### ✔ Non-blocking primitives (NO busy waiting)

Using:

* `take()`
* `put()`
* `ExecutorService`

All threads sleep while idle → zero CPU waste.

---

# ⚙️ **6. Efficiency and Optimization Strategies**

### **6.1 Lock Contention Elimination**

Replaced synchronized methods with Java concurrent structures:

* `PriorityBlockingQueue`
* `BlockingQueue`

→ lower contention, smoother flow.

### **6.2 Thread Management Optimization**

Using `ThreadPoolExecutor` avoids thread creation/destruction overhead.

### **6.3 Load Balancing**

Independent queue sizes ensure natural flow control.

### **6.4 Bottleneck Analysis**

OCR is intentionally slower to simulate real constraints and show queue buildup (peakQueueSize).

---

# 🔗 **7. Integration with Node-RED**

Node-RED sends a POST request to:

```
http://localhost:8080/simulate
```

Flow:

```
Inject → Function (build JSON) → HTTP POST → Debug
```

The simulation returns structured data, enabling:

* Logging
* Visualization
* Integration with dashboards
* Triggering from other systems
* Automation flows

This satisfies **Integration with Other Subsystems**:

✔ External system triggers simulation
✔ Interprocess communication
✔ JSON structured API
✔ Reusable service endpoint

---

# 📊 **8. UML Diagram (PlantUML)**

---

# 📄 **9. Conclusions**

This simulation:

* Accurately models real behavior of the PBL smart-city system
* Demonstrates mastery of advanced synchronization
* Provides a dynamic, configurable, integrated service
* Is fully compatible with Node-RED
* Produces measurable, analyzable results

---