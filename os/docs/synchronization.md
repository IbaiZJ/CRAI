# Advanced Synchronization — Design and Evidence

This document explains how the simulation addresses advanced synchronization concerns and why the chosen design meets the rubric requirements.

Problems addressed

1) Multi-stage pipeline with priority and capacity limits
- Description: Vehicles enter the system with different priorities and must be processed by a limited number of camera workers, then possibly generate alerts to be handled by the police worker. This is a multi-stage pipeline with ordering constraints (priority) and capacity concerns: unbounded queues can exhaust memory under heavy load.
- Mechanism: `PriorityBlockingQueue<Vehicle>` provides priority ordering; a `Semaphore` enforces a bounded capacity across the system (permits track the number of items in-flight). `ExecutorService` manages worker threads. Together these primitives ensure correct ordering (priority), eliminate busy-waiting, and provide backpressure.

2) Alert processing and single-consumer ordering
- Description: Alerts must be processed sequentially to simplify state mutation and ordering guarantees in the `PoliceService`.
- Mechanism: a `LinkedBlockingQueue<PoliceMessage>` plus a single-thread `ExecutorService` consumer ensures ordered, single-threaded processing (no additional locking required for the processing core). The `processed` list is wrapped with `Collections.synchronizedList` to protect concurrent reads.

Why this is more than a basic scenario
- The system enforces both priority ordering and bounded capacity simultaneously, while coordinating multiple worker types across stages. That introduces interdependencies: enqueueing must be blocked when capacity is exhausted (backpressure) while preserving priority ordering for already enqueued items — this is more complex than a single producer/consumer queue.

Efficiency considerations and optimizations
- Avoid busy-wait: blocking queues and `Semaphore.acquire()` remove spinning.
- Minimize contention: each stage is decoupled with queues and uses fixed-size thread pools; the single-threaded police worker avoids lock contention in the alert processing stage.
- Potential hotspot: the shared `processed` list uses `synchronizedList`; if iteration-heavy, replace with `CopyOnWriteArrayList` or add explicit locking.

Deadlock analysis
- No nested locks are held; semaphore is only used to bound capacity and is always released after the item is processed. Blocking occurs only at well-defined entry points (enqueue), and permits are released in finally blocks, so no lock cycles exist.

Integration with project domain
- The simulation models real-world camera processing and police alerting. These results are consumed by REST controllers (`/camera`, `/police`, `/vehicle`) and by the `ITVService` which represents an external data source (ITV records). Simulation results (processed alerts) are available via `PoliceService#getProcessedAlerts()` for further use in the application.

Test evidence
- A unit/integration test demonstrates that capacity bounds are enforced and that under contention the system applies backpressure rather than growing unbounded.

Next steps
- Replace `System.out.println` with `slf4j` logging and add a test appender to capture traces for order verification.
- If inter-process integration is required, add an HTTP-based mock for `ITVService` and tests using `WireMock` to demonstrate correct IPC handling.
