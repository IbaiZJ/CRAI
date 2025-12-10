# Monitorizacion y control en tiempo real

Interfaces y garantias de concurrencia para consultar y modificar la simulacion mientras está en marcha.

## Consultar estado
- `GET/POST /simulation/status`: devuelve texto `Running` o `Stopped` consultando `SimulationState` (métodos `synchronized`).
- `GET /admin/status`: JSON con `ocrDelayMs`, `stolenProbability`, `itvFailProbability`, `cameraCount`.
- `GET /camera/status`: tamaño de la cola y número de cámaras activas.
- `GET /police/alerts`: histórico procesado en `PoliceService` (copiado inmutable).

## Modificar parámetros en runtime
- `POST /simulation/start` / `/simulation/stop`: cambian `running` de `SimulationState` de forma thread-safe.
- `POST /admin/update`: admite varios campos en un cuerpo JSON (`cameraCount`, probabilidades, delays, intervalos). Valida rangos antes de aplicar.
- Endpoints específicos: `/admin/cameras`, `/admin/vehicles-per-cycle`, `/admin/vehicle-interval`, `/admin/ocr-delay`, `/admin/steal-prob`, `/admin/itv-prob`.
- `POST /vehicle/send`: inserta un `Vehicle` manual en la cola prioritaria (no comparte memoria directa, solo mensajes).

## Garantías de seguridad de hilo
- `SimulationState`: métodos `synchronized` para `running`.
- `SimulationConfig`: campos `volatile` para visibilidad inmediata entre hilos de cámara/policía/spawner.
- Colas bloqueantes: `BoundedPriorityBlockingQueue<Vehicle>` y `LinkedBlockingQueue<PoliceMessage>` evitan compartir estructuras internas y dan backpressure.
- Históricos: `PoliceService` expone listas copiadas (`List.copyOf`) para evitar fugas de estado mutable.

## Integración externa
- Webhook opcional a Node-RED (`node-red.webhook-url`), que recibe las alertas `PoliceMessage` y puede reenviar por email/Telegram.
- Endpoints aceptan GET/POST para facilitar nodos `http request` e `inject` de Node-RED.
