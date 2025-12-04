Perfecto Aitor.
Aquí tienes **EL README COMPLETO**, profesional, estructurado y listo para tu repositorio de GitHub y para entregar en el PBL5.
Incluye absolutamente TODO: estructura del proyecto, descripción de módulos, multithreading, flujo completo, endpoints, ejecución, UML textual, mejoras futuras y conclusiones.

---

# ✅ **README COMPLETO — CRAI Simulation System**

```md
# CRAI Simulation System
### Multithreaded Vehicle Control Simulation (Cameras · ITV · Environmental Alerts · Police)

Proyecto desarrollado para el **PBL5** de Mondragon Unibertsitatea.  
Simula un sistema real de vigilancia vial mediante cámaras, validación de ITV, control ambiental y generación de alertas policiales usando **Spring Boot + multithreading concurrente**.

---

# 📁 1. Estructura del Proyecto

El proyecto sigue una arquitectura modular clara y escalable:

```

src/main/java/com/crai/simulation
│
├── config/
├── controller/
├── model/
├── repository/
├── service/
└── utils/

````

### 📂 /config — Configuración
Contiene clases de configuración y beans globales.

- `SimulationConfig.java` → nº cámaras, activar OCR, parámetros.
- `AppConfig.java` → thread pools, inicializadores, beans comunes.

📌 **Responsabilidad**: Centralizar configuración sin mezclarla con lógica.

---

### 📂 /controller — API REST
Expone endpoints para controlar la simulación.

- `SimulationController` → iniciar/pausar simulación.
- `VehicleController` → enviar vehículos manualmente.
- `CameraController` → ver cola de cámaras.
- `PoliceController` → ver alertas.

📌 **Responsabilidad**: Comunicación externa (frontends, Postman, Node-RED…).

---

### 📂 /model — Modelos de Datos
Clases simples (POJOs) que representan la información del sistema.

- `Vehicle` → matrícula, prioridad, alerta ambiental.
- `ITVRecord` → fecha ITV y nivel de riesgo.
- `ITVStatus` → VALID / EXPIRED / DANGEROUS / UNKNOWN.
- `PoliceMessage` → descripción y tipo.
- `PoliceMessageType` → ALERT / INFO.
- `AlertType` → tipos de infracción.

📌 **Responsabilidad**: Transportar información entre servicios.

---

### 📂 /repository — Acceso a datos
Acceso a datos ITV en memoria (preparado para BD futura).

- `ITVRepository` → almacena registros ITV en un `ConcurrentHashMap`.

📌 **Responsabilidad**: Abstraer la persistencia.

---

### 📂 /service — Lógica y Multithreading
El núcleo del sistema.

#### 📸 `CameraPoolService`
- Gestiona N cámaras en paralelo (`ExecutorService`).
- Cola concurrente `PriorityBlockingQueue<Vehicle>`.
- Cada cámara:
  - procesa vehículos
  - consulta ITV
  - evalúa alertas ambientales
  - genera alertas policiales si procede

#### 🔧 `ITVService`
Valida automáticamente el estado ITV y clasifica su gravedad.

#### 🚨 `PoliceService`
- Cola `BlockingQueue<PoliceMessage>`
- Worker 24/7 procesando alertas
- Preparado para integrarse con Node-RED / Telegram

#### 🧠 `SimulationService`
Coordina el inicio, pausa y reset de toda la simulación.

#### 🔍 `OCRService` (opcional)
Cola e hilo dedicado a reconocimiento de matrículas mediante IA.

📌 **Responsabilidad**: Encapsular reglas, hilos y lógica del sistema.

---

### 📂 /utils — Utilidades
Clases de apoyo:
- `RandomVehicleGenerator`
- `LoggingUtils`
- `VehicleMapper`

---

# 🔄 2. Flujo General de la Simulación

1. El usuario o el sistema envía un vehículo al sistema.
2. Entra en la cola de cámaras.
3. Una cámara libre lo captura (hilo independiente).
4. La cámara:
   - Consulta ITVService
   - Revisa etiqueta ambiental
5. Si hay infracción grave:
   - Se genera un `PoliceMessage`
   - Se envía a `PoliceService`
