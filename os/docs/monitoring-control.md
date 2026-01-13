# Real-time monitoring and control

Concurrency guarantees and interfaces to query or modify the simulation while it is running.

## Query state
- `GET/POST /simulation/status`: returns `Running` or `Stopped` by consulting `SimulationState` (methods are `synchronized`).
- `GET /admin/status`: JSON with `ocrDelayMs`, `stolenProbability`, `itvFailProbability`, `cameraCount`.
- `GET /camera/status`: queue size and active camera count.
- `GET /police/alerts`: processed history in `PoliceService` (immutable copy).

## Modify parameters at runtime
- `POST /simulation/start` / `/simulation/stop`: toggles `running` in `SimulationState` in a thread-safe way.
- `POST /admin/update`: accepts multiple fields in a JSON body (`cameraCount`, probabilities, delays, intervals). Validates ranges before applying.
- Specific endpoints: `/admin/cameras`, `/admin/vehicles-per-cycle`, `/admin/vehicle-interval`, `/admin/ocr-delay`, `/admin/steal-prob`, `/admin/itv-prob`.
- `POST /vehicle/send`: inserts a manual `Vehicle` into the priority queue (no direct shared memory, only messages).

## Thread-safety guarantees
- `SimulationState`: `synchronized` methods for `running`.
- `SimulationConfig`: `volatile` fields for immediate visibility across camera/police/spawner threads.
- Blocking queues: `BoundedPriorityBlockingQueue<Vehicle>` and `LinkedBlockingQueue<PoliceMessage>` avoid sharing internal structures and provide backpressure.
- Histories: `PoliceService` exposes copied lists (`List.copyOf`) to prevent mutable state leaks.

## External integration
- Optional webhook to Node-RED (`node-red.webhook-url`), which receives `PoliceMessage` alerts and can forward them by email/Telegram.
- Endpoints accept GET/POST to simplify Node-RED `http request` and `inject` nodes.
