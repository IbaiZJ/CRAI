# Sistema de Detección de Vehículos en Tiempo Real con YOLOv8n

Sistema universitario para detectar vehículos en tiempo real usando YOLOv8 nano, optimizado para máximo rendimiento.

## 🚀 Características

- **Modelo ultra-rápido**: YOLOv8n (nano) para inferencia en tiempo real
- **Detección especializada**: Solo detecta vehículos (coches, motos, buses, camiones)
- **Arquitectura modular**: Integrado con clases VideoStream existentes
- **Optimizado para CPU/GPU**: Soporte automático para CUDA con FP16
- **Métricas en tiempo real**: Contador de FPS integrado

## 📋 Requisitos

```bash
pip install -r requirements.txt
```

### Dependencias principales:
- `ultralytics>=8.0.0` - YOLOv8
- `opencv-python` - Procesamiento de video
- `torch>=2.0.0` - Backend de PyTorch
- `torchvision>=0.15.0` - Utilidades de visión

## 🎯 Uso

### 1. Detección en tiempo real (cámara web)

```bash
cd src
python main.py
```

**Opciones disponibles:**

```bash
python main.py --source 0                    # Cámara por defecto
python main.py --source 1                    # Segunda cámara
python main.py --confidence 0.6              # Ajustar umbral de confianza
python main.py --resolution 1280x720         # Cambiar resolución
python main.py --model yolov8s.pt           # Usar modelo más grande
python main.py --no-display                  # Sin ventana (útil para testing)
```

### 2. Procesar video de archivo

```bash
cd src
python process_video.py --video ruta/al/video.mp4
```

**Guardar video procesado:**

```bash
python process_video.py --video input.mp4 --output output.mp4
```

### 3. Uso en tu propio código

```python
from video.video_stream import VideoStream
from vehicle_detector import VehicleDetector
import cv2

# Inicializar detector (carga el modelo una sola vez)
detector = VehicleDetector(
    model_path='yolov8n.pt',
    confidence_threshold=0.5
)

# Inicializar stream de video
vs = VideoStream(src=0).start()

# Loop de procesamiento
while True:
    # Obtener frame de tu arquitectura de video
    frame = vs.read()
    
    # Procesar con YOLO (retorna frame con bounding boxes)
    processed_frame = detector.process_frame(frame)
    
    # Mostrar resultado
    cv2.imshow("Detección", processed_frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

vs.stop()
cv2.destroyAllWindows()
```

### 4. Obtener detecciones sin dibujar

Si necesitas las coordenadas y datos crudos:

```python
# Obtener lista de detecciones
detections = detector.get_detections(frame)

# Cada detección es un diccionario:
# {
#   'bbox': [x1, y1, x2, y2],
#   'confidence': 0.85,
#   'class': 'car',
#   'class_id': 2
# }

for det in detections:
    print(f"Detectado {det['class']} con confianza {det['confidence']:.2f}")
    x1, y1, x2, y2 = det['bbox']
    # Tu lógica personalizada aquí
```

## 🎨 Clases de Vehículos Detectadas

El sistema detecta únicamente las siguientes clases del dataset COCO:

| ID | Clase | Color |
|----|-------|-------|
| 2  | car (coche) | 🟢 Verde |
| 3  | motorcycle (moto) | 🔵 Azul |
| 5  | bus (bus) | 🟠 Naranja |
| 7  | truck (camión) | 🔴 Rojo |

## ⚙️ Arquitectura del Sistema

```
src/
├── main.py                  # Script principal para tiempo real
├── process_video.py         # Procesar videos de archivo
├── vehicle_detector.py      # Clase VehicleDetector (YOLO)
└── video/
    ├── video_stream.py      # Wrapper de streams de video
    ├── webcam_video_stream.py
    ├── pi_video_stream.py
    └── fps.py               # Contador de FPS
```

### Flujo de datos:

```
VideoStream → Frame → VehicleDetector.process_frame() → Frame Anotado
```

## 🔧 Configuración Avanzada

### Ajustar rendimiento

```python
detector = VehicleDetector(
    model_path='yolov8n.pt',        # yolov8n.pt = más rápido
                                     # yolov8s.pt = más preciso
    confidence_threshold=0.5,        # 0.3-0.7 recomendado
    use_half_precision=True,         # FP16 en GPU (2x más rápido)
    device='cuda'                    # 'cuda', 'cpu', o None (auto)
)
```

### Modelos disponibles (de más rápido a más preciso):

- `yolov8n.pt` - Nano (⚡ **RECOMENDADO para tu presentación**)
- `yolov8s.pt` - Small
- `yolov8m.pt` - Medium
- `yolov8l.pt` - Large
- `yolov8x.pt` - Extra Large

## 📊 Rendimiento Esperado

En un sistema típico:

| Hardware | Modelo | FPS Esperado |
|----------|--------|--------------|
| CPU i5/i7 | YOLOv8n | 15-25 FPS |
| GPU GTX 1050 | YOLOv8n | 60-80 FPS |
| GPU RTX 3060 | YOLOv8n | 100+ FPS |

## 🐛 Troubleshooting

### Error: "No se detecta GPU"
```bash
# Verificar instalación de CUDA
python -c "import torch; print(torch.cuda.is_available())"

# Si retorna False, reinstalar PyTorch con CUDA:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Error: "Modelo no encontrado"
```bash
# El modelo se descarga automáticamente la primera vez
# Si hay problemas, descargarlo manualmente:
wget https://github.com/ultralytics/assets/releases/download/v8.1.0/yolov8n.pt
```

### Baja tasa de FPS
- Reducir resolución: `--resolution 640x480`
- Usar GPU si está disponible
- Aumentar umbral de confianza: `--confidence 0.7`
- Verificar que use half precision (FP16) en GPU

## 📝 Notas Importantes

1. **Primera ejecución**: El modelo YOLOv8n se descarga automáticamente (~6MB)
2. **GPU recomendada**: Para mejor rendimiento, usa una GPU con CUDA
3. **Webcam**: Asegúrate de tener permisos de acceso a la cámara
4. **Presiona 'q'**: Para salir de forma segura y ver estadísticas

## 🎓 Para tu Presentación

### Configuración recomendada:

```bash
python main.py --source 0 --confidence 0.6 --resolution 1280x720
```

### Tips para la demo:
- Probar el sistema ANTES de la presentación
- Tener un video de respaldo por si falla la webcam
- Mostrar las estadísticas de FPS al final
- Explicar que solo detecta vehículos (no personas ni otros objetos)

## 📚 Recursos Adicionales

- [Documentación de YOLOv8](https://docs.ultralytics.com/)
- [Dataset COCO Classes](https://tech.amikelive.com/node-718/what-object-categories-labels-are-in-coco-dataset/)
- [Optimización de YOLO](https://docs.ultralytics.com/modes/predict/#inference-arguments)

## ✨ Ventajas sobre tu Modelo de Keras

- ✅ **5-10x más rápido** que modelos custom en Keras
- ✅ **Pre-entrenado en millones de imágenes** (COCO dataset)
- ✅ **No requiere entrenamiento** - funciona de inmediato
- ✅ **Optimizado profesionalmente** por Ultralytics
- ✅ **Soporta GPU automáticamente** con aceleración FP16
- ✅ **Robusto** - funciona en diferentes condiciones de luz/ángulos

---

**¡Buena suerte con tu presentación universitaria! 🎉**
