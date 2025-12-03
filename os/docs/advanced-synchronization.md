Advanced Synchronization and Integration — Design Notes

Purpose

This document explains the advanced synchronization improvements applied to the simulation codebase and how the simulation integrates with other subsystems (REST API). It justifies the complexity and documents optimization strategies.

1) Why this is more complex than basic producer-consumer

- Multiple thread types and stages: camera workers produce vehicle events; the camera worker pipeline interacts with an external ITV check and then generates alerts consumed by the Police worker. That forms a multi-stage pipeline (CameraPool -> ITVService -> PoliceService).
- Priority semantics: vehicles carry an integer `priority` and the camera queue is a priority queue so higher-priority vehicles are processed first; preserving ordering while also bounding capacity requires careful coordination.
- Multi-resource dependencies: camera workers rely on both the camera queue capacity and the police alert queue capacity; we cannot treat the system as a single queue — there are two resource boundaries needing coordination.
- Flow control/backpressure: when downstream (PoliceService) lags, upstream work should not consume unbounded memory. This requires bounded queues and blocking producers rather than dropping or busy-waiting.

2) Key implementation changes (summary)

- `BoundedPriorityBlockingQueue<E>`: monitor-based implementation using `ReentrantLock` + `Condition` to provide blocking `put()` and `take()` while maintaining priority ordering. This replaces any busy-loop or unbounded structure.

- `PoliceService`:
  - Replaced unbounded queue with a bounded `LinkedBlockingQueue` (size configurable via `SimulationConfig.getPoliceQueueCapacity()`).
  - `sendAlert(...)` uses `queue.put(...)` to block producers when police queue is full, providing backpressure upstream (camera worker threads will block instead of producing unbounded work).
  - `processed` alerts now stored in a `ConcurrentLinkedQueue` and `getProcessedAlerts()` returns an immutable snapshot via `List.copyOf(...)` to avoid concurrent-modification issues.

- `DomainRulesTest` (test-side): tests iterate over an immutable snapshot of processed alerts to prevent ConcurrentModificationException while the background worker appends alerts.

3) Efficiency problems observed and optimizations applied

Problem: Busy-waiting and unbounded buffering
- Original designs sometimes used unbounded collections or ad-hoc checks that could allow producers to outrun consumers, causing memory growth.
- Fix: Use bounded blocking queues to make producers wait (blocking `put`) instead of busy-waiting or dropping work. Blocking avoids CPU spin and naturally limits memory use.

Problem: Lock contention on a single global lock
- The priority queue requires a lock for correctness; heavy contention can arise when many producers and consumers access it.
- Mitigation: Keep lock hold-times minimal: the queue `put`/`take` only acquires the lock to modify the heap and then immediately signals waiting threads. Avoid expensive computations while holding the lock.

Problem: Concurrent iteration over a mutable list
- Tests or other code iterating over a collection while the worker modifies it can throw ConcurrentModificationException.
- Fix: Expose immutable snapshots (`List.copyOf`) or use concurrent collections (`ConcurrentLinkedQueue`) and iterate over snapshots.

Problem: Upstream blocking semantics must be safe
- If `sendAlert()` blocks while holding other locks in the camera worker, there is a potential for deadlock if the blocked thread holds a resource needed by the consumer. In our design, camera worker only calls `queue.put()` after releasing the camera queue lock (because the camera queue `take()` returns a vehicle before alerting), so deadlocks are avoided.

4) Integration with other subsystems (REST API)

- The simulation exposes endpoints:
  - `POST /vehicle/send` — accepts a `Vehicle` JSON payload and enqueues it into the camera queue.
  - `POST /simulation/start` — starts the simulation (starts camera workers via `SimulationService`).
  - `POST /simulation/stop` — stops the simulation.
  - `GET /simulation/status` — returns camera-pool status and queue sizes.

- Integration approach:
  - The simulation runs inside Spring Boot; controllers accept JSON via standard Spring MVC annotations and hand off objects to services.
  - For external integrations (e.g., an ITV external API), the `ITVService` abstraction can synchronously call an external HTTP API or use a client; it currently exposes `check(plate)` and is invoked from camera workers as part of the pipeline.

- Inter-process communication:
  - REST endpoints provide the externally facing API.
  - Internally the different services use in-memory blocking queues for fast, thread-safe communication.

5) How this design meets the requirements

- Correctness: Uses well-known blocking primitives (`ReentrantLock` + `Condition`, `LinkedBlockingQueue`) to coordinate producers and consumers without busy-waiting.
- Priority handling: The camera queue is a priority queue; higher priority vehicles are served first.
- Multi-stage pipeline: Camera → ITV → Police with bounded queues and backpressure ensures the system behaves robustly when a downstream stage slows.
- Efficiency: Blocking semantics instead of spinning; short critical sections; concurrent collections for low contention.

6) Next steps and suggestions

- Observe runtime characteristics under load and tune `cameraQueueCapacity` and `policeQueueCapacity` in `SimulationConfig`.
- If high concurrency is required, consider sharding the priority queue or using multiple queues by priority class to reduce contention.
- For production external ITV calls, make the ITV check asynchronous or use a rate-limited HTTP client to avoid blocking camera workers for network latency.

