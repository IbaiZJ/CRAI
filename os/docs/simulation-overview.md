# CRAI Simulation – Mensajeria, Control en Tiempo Real y Endpoints

## 1. Cómo funciona la simulación
- **Generación de vehículos**: `VehicleSpawnerService` crea vehículos con probabilidades configurables y los encola en la cola prioritaria de cámaras.
- **Cámaras (workers)**: `CameraPoolService` consume de la cola, valida etiqueta ambiental, ITV y si el vehículo está marcado/robado. Ante infracción, emite un mensaje a la cola de policía.
- **Policía**: `PoliceService` consume alertas, las registra y puede reenviarlas (webhook Node-RED).
- **Control de ejecución**: `SimulationState` determina si la simulación está en marcha; el generador solo produce cuando está en `running=true`.
- **Configuración dinámica**: `SimulationConfig` expone parámetros (delays, probabilidades, número de cámaras, intervalos) que se pueden modificar en caliente vía API.

## 2. Endpoints de monitorización y control
- `GET/POST /simulation/start` · Arranca la simulación (`running=true`).
- `GET/POST /simulation/stop` · Detiene la simulación (`running=false`).
- `GET/POST /simulation/status` · Devuelve `Running` o `Stopped`.
- `GET /admin/status` · JSON con `ocrDelayMs`, `stolenProbability`, `itvFailProbability`, `cameraCount`.
- `POST /admin/update` · Cambia varios parámetros a la vez (JSON). Responde con `updated` y `errors`.
- Ajustes individuales:
  - `/admin/cameras?count=N`
  - `/admin/vehicles-per-cycle?n=N`
  - `/admin/vehicle-interval?ms=NUM`
  - `/admin/ocr-delay?ms=NUM`
  - `/admin/steal-prob?prob=0.x`
  - `/admin/itv-prob?prob=0.x`
- `POST /vehicle/send` · Encola un vehículo manual (`plate`, `priority`, `alertVehicle`, opcional `envTag`, `stolen`).
- `GET /camera/status` · Tamaño de cola y número de cámaras activas.
- `GET /police/alerts` · Histórico de alertas procesadas.

## 3. Modelo de paso de mensajes (message passing)
- **Cola de cámaras** (`BoundedPriorityBlockingQueue<Vehicle>`): productores (`VehicleSpawnerService`, `/vehicle/send`) → consumidores (workers de cámara). Cola acotada = backpressure si se llena.
- **Cola de policía** (`LinkedBlockingQueue<PoliceMessage>`): productores (cámaras) → consumidor único (`PoliceService`). Mantiene histórico con `List.copyOf(processed)`.
- **Mensajes**:
  - `Vehicle`: `plate`, `priority`, `envTag`, `stolen`, `alertVehicle`, `itvFail`.
  - `PoliceMessage`: `type` (`BADGE`, `ITV`, `POLICE`), `plate`, `description`, `messageText`, opcional `recipientEmail` (para reenviar aviso ITV al propietario).
- **Patrón**: productor/consumidor en cascada (Vehicle → Cámara → Policía). No hay acceso directo a memoria compartida entre etapas; la sincronización se logra con colas bloqueantes (`put/take`).
- **Backpressure**: colas acotadas bloquean a los productores cuando se llenan, evitando desbordar memoria.
- **Integración externa**: endpoints aceptan GET/POST para Node-RED; flujo de ejemplo en `docs/node-red/sumulation.json`.

## 4. Seguridad de hilo
- `SimulationState`: métodos `synchronized` para el flag `running`.
- `SimulationConfig`: campos `volatile` para visibilidad inmediata entre hilos.
- Colas bloqueantes: excluyen acceso concurrente y ordenan mensajes sin exponer estado mutable compartido.

## 5. Comparativa rápida: Monitores/Semáforos vs Paso de Mensajes

| Aspecto                | Monitores / Semáforos                      | Paso de Mensajes (Colas)                       |
|------------------------|--------------------------------------------|-----------------------------------------------|
| Acoplamiento           | Más alto (hilos comparten datos/locks)    | Bajo (productor/consumidor desacoplados)      |
| Complejidad            | Manejo explícito de locks/esperas         | API simple (`put/take`), menos riesgo de deadlock |
| Backpressure           | No incorporada, hay que implementarla     | Natural con colas acotadas                    |
| Escalabilidad          | Ajustar hilos requiere cuidar locks       | Añadir/quitar workers con mínimo impacto      |
| Latencia               | Menor overhead si no hay contención        | Puede añadir cola/espera cuando está llena    |
| Visibilidad/Orden      | Depende de disciplina de locks             | Orden definido por la cola (prioridad/FIFO)   |

## 6. Ejemplos rápidos (curl)
```bash
# Arrancar simulación
curl -X POST http://localhost:8080/simulation/start

# Estado
curl http://localhost:8080/simulation/status

# Actualizar parámetros
curl -X POST http://localhost:8080/admin/update \
  -H "Content-Type: application/json" \
  -d '{"cameraCount":4,"stolenProbability":0.1,"itvFailProbability":0.2,"ocrDelayMs":150,"vehiclesPerCycle":2,"vehicleIntervalMs":1000}'

# Enviar vehículo manual
curl -X POST http://localhost:8080/vehicle/send \
  -H "Content-Type: application/json" \
  -d '{"plate":"1234ABC","priority":5,"alertVehicle":true,"envTag":"C","stolen":false}'
```
