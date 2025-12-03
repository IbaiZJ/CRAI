# Modelo de paso de mensajes y control en tiempo real

## Paso de mensajes (message passing)
- **Cola de cámaras (`BoundedPriorityBlockingQueue<Vehicle>`)**: productores (`VehicleSpawnerService` o `/vehicle/send`) publican `Vehicle` con prioridad; consumidores son los workers de `CameraPoolService`. Provee backpressure (se bloquea al llenarse) y evita compartir estructuras internas entre productores/consumidores.
- **Cola de policía (`LinkedBlockingQueue<PoliceMessage>`)**: los workers de cámara publican alertas (`PoliceMessage`) y un único worker en `PoliceService` las consume y reenvía (log/webhook). También mantiene un histórico inmutable (`List.copyOf(processed)`).
- **Tipos de mensaje**:
  - `Vehicle`: `plate`, `priority`, `envTag`, `stolen`, `alertVehicle`, `itvFail`.
  - `PoliceMessage`: `type` (`BADGE`, `ITV`, `POLICE`), `plate`, `description`, `messageText`.
- **Patrón de comunicación**: productor/consumidor en cascada (Vehicle -> Cámara -> Policía). No hay acceso directo a memoria compartida entre etapas; la sincronización se consigue a través de colas bloqueantes y espera en `put/take`.
- **Comparativa con semáforos/monitores**:
  - *Ventajas message passing*: desacopla etapas, simplifica el reasoning (no locks explícitos), backpressure natural con colas acotadas, tolera cambios en número de workers.
  - *Desventajas*: overhead de colas/copias, menos control fino sobre prioridades cuando hay varias colas, posible retardo si la cola se llena.
  - *Cuándo usar cada uno*: pasos entre servicios/hilos independientes -> colas; protección de configuración compartida puntual -> `volatile`/`synchronized`.

## Monitorización y control en tiempo real
- **Estado**:
  - `/simulation/status` (GET/POST): devuelve `"Running"` o `"Stopped"` (consulta `SimulationState`, sincronizado).
  - `/admin/status` (GET): JSON con `ocrDelayMs`, `stolenProbability`, `itvFailProbability`, `cameraCount`.
  - `CameraPoolService#getStatus()`: tamaño de cola y número de cámaras (útil para exponer en un endpoint si se desea).
- **Control / cambios en runtime**:
  - `/simulation/start` y `/simulation/stop` (GET/POST): alteran `SimulationState`; el `VehicleSpawnerService` solo genera cuando está en `running=true`.
  - `/admin/update` (POST JSON): cambia `cameraCount`, probabilidades, delays e intervalos. Valida rangos y devuelve `updated` y `errors`.
  - `/admin/cameras`, `/admin/vehicles-per-cycle`, `/admin/vehicle-interval`, etc.: ajustes individuales.
- **Envío de vehículos**:
  - `/vehicle/send` (POST body `Vehicle`): inyecta un vehículo manualmente en la cola de cámaras.
- **Seguridad de hilo**:
  - `SimulationState`: métodos `synchronized` para `running`.
  - `SimulationConfig`: campos `volatile` para visibilidad inmediata en hilos de cámara/policía/spawner.
  - Colas bloqueantes: garantizan exclusión y orden sin exponer estado mutable compartido.
- **Integración externa (Node-RED)**: los endpoints aceptan GET o POST para facilitar nodos `inject`/`http request`. El flujo de ejemplo usa `/simulation/start`, `/simulation/stop` y `/simulation/status`. Puedes extender con un GET a `/admin/status` para métricas de configuración.

## Flujo end-to-end (texto)
1. Generador o `/vehicle/send` coloca `Vehicle` en la cola de cámaras (prioridad).
2. Worker de cámara consume, valida badge/ITV/robado y publica `PoliceMessage` si hay infracción.
3. Worker de policía consume la cola y procesa alertas (log/webhook), manteniendo histórico.
4. `SimulationState` y `SimulationConfig` se modifican vía endpoints para influir en el comportamiento en caliente.
