# CRAI OS - Documentacion para principiantes

Esta carpeta explica TODO el modulo OS (el simulador). Esta escrito para alguien que no sabe nada del tema.

## 1) Idea general (que hace esto)
- Simula coches pasando por camaras.
- Mira si el coche cumple reglas (ITV, etiqueta ambiental, robo).
- Si hay problema, crea una alerta.
- Envia la alerta a Node-RED por un webhook.

## 2) Flujo sencillo (en palabras simples)
1) Entra un coche (creado automaticamente o enviado por API).
2) Se mete en una cola de camaras.
3) Un hilo de camara lo procesa.
4) Si hay infraccion, se crea un mensaje de policia.
5) El mensaje se guarda y se envia a Node-RED.

## 3) Integracion con Node-RED (bidireccional)
- Node-RED llama al OS para arrancar, parar y cambiar parametros.
- El OS envia alertas a Node-RED en `/alerts` por webhook.

## 4) Endpoints REST (lo que puedes llamar)

### Simulacion
- `POST /simulation/start`
- `POST /simulation/stop`
- `GET /simulation/status`

### Configuracion (PUT)
- `PUT /admin/update` (varios parametros a la vez)
- `PUT /admin/ocr-delay`
- `PUT /admin/steal-prob`
- `PUT /admin/itv-prob`
- `PUT /admin/cameras`
- `PUT /admin/vehicles-per-cycle`
- `PUT /admin/vehicle-interval`
- `GET /admin/status`

### Vehiculos y alertas
- `POST /vehicle/send`
- `GET /police/alerts`
- `DELETE /police/alerts` (vaciar alertas)

## 5) Arranque rapido

```bash
cd os
mvn spring-boot:run
```

Ejemplos rapidos:

```bash
curl -X POST http://localhost:8080/simulation/start
curl http://localhost:8080/simulation/status
curl -X PUT http://localhost:8080/admin/update -H "Content-Type: application/json" \
  -d "{\"cameraCount\":3,\"stolenProbability\":0.05}"
curl -X DELETE http://localhost:8080/police/alerts
```

## 6) Configuracion basica
En `src/main/resources/application.properties`:
- `node-red.webhook-url=http://backend:1880/alerts`

En local puedes usar:
- `node-red.webhook-url=http://localhost:1880/alerts`

## 7) Estructura del codigo (explicacion clase por clase)

### 7.1 Paquete principal
- `os/src/main/java/com/crai/os/OsApplication.java`
  - Es el punto de entrada de Spring Boot.
  - Arranca la aplicacion y guarda el contexto para tests.

### 7.2 Configuracion
- `os/src/main/java/com/crai/os/config/AppConfig.java`
  - Crea beans simples (LoggingUtils y VehicleMapper).
  - Es un sitio donde declaras objetos compartidos.
- `os/src/main/java/com/crai/os/config/SimulationConfig.java`
  - Guarda todos los parametros de simulacion (camaras, delays, probabilidades).
  - Tiene getters y setters para cambiar valores en caliente.
  - Guarda la URL del webhook de Node-RED.

### 7.3 Controladores (API REST)
- `os/src/main/java/com/crai/os/controller/SimulationController.java`
  - Endpoints para arrancar, parar y ver estado.
  - Llama a `SimulationService`.
- `os/src/main/java/com/crai/os/controller/ControlController.java`
  - Endpoints para cambiar parametros (PUT).
  - Valida que los valores sean correctos.
  - Si algo es invalido, devuelve errores.
- `os/src/main/java/com/crai/os/controller/VehicleController.java`
  - Recibe un vehiculo por API y lo mete en la cola.
  - Llama a `CameraPoolService`.
- `os/src/main/java/com/crai/os/controller/CameraController.java`
  - Devuelve estado de la cola y numero de camaras activas.
- `os/src/main/java/com/crai/os/controller/PoliceController.java`
  - Devuelve alertas procesadas.
  - Permite vaciar alertas (DELETE).

### 7.4 Modelos (datos simples)
- `os/src/main/java/com/crai/os/model/Vehicle.java`
  - Representa un coche: matricula, prioridad, etiqueta, robo, etc.
  - Implementa Comparable para que los coches con mas prioridad vayan primero.
