# Roadmap PyImageSearch Adaptado a Proyecto de Detección de Coches y Matrículas

## 2. Tu objetivo final desglosado

Quieres:

### A. Detectar coches en imagen/video
Necesitas detector de objetos (YOLO, SSD, Faster R-CNN).

### B. Detectar matrículas
Necesitas otro detector entrenado en matrículas o un dataset tipo ANPR.

### C. Leer el texto de la matrícula
Necesitas OCR robusto (Tesseract, EasyOCR, CRNN, TrOCR, etc.)

### D. Todo funcionando en tiempo real
Optimización de modelos, OpenCV, threading, GPU (Colab), potencial deployment.

---

## 3. Roadmap PyImageSearch adaptado a tu proyecto

A continuación se construye un roadmap siguiendo EXACTAMENTE la metodología de PyImageSearch, pero orientado a tu caso.

### Fase 1 — Fundamentos de Computer Vision (PyImageSearch nivel 1)

**Objetivo:** poder manipular imágenes, detectar contornos, dibujar bounding boxes y manejar video streams.

Debes dominar:

- OpenCV
- Lectura y escritura de imágenes
- Conversión BGR → RGB
- Umbralización
- Detección de bordes
- Operaciones morfológicas (erosión, dilatación)
- Manejo de video
  - Captura desde webcam
  - Lectura de frames
  - FPS y optimización
- Dibujar boxes, texto e overlays

**Relevancia para tu proyecto:**  
Te permitirá manipular los frames para luego meterlos al modelo y postprocesar detecciones.

---

### Fase 2 — Fundamentos de Deep Learning (PyImageSearch nivel 2)

**Objetivo:** entender redes neuronales y Keras.

Conocer:

- Qué es una CNN
- Capas: Conv, ReLU, MaxPool, Dense
- Arquitecturas clásicas (LeNet, AlexNet, VGG)
- Entrenamiento, validación, test
- Overfitting y regularización
- Data augmentation
- Transfer learning

**Relevancia:**  
Necesario para afinar tu detector de matrículas, donde probablemente tendrás que entrenar un modelo custom.

---

### Fase 3 — Detección de Objetos (PyImageSearch nivel 3)

Esta es la parte CRÍTICA para tu objetivo.

PyImageSearch propone estos enfoques:

1. **Algoritmos clásicos (no DL)**  
   - Haar cascades  
   - HOG+SVM  
   *No recomendados para matrículas: precisión baja.*

2. **Algoritmos deep learning modernos**  
   - YOLOv3/v4/v5/v7/v8  
   - SSD  
   - Faster R-CNN  

**Recomendación para tu caso:**  
- Detector de coches → YOLO preentrenado (COCO).  
- Detector de matrículas → Necesitas dataset ANPR y fine-tuning.

---

### Fase 4 — Entrenamiento de tu propio detector

PyImageSearch enseña a:

- Construir datasets
- Etiquetar imágenes (LabelImg)
- Generar TFRecords si usas TensorFlow Object Detection
- Entrenar un modelo con Keras/TensorFlow o YOLO

**Para tu proyecto:**

- **Detector 1: Coches**  
  - Usar YOLOv8 preentrenado en COCO → detecta "car".

- **Detector 2: Matrículas**  
  - Necesitas dataset de matrículas:  
    - OpenALPR Benchmark dataset  
    - AOLP  
    - Synthetic license plates  
    - Datasets públicos en Kaggle  
  - Entrenamiento con YOLO o Keras (YOLO recomendado para ANPR).

---

### Fase 5 — OCR para leer la matrícula (PyImageSearch nivel 4)

PyImageSearch cubre OCR clásico y OCR con DL.

Opciones recomendadas:

- Tesseract
- EasyOCR
- CRNN
- TrOCR (Transformer OCR)

**Recomendación:**  
Empezar con EasyOCR (rápido, sencillo y robusto), luego migrar a CRNN si se requiere mayor precisión.

---

### Fase 6 — Ensamblado del pipeline completo

Pipeline completo:

1. Captura de frame desde webcam
2. Detector de coches
3. Recorte de coches detectados
4. Detector de matrículas en recorte
5. Recorte de matrícula
6. OCR sobre matrícula
7. Mostrar resultados en pantalla
8. Exportar datos (logging) si es necesario

---

### Fase 7 — Optimización y tiempo real

PyImageSearch dedica secciones a:

- Threading en Python
- Multiprocessing
- Reutilización de GPU
- ONNX runtime
- TFLite para edge devices

**Para tiempo real en Colab o PC:**

- Usar YOLOv8n o YOLOv8s
- Reducir resolución de entrada
- Usar modelos cuantizados si hace falta
- Threading para lectura de webcam y procesamiento en paralelo

---

### Fase 8 — Deployment (opcional)

PyImageSearch cubre deployment en:

- Raspberry Pi
- NVIDIA Jetson
- Flask APIs
- Streamlit web apps
