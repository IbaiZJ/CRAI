# Synchronization via message passing

Este documento explica como resolvemos sincronizacion usando paso de mensajes (colas) en lugar de memoria compartida, y compara con un enfoque de monitores/semáforos.

## Problema resuelto con colas
- **Contexto**: multiple productores generan `Vehicle` y varios consumidores (cámaras) los procesan respetando prioridades. En lugar de locks, usamos una cola acotada con prioridad.
- **Mensajes**:
  - `Vehicle`: `plate`, `priority`, `envTag`, `stolen`, `alertVehicle`, `itvFail`.
  - `PoliceMessage`: `type` (`BADGE`, `ITV`, `POLICE`), `plate`, `description`, `messageText`, opcional `recipientEmail`.
- **Patrón de comunicación**:
  1) Productor (`VehicleSpawnerService` o `/vehicle/send`) → `BoundedPriorityBlockingQueue<Vehicle>` (cámaras).  
  2) Worker de cámara → `LinkedBlockingQueue<PoliceMessage>` (policía).  
  3) Worker de policía → log/webhook HTTP.
- **Sincronización sin memoria compartida**: la exclusión y el orden los garantizan las operaciones bloqueantes `put/take` de las colas; no se comparte estado mutable entre etapas, solo mensajes inmutables.
- **Backpressure**: la cola acotada bloquea productores si está llena, evitando desbordes y marcando el ritmo a los consumidores.

## Comparativa con monitores/semáforos
- **Ventajas (colas)**: desacoplo entre etapas, backpressure incorporada, menos riesgo de deadlocks, fácil escalar número de workers.
- **Desventajas**: overhead de copias/colas y latencia si se llenan; menos control fino de regiones críticas individuales.
- **Cuándo usar**: pasos entre hilos/servicios independientes → colas; protección puntual de estado compartido → monitores (`synchronized`) o semáforos.

## Referencias en el código
- Colas: `CameraPoolService` usa `BoundedPriorityBlockingQueue<Vehicle>`; `PoliceService` usa `LinkedBlockingQueue<PoliceMessage>`.
- Mensajes: clases `Vehicle` y `PoliceMessage`.
- Integración externa: `/alerts` (Node-RED) consume `PoliceMessage` serializado (ver flujo `docs/node-red/enviar-email..json`).