- `os/src/main/java/com/crai/os/model/VehicleEvent.java`
  - Un evento simple con matricula y tiempo.
- `os/src/main/java/com/crai/os/model/Owner.java`
  - Informacion basica del propietario (matricula, email, nombre).
- `os/src/main/java/com/crai/os/model/PoliceMessage.java`
  - Mensaje de alerta (tipo, matricula, descripcion, email).
- `os/src/main/java/com/crai/os/model/PoliceMessageFactory.java`
  - Crea mensajes de alerta con texto ya preparado.
  - Evita repetir logica en varios sitios.
- `os/src/main/java/com/crai/os/model/ITVRecord.java`
  - Guarda la fecha de caducidad ITV de una matricula.
- `os/src/main/java/com/crai/os/model/ITVStatus.java`
  - Enum con estados ITV (VALID, EXPIRED, etc).
- `os/src/main/java/com/crai/os/model/AlertType.java`
  - Enum con tipos de alerta (POLICE, ITV, BADGE).
- `os/src/main/java/com/crai/os/model/SimulationState.java`
  - Guarda si la simulacion esta corriendo o no.
  - Es sincronizado para evitar problemas entre hilos.

### 7.5 Repositorios (memoria)
- `os/src/main/java/com/crai/os/repository/ITVRepository.java`
  - Guarda ITVRecord en memoria (ConcurrentHashMap).
  - Sirve como base de datos sencilla para la simulacion.
- `os/src/main/java/com/crai/os/repository/OwnerRepository.java`
  - Guarda propietarios y matrículas de ejemplo.
  - Se usa para enviar email en alertas de ITV.

### 7.6 Servicios (logica de negocio)
- `os/src/main/java/com/crai/os/service/SimulationService.java`
  - Enciende o apaga la simulacion.
- `os/src/main/java/com/crai/os/service/VehicleSpawnerService.java`
  - Crea vehiculos automaticamente cada cierto tiempo.
  - Solo funciona si la simulacion esta "running".
- `os/src/main/java/com/crai/os/service/CameraPoolService.java`
  - Tiene una cola de vehiculos y un pool de hilos (camaras).
  - Cada hilo saca un vehiculo y aplica reglas.
  - Si hay problema, genera alerta y la envia.
- `os/src/main/java/com/crai/os/service/ITVService.java`
  - Comprueba ITV de un coche.
  - Si no hay datos, crea un registro aleatorio y lo guarda.
- `os/src/main/java/com/crai/os/service/PoliceService.java`
  - Recibe alertas y las guarda.
  - Envia alertas a Node-RED en segundo plano.
  - Permite borrar alertas.
- `os/src/main/java/com/crai/os/service/OCRService.java`
  - Simula un OCR sencillo (devuelve una matricula fija).
  - Ahora es un mock para pruebas.
- `os/src/main/java/com/crai/os/service/AlertFilterService.java`
  - Decide si una alerta se debe enviar o no (ahora solo POLICE).

### 7.7 Utilidades
- `os/src/main/java/com/crai/os/utils/BoundedPriorityBlockingQueue.java`
  - Cola con prioridad y limite de tamaño.
  - Si esta llena, espera; si esta vacia, espera.
- `os/src/main/java/com/crai/os/utils/RandomVehicleGenerator.java`
  - Genera coches aleatorios con probabilidades.
- `os/src/main/java/com/crai/os/utils/SpanishPlateGenerator.java`
  - Genera matriculas españolas aleatorias.
- `os/src/main/java/com/crai/os/utils/VehicleMapper.java`
  - Convierte un Vehicle en un VehicleEvent.
- `os/src/main/java/com/crai/os/utils/LoggingUtils.java`
  - Logger muy simple (System.out).

### 7.8 Excepciones
- `os/src/main/java/com/crai/os/exception/VehicleQueueException.java`
  - Se lanza si algo falla al meter un coche en la cola.

## 8) Pruebas
- Ejecutar: `mvn test`
- Reporte: `os/target/site/jacoco/index.html`

## 9) Resumen muy corto
- OS simula coches y genera alertas.
- Node-RED lo controla y recibe alertas.
- Todo esta dividido en controladores (API), servicios (logica), modelos (datos) y utilidades.
