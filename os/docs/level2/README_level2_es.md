# 🇪🇸 **DOCUMENTACIÓN COMPLETA (VERSIÓN EN CASTELLANO)**

---

# 📘 **1. Introducción**

Este proyecto implementa una **simulación avanzada multihilo** que modela el comportamiento de un sistema inteligente de control de acceso a zonas urbanas restringidas. Los vehículos llegan de forma concurrente, un conjunto de cámaras captura sus matrículas, un módulo OCR procesa cada matrícula y un clasificador determina si el vehículo tiene permitido el acceso.

La simulación se integra completamente con **Node-RED**, permitiendo que cualquier sistema externo la dispare enviando parámetros mediante HTTP.

---

# 🧠 **2. Propósito y relevancia en el dominio**

El objetivo es reproducir el funcionamiento real de un sistema de control ambiental basado en matrículas. Cada etapa del sistema real está representada en esta simulación.

| Sistema real           | Simulación             |
| ---------------------- | ---------------------- |
| Cámara física          | CameraWorker           |
| Motor OCR              | OCRWorker              |
| Clasificador ambiental | ClassifierWorker       |
| Flujo de vehículos     | Vehículos concurrentes |
| Middleware             | Node-RED API           |

Esta simulación ayuda a estudiar:

* Saturación del OCR
* Cuellos de botella
* Manejo de concurrencia
* Prioridades
* Comportamientos bajo carga

---

# 🏗️ **3. Arquitectura General**

La simulación está dividida en tres etapas independientes:

### **Vehículos**

Hilos individuales con prioridad.

### **Cámaras (Etapa 1)**

Procesan los vehículos según prioridad.

### **OCR (Etapa 2)**

Simula procesamiento costoso.

### **Clasificador (Etapa 3)**

Asigna etiqueta ambiental.

### **Integración Node-RED**

Envía parámetros y recibe resultados en JSON.

---

# 🔄 **4. Pipeline Multietapa**

```
Vehículos → Cámaras → OCR → Clasificador → Resultado
```

Cada etapa funciona en paralelo, generando:

* Dependencias complejas
* Sincronización avanzada
* Flujo realista
* Cuellos de botella controlados

---

# 🔒 **5. Sincronización avanzada**

La simulación incluye:

### ✔ Diferentes tipos de hilos

### ✔ Múltiples recursos compartidos

### ✔ Priorización de vehículos

### ✔ Colas bloqueantes (sin busy waiting)

### ✔ Orden estricto entre etapas

Esto supera ampliamente el nivel básico de productor-consumidor.

---

# ⚙️ **6. Optimización y Eficiencia**

Se aplicaron varias estrategias:

### ✔ Estructuras concurrentes para evitar bloqueos

### ✔ ThreadPoolExecutor para evitar “thread explosion”

### ✔ Control de presión en colas

### ✔ Separación de etapas para equilibrar carga

---

# 🔗 **7. Integración con Node-RED**

Node-RED envía:

```json
{
  "vehicles": 50,
  "cameras": 3,
  "ocrWorkers": 5,
  "classifiers": 3
}
```

Java ejecuta la simulación y devuelve:

```json
{
  "processed": 50,
  "allowed": 31,
  "denied": 19,
  "avgTimeMs": 742,
  "peakQueueSize": 23
}
```

Esto demuestra:

* Comunicación entre procesos
* Interacción con otro subsistema
* Servicio reutilizable
* Parametrización dinámica

---

# 📊 **8. UML Diagram (PlantUML)**

---

# 📄 **9. Conclusiones**

La simulación:

* Representa fielmente el sistema real
* Cumple los requisitos de sincronización avanzada
* Está completamente integrada con Node-RED
* Es configurable, robusta y eficiente
* Produce métricas útiles para análisis

---

