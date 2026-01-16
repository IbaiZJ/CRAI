# 📊 Dataset UA-DETRAC-10K-2 - Configuración

## ✅ Estado: ACTIVO Y VERIFICADO

### 📁 Estructura del Dataset

```
UA-DETRAC-DATASET-10K-2/
├── train/
│   ├── images/        (9,316 archivos JPG)
│   └── labels/        (9,316 archivos TXT - Formato YOLO)
├── valid/
│   ├── images/        (500 archivos JPG)
│   └── labels/        (500 archivos TXT - Formato YOLO)
├── data.yaml          (Metadatos del dataset)
├── README.dataset.txt
└── README.roboflow.txt
```

### 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| Total de imágenes | 9,816 |
| Imágenes de entrenamiento | 9,316 (94.9%) |
| Imágenes de validación | 500 (5.1%) |
| Número de clases | 4 |
| Clases | bus, car, truck, van |
| Formato | YOLO (.txt con coordenadas normalizadas) |

### ⚙️ Configuración del Notebook

```python
# Rutas
DATASET_DIR = "./UA-DETRAC-DATASET-10K-2"
TRAIN_IMAGES_DIR = "./UA-DETRAC-DATASET-10K-2/train/images"
TRAIN_LABELS_DIR = "./UA-DETRAC-DATASET-10K-2/train/labels"
VAL_IMAGES_DIR = "./UA-DETRAC-DATASET-10K-2/valid/images"
VAL_LABELS_DIR = "./UA-DETRAC-DATASET-10K-2/valid/labels"

# Parámetros del modelo
IMG_SIZE_OBJECTIVE = (640, 640)
BATCH_SIZE = 12
EPOCHS = 40
NUM_CLASSES = 4
```

### 🎯 Próximos Pasos

1. Abre el notebook `crai.ipynb`
2. Ejecuta las celdas en orden desde el inicio
3. El dataset se cargará automáticamente
4. Comienza el entrenamiento del modelo SSD con MobileNetV2

### ✨ Verificación del Dataset

Ejecuta `python3 verify_dataset.py` desde la carpeta `notebooks/` para verificar la estructura:

```bash
cd ai/notebooks/
python3 verify_dataset.py
```

---

**Última actualización**: 15 Enero 2026  
**Estado**: ✅ Activo y funcional
