# Endpoints de monitorizacion y control

Guia rapida de las rutas REST disponibles. Ajusta host/puerto si no es `localhost:8080`.

## Simulacion
- `GET/POST /simulation/start`  
  Arranca la simulacion (`running=true`), el generador de vehiculos comienza a encolar.
- `GET/POST /simulation/stop`  
  Detiene la simulacion (`running=false`), el generador deja de encolar.
- `GET/POST /simulation/status`  
  Devuelve texto: `Running` o `Stopped`.

## Configuracion en caliente
- `GET /admin/status`  
  Devuelve JSON con `ocrDelayMs`, `stolenProbability`, `itvFailProbability`, `cameraCount`.
- `POST /admin/update`  
  Cambia varios parametros a la vez (JSON). Campos soportados: `cameraCount`, `stolenProbability`, `itvFailProbability`, `ocrDelayMs`, `vehiclesPerCycle`, `vehicleIntervalMs`. Valida rangos y responde con `updated` y `errors`.
- `POST /admin/cameras?count=N`  
  Ajusta numero de camaras y reescala workers.
- `POST /admin/vehicles-per-cycle?n=N`  
  Cambia cuantos vehiculos se generan por ciclo.
- `POST /admin/vehicle-interval?ms=NUM`  
  Cambia el intervalo de generacion (ms).
- `POST /admin/ocr-delay?ms=NUM`  
  Cambia el retardo simulado de OCR (ms).
- `POST /admin/steal-prob?prob=0.x`  
  Cambia probabilidad de vehiculo robado.
- `POST /admin/itv-prob?prob=0.x`  
  Cambia probabilidad de ITV fallida.

## Vehiculos y colas
- `POST /vehicle/send`  
  Cuerpo JSON `Vehicle` para encolar manualmente: `plate`, `priority`, `alertVehicle`, opcional `envTag`, `stolen`.
- `GET /camera/status`  
  Texto con tamano de cola y numero de camaras activas.
- `GET /police/alerts`  
  Lista las alertas procesadas (historial de PoliceService).

## Ejemplos rapidos (curl)
```bash
# Arrancar simulacion
curl -X POST http://localhost:8080/simulation/start

# Parar simulacion
curl -X POST http://localhost:8080/simulation/stop

# Estado
curl http://localhost:8080/simulation/status

# Estado de config
curl http://localhost:8080/admin/status

# Actualizar varios parametros
curl -X POST http://localhost:8080/admin/update \
  -H "Content-Type: application/json" \
  -d '{"cameraCount":4,"stolenProbability":0.1,"itvFailProbability":0.2,"ocrDelayMs":150,"vehiclesPerCycle":2,"vehicleIntervalMs":1000}'

# Enviar un vehiculo manual
curl -X POST http://localhost:8080/vehicle/send \
  -H "Content-Type: application/json" \
  -d '{"plate":"1234ABC","priority":5,"alertVehicle":true,"envTag":"C","stolen":false}'
```
