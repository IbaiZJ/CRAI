# Documentacion del proyecto CRAI

Guia de arquitectura, endpoints, ejecucion, integracion con Node-RED, pruebas y diagramas.

## 1. Arquitectura y flujo
- **Dominios principales**: `Vehicle` (matricula, prioridad, envTag, flags alerta/robo/itv) y `PoliceMessage` (BADGE/ITV/POLICE).
- **Paso de mensajes**: cola acotada de camaras (`BoundedPriorityBlockingQueue<Vehicle>`) y cola de policia (`LinkedBlockingQueue<PoliceMessage>`). Productores: `VehicleSpawnerService` o `/vehicle/send`; consumidores: workers de `CameraPoolService` -> `PoliceService`.
- **Validaciones en camara**: etiqueta ambiental, ITV, vehiculo robado/alerta. Ante infraccion se emite `PoliceMessage`.
- **Procesado en policia**: un worker consume la cola, guarda historico y puede reenviar por log/webhook HTTP (Node-RED).
- **Configuracion en caliente**: `SimulationConfig` (volatile) y `SimulationState` (synchronized) controlan probabilidades, retrasos de OCR, numero de camaras, intervalo y flag running.

## 2. Endpoints REST (resumen)
- `/simulation/start|stop|status` (GET/POST): controla o consulta ejecucion.
- `/admin/status`: JSON con configuracion activa.
- `/admin/update`: cambia varios parametros (camaras, probabilidades, delays, intervalo, vehiclesPerCycle).
- Endpoints individuales: `/admin/cameras`, `/admin/vehicles-per-cycle`, `/admin/vehicle-interval`, `/admin/ocr-delay`, `/admin/steal-prob`, `/admin/itv-prob`.
- `/vehicle/send`: encola un vehiculo manual.
- `/camera/status`: tamano de cola y workers activos.
- `/police/alerts`: historico de alertas procesadas.

## 3. Ejecucion local
```bash
# Arrancar backend
mvn spring-boot:run

# Arrancar simulacion
curl -X POST http://localhost:8080/simulation/start

# Estado de simulacion
curl http://localhost:8080/simulation/status
```
Config por defecto: webhook desactivado en tests; para Node-RED definir `node-red.webhook-url=http://localhost:1880/alerts` en `application.properties` o variable de entorno.

## 4. Integracion Node-RED (email/Telegram)
- Flujo de ejemplo: `docs/node-red/enviar-email..json`.
- Nodo HTTP IN `/alerts` recibe `type` (ITV/POLICE), `plate`, `description`, `recipientEmail`, `chatId`.
- ITV caducada -> email (SMTP Gmail) y Telegram; robado/badge -> Telegram. Configura credenciales SMTP y `chatId` del bot.
- Prueba rapida:
```
curl -X POST http://localhost:1880/alerts \
  -H "Content-Type: application/json" \
  -d '{"type":"ITV","plate":"1234ABC","description":"ITV CADUCADA del vehiculo 1234ABC","recipientEmail":"tucorreo@dominio.com","chatId":123456789}'
```

## 5. Concurrencia y diseno
- Colas bloqueantes para backpressure y desacoplo.
- `SimulationState` sincronizado; `SimulationConfig` con `volatile` para visibilidad.
- Documentacion detallada: `message-passing-monitoring.md` (colas vs locks) y `monitoring-control.md` (consultar/editar en runtime).
- Diagramas en este directorio (PlantUML): `class.puml`, `sequence.puml`, `state.puml`, `deployment.puml`, `useCase.puml`.

## 6. Pruebas y cobertura
- Ejecutar: `mvn test`.
- JaCoCo configurado en `pom.xml` (prepare-agent + report). Reporte: `target/site/jacoco/index.html`.
- Suites clave: `CameraPoliceIntegrationTest`, `PriorityOrderingTest`, `DomainRulesTest`, servicios, utilidades y repositorios.

## 7. Estructura
- `src/main/java/com/crai/os/...`: codigo de dominio, servicios, config.
- `src/test/java/com/crai/os/...`: pruebas unitarias e integracion.
- `docs/`: este README, diagramas PlantUML y flujos Node-RED.
- `pom.xml`: dependencias y plugins (Spring Boot, JaCoCo).

## 8. Notas de operacion
- Ajusta `application.properties` o variables para:
  - `server.port`
  - `node-red.webhook-url`
  - Credenciales SMTP en Node-RED para email.
- En entorno sin Node-RED, deja el webhook vacio para evitar errores de conexion.
