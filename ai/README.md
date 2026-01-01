# 🚗 CRAI - Sistema de Detección de Vehículos en Tiempo Real

Sistema universitario de detección de vehículos usando YOLOv8n (nano) para máximo rendimiento en tiempo real.

## 🎯 Características Principales

- ✅ **Detección ultra-rápida** con YOLOv8n (15-100+ FPS según hardware)
- ✅ **Solo vehículos**: Coches, motos, buses y camiones (filtra el resto)
- ✅ **GPU/CPU optimizado**: Soporte automático para CUDA con FP16
- ✅ **Arquitectura modular**: Integrado con sistema de VideoStream robusto
- ✅ **Listo para usar**: Sin entrenamiento necesario, funciona inmediatamente

## 🚀 Instalación Rápida

### Linux/Mac:
```bash
chmod +x install.sh
./install.sh
```

### Windows:
```bash
install.bat
```

### Manual:
```bash
pip install -r requirements.txt
```

## 💻 Uso Rápido

### 1. Detección en tiempo real (webcam)
```bash
cd src
python main.py
```

### 2. Procesar un video
```bash
cd src
python process_video.py --video video.mp4 --output resultado.mp4
```

### 3. Probar el sistema
```bash
python test_system.py
```

### 4. Ver ejemplos avanzados
```bash
python ejemplos_avanzados.py
```

## 📖 Documentación Completa

Consulta [YOLO_GUIDE.md](YOLO_GUIDE.md) para:
- Guía completa de uso
- Opciones avanzadas de configuración
- Ejemplos de código
- Solución de problemas
- Tips para tu presentación

## 🏗️ Estructura del Proyecto

```
ai/
├── src/
│   ├── main.py                    # Script principal (tiempo real)
│   ├── process_video.py           # Procesar videos de archivo
│   ├── vehicle_detector.py        # Clase VehicleDetector (YOLO)
│   └── video/                     # Módulo de gestión de video
│       ├── video_stream.py        # Wrapper principal
│       ├── webcam_video_stream.py # Stream de webcam
│       ├── pi_video_stream.py     # Stream de Raspberry Pi
│       └── fps.py                 # Contador de FPS
├── tests/                         # Tests unitarios
├── notebooks/                     # Jupyter notebooks
├── ejemplos_avanzados.py         # Ejemplos de uso avanzado
├── test_system.py                # Script de verificación
├── requirements.txt              # Dependencias
├── YOLO_GUIDE.md                # Guía completa
└── README.md                    # Este archivo
```

## 🎓 Para tu Presentación Universitaria

### Configuración recomendada:
```bash
python main.py --source 0 --confidence 0.6 --resolution 1280x720
```

### Ventajas sobre modelos custom:
- ⚡ **5-10x más rápido** que entrenar desde cero
- 🎯 **Mayor precisión** (entrenado en millones de imágenes)
- 🚀 **Listo para producción** sin ajustes
- 💪 **Robusto** en diferentes condiciones

## 📊 Rendimiento Esperado

| Hardware | FPS con YOLOv8n |
|----------|-----------------|
| CPU Intel i5/i7 | 15-25 FPS |
| GPU GTX 1050 | 60-80 FPS |
| GPU RTX 3060+ | 100+ FPS |

## 🔧 Opciones Principales

```bash
python main.py --help
```

- `--source 0` - Cámara a usar (0, 1, 2...)
- `--confidence 0.5` - Umbral de confianza (0.0-1.0)
- `--resolution 640x480` - Resolución del video
- `--model yolov8n.pt` - Modelo YOLO a usar
- `--no-display` - No mostrar ventana (headless)

## 🐛 Solución de Problemas

### GPU no detectada
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### Problemas de instalación
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Cámara no funciona
- Verifica permisos de acceso
- Cierra otras aplicaciones usando la cámara
- Prueba con `--source 1` o `--source 2`

## 📚 Recursos y Referencias

### Proyecto Original

- https://www.youtube.com/watch?v=402DciWGvt8

## 📚 Recursos y Referencias

### Proyecto Original
- https://www.youtube.com/watch?v=402DciWGvt8

### Referencias de Documentación
- [Documentación YOLOv8](https://docs.ultralytics.com/)
- [Dataset COCO](https://cocodataset.org/)
- [PyImageSearch](https://pyimagesearch.com/start-here/)

### Datasets y Recursos Adicionales
- [OCR con OpenCV](https://pyimagesearch.com/category/optical-character-recognition-ocr/)
- [Detección de matrículas](https://pyimagesearch.com/2020/09/21/opencv-automatic-license-number-plate-recognition-anpr-with-python/)
- [Tracking de vehículos](https://pyimagesearch.com/2019/12/02/opencv-vehicle-detection-tracking-and-speed-estimation/)
- [TFG Referencia](https://github.com/JaviFS97/TFG)
- [Stanford Cars Dataset](https://www.kaggle.com/datasets/eduardo4jesus/stanford-cars-dataset)
- [UA-DETRAC Dataset](https://www.kaggle.com/datasets/dtrnngc/ua-detrac-dataset)
- [Vehicle-10 Dataset](https://github.com/yjzhai-cs/Vehicle-10)

## 👥 Desarrollo

Este proyecto fue desarrollado como sistema de detección de vehículos para presentación universitaria, utilizando las mejores prácticas de:
- Visión por computador
- Procesamiento en tiempo real
- Arquitectura de software modular

## 📝 Licencia

Proyecto universitario - CRAI

---

**¿Problemas? Ejecuta:** `python test_system.py` para diagnóstico completo
