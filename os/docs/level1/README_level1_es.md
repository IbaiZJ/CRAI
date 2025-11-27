Perfecto.
Te voy a generar un **README.md profesional**, totalmente listo para GitHub, que documenta:

* La simulación multihilo
* UML
* Descripción del problema
* Sincronización
* Justificación técnica
* Cómo ejecutar
* Resultados esperados

👉 **Este README ya cumple la rúbrica del PBL y queda espectacular.**

---

# 📄 **README.md — Simulación Multihilo (Vehículos + Cámara + OCR)**

*(Listo para copiar y pegar en tu repositorio)*

---

# 🚗📸 Simulación Concurrente de Vehículos, Cámara y OCR

Este proyecto implementa una **simulación multihilo en Java** basada en el dominio real del PBL: control de acceso de vehículos mediante captura de matrícula y clasificación ambiental por OCR.

El sistema modela un escenario donde:

1. Varios **vehículos** llegan de manera concurrente
2. Una **cámara** captura matrículas (recurso crítico)
3. Las matrículas se almacenan en un **buffer limitado**
4. Un **módulo OCR** procesa cada matrícula y determina si el vehículo está **permitido** o **denegado**

---

# 📘 Índice

* [Descripción general](#descripción-general)
* [Arquitectura de la simulación](#arquitectura-de-la-simulación)
* [Diagrama UML](#diagrama-uml)
* [Sincronización utilizada](#sincronización-utilizada)
* [Justificación técnica](#justificación-técnica)
* [Cómo ejecutar la simulación](#cómo-ejecutar-la-simulación)
* [Trazas de ejecución](#trazas-de-ejecución)
* [Relación con el dominio real](#relación-con-el-dominio-real)
* [Mejoras futuras](#mejoras-futuras)

---

# 🧩 **Descripción general**

La simulación modela un mini-sistema de tráfico inteligente donde varios vehículos intentan acceder a una zona restringida.

Cada vehículo:

1. Llega en paralelo (modelado con `Thread`)
2. Usa una **cámara compartida** para capturar la matrícula
3. Coloca la matrícula en un buffer (productor)
4. El módulo OCR (consumidor) procesa las matrículas

Este escenario permite estudiar:

* Exclusión mutua
* Condiciones de carrera
* Sincronización por monitor
* Modelo Productor–Consumidor
* Deadlocks y cómo evitarlos

---

# 🏗️ **Arquitectura de la simulación**

### ✔ Vehículo (Thread)

* Llega aleatoriamente
* Usa la cámara (zona crítica)
* Produce matrículas en el buffer

### ✔ Cámara (Monitor)

* Solo puede capturar **un vehículo a la vez**
* Implementada usando `synchronized`

### ✔ BufferOCR (Monitor con condiciones)

* Cola limitada
* `producir()` bloquea si está llena
* `consumir()` bloquea si está vacía
* Usa `wait()` y `notifyAll()`

### ✔ OCR (Thread)

* Consumidor continuo
* Procesa matrículas del buffer
* Clasifica ambientalmente

---

# 📊 **Diagrama UML**

---

# 🔒 **Sincronización utilizada**

## **1. Cámara como recurso crítico**

Se implementa con un monitor:

```java
public synchronized String capturarMatricula(int vehiculoId)
```

Garantiza:

* Exclusión mutua
* Ningún vehículo pisa la captura de otro
* Representa una cámara física real

---

## **2. Productor–Consumidor en el OCR**

`BufferOCR` implementa:

```java
wait();
notifyAll();
synchronized
```

Esto asegura:

* Espera ordenada
* Sin busy waiting
* Sin pérdida de matrículas
* Sin deadlocks

---

# 🧠 **Justificación técnica**

### ✔ ¿Por qué monitores (`synchronized`)?

Porque gestionan de forma automática:

* Exclusión mutua
* Variables de condición
* Bloqueo ordenado en métodos críticos

Mucho más seguro que semáforos manuales.

---

### ✔ ¿Por qué un buffer limitado?

Reproduce:

* Saturación real del sistema
* Congestión en horas punta
* Necesidad de gestionar reintentos y tiempos de espera

---

### ✔ ¿Por qué hilos para los vehículos?

Porque en un entorno real:

* Los vehículos **no llegan en orden**
* No llegan en intervalos regulares
* La concurrencia es impredecible

Exactamente igual que en la simulación.

---

# ▶️ **Cómo ejecutar la simulación**

1. Compilar el proyecto:

```
javac src/*.java
```

2. Ejecutar la clase principal:

```
java Main
```

---

# 📟 **Trazas de ejecución esperadas**

Ejemplo real:

```
🚗 Vehículo 3 llega a la zona
📸 Cámara capturando matrícula del vehículo 3
📸 Cámara: matrícula capturada → ABC003
➡️ Entra en cola OCR: ABC003
🔍 OCR procesando: ABC003
✔ OCR ABC003: Etiqueta C → PERMITIDO
```

Demuestran:

* Acceso exclusivo a cámara
* Orden correcto productor–consumidor
* Comportamiento sin deadlocks

---

# 🌍 **Relación con el dominio real**

Este sistema simula exactamente la cadena real del proyecto:

**Vehículos reales → Cámara → OCR → Clasificación → Decisión de acceso**

Concurrencia natural:

* tráfico real
* accesos simultáneos
* picos de carga
* tiempos variables
* dependencias entre etapas

Perfecto para validar:

* rendimiento
* coherencia
* integridad de los datos
* resistencia del sistema ante saturación

---

# 🚀 **Mejoras futuras**

* Añadir múltiples cámaras
* Añadir varios OCR (pool de consumidores)
* Calcular tiempos medios de procesado
* Exportar resultados a JSON/CSV
* Visualización gráfica

---

