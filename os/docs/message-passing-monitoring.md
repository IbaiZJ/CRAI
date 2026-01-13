# Synchronization via message passing

This document explains how we solve synchronization using message passing (queues) instead of shared memory, and compares it with a monitor/semaphore approach.

## Problem solved with queues
- **Context**: multiple producers generate `Vehicle` and several consumers (cameras) process them respecting priorities. Instead of locks, we use a bounded priority queue.
- **Messages**:
  - `Vehicle`: `plate`, `priority`, `envTag`, `stolen`, `alertVehicle`, `itvFail`.
  - `PoliceMessage`: `type` (`BADGE`, `ITV`, `POLICE`), `plate`, `description`, `messageText`, optional `recipientEmail`.
- **Communication pattern**:
  1) Producer (`VehicleSpawnerService` or `/vehicle/send`) -> `BoundedPriorityBlockingQueue<Vehicle>` (cameras).
  2) Camera worker -> `LinkedBlockingQueue<PoliceMessage>` (police).
  3) Police worker -> log/HTTP webhook.
- **Synchronization without shared memory**: exclusion and ordering are guaranteed by blocking `put/take` operations on the queues; no mutable state is shared between stages, only immutable messages.
- **Backpressure**: the bounded queue blocks producers when full, preventing overflows and setting the pace for consumers.

## Comparison with monitors/semaphores
- **Advantages (queues)**: decoupling between stages, built-in backpressure, lower deadlock risk, easy to scale worker count.
- **Disadvantages**: overhead from copies/queues and latency if they fill; less fine-grained control of individual critical regions.
- **When to use**: stages between independent threads/services -> queues; targeted protection of shared state -> monitors (`synchronized`) or semaphores.

## Code references
- Queues: `CameraPoolService` uses `BoundedPriorityBlockingQueue<Vehicle>`; `PoliceService` uses `LinkedBlockingQueue<PoliceMessage>`.
- Messages: `Vehicle` and `PoliceMessage` classes.
- External integration: `/alerts` (Node-RED) consumes serialized `PoliceMessage` (see flow `docs/node-red/enviar-email..json`).