6. PoliceService procesa las alertas en otro hilo:
   - Las muestra por consola
   - Futuro: enviarlas a Node-RED/Telegram/Firestore

---

# 🧵 3. Modelo de Concurrencia

| Componente             | Tipo de cola                              | Hilos |
|------------------------|--------------------------------------------|-------|
| Cámaras                | `PriorityBlockingQueue<Vehicle>`           | N hilos paralelos |
| Policía                | `BlockingQueue<PoliceMessage>`             | 1 worker |
| OCR (opcional)         | `BlockingQueue<String>`                    | 1 worker |
| Simulación             | Controlador central                        | 1 hilo |

**Ventajas:**
- Alta escalabilidad  
- Flujo realista de sistemas de tráfico  
- Aislamiento entre módulos  

---

# 🧠 4. Módulos en Detalle

## 📸 CameraPoolService (núcleo del sistema)

- Crea un pool de cámaras:
```java
Executors.newFixedThreadPool(cameraCount)
````

* Recibe vehículos mediante:

```java
queue.add(vehicle);
```

* Cada cámara:

  * Toma un vehículo
  * Procesa ITV
  * Evalúa infracciones ambientales
  * Si infracción ≥ grave → Alerta a Policía

---

## 🔧 ITVService

Casos:

* **VALID** → Todo correcto
* **EXPIRED** → Infracción leve (opcional enviar a policía)
* **DANGEROUS** → ITV muy caducada → alerta policial inmediata
* **UNKNOWN** → No existen datos

---

## 🚨 PoliceService

* Cola dedicada:

```java
BlockingQueue<PoliceMessage> policeQueue;
```

* Worker:

```java
new Thread(this::policeWorker).start();
```

* Procesa alertas graves las 24/7

---

## 🔍 OCRService (opcional)

* Procesa matrículas con IA
* Recibe imágenes desde CameraPool
* Devuelve matrículas limpias

---

# 🌐 5. Endpoints de la API

### ▶ Enviar vehículo a la simulación

```
POST /simulation/vehicle
```

Body:

```json
{
  "id": "1234ABC",
  "priority": 5,
  "alertVehicle": true
}
```

### ▶ Iniciar simulación

```
POST /simulation/start
```

### ▶ Ver estado

```
GET /simulation/status
```

### ▶ Ver alertas policiales

```
GET /police/alerts
```

---

# 🚀 6. Cómo ejecutar el proyecto

### Requisitos:

* Java 17+
* Maven 3+
* Spring Boot 3.2+

### Ejecución:

```bash
mvn clean install
mvn spring-boot:run
```

API disponible en:

```
http://localhost:8080
```

---

# 📊 7. Diagrama UML Textual

```
Vehicle --> CameraPoolService
CameraPoolService --> ITVService
CameraPoolService --> PoliceService
PoliceService --> PoliceMessage
ITVService --> ITVRecord
SimulationController --> SimulationService
SimulationService --> CameraPoolService
```

---

# 🧭 8. Diagrama de Flujo Textual

```
[Vehicle Enters] 
      ↓
[Camera Queue]
      ↓
[Camera Worker Thread]
      → ITVService → (DANGEROUS?) → PoliceService ALERT
      → Environmental filter → PoliceService ALERT
      ↓
[Process Completed]
```

---

# 🔮 9. Mejoras Futuras

* Integración completa con OCR real (YOLO/EasyOCR).
* Dashboard WebSocket en tiempo real.
* Persistencia en Firestore o MySQL.
* Notificaciones automáticas por Telegram o Node-RED.
* Microservicios separados (Cámaras, ITV, Policía).

---

# 👨‍💻 Autor

Proyecto desarrollado por
** -- **
Mondragon Unibertsitatea — PBL5

---

# 📄 Licencia

Uso académico y demostrativo.

```

---

# 🎉 **README COMPLETO GENERADO**

Si quieres, ahora puedo generar:

### 📌 **Un README para profesores (versión técnica)**  
### 📌 **Un README más visual para GitHub (con iconos, badges, etc.)**  
### 📌 **Diagramas UML en imagen (PlantUML / Mermaid)**  
### 📌 **Un PDF profesional listo para entregar**

¿Qué versión quieres ahora?
```
