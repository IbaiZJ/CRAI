# Notebook: Detector de Coches — Estilo PyImageSearch (Colab)

Este notebook está diseñado siguiendo la metodología de *PyImageSearch* (pipeline modular, reproducible y explicativo) y genera un detector de coches (bounding boxes) en **tiempo real** usando **Keras + TensorFlow** en Google Colab. El modelo base será **YOLOv8 (KerasCV)** por su sencillez para fine-tuning y rapidez en entornos Colab; sin embargo, la metodología (recolección, anotación, TFRecords, entrenamiento, evaluación, inferencia y despliegue) sigue la filosofía de PyImageSearch.

> **Estructura del notebook**
>
> 1. Preparación del entorno (GPU, dependencias)
> 2. Estructura de proyecto y configuración
> 3. Descarga y preparación del dataset (COCO filtrado a `car`) + ejemplo con VOC
> 4. Conversión / serialización (opcional TFRecords)
> 5. Definición del modelo (transfer learning con YOLOv8 small)
> 6. Entrenamiento (callbacks, augmentaciones, checkpoints)
> 7. Evaluación y métricas (mAP simplificado)
> 8. Inferencia en imágenes
> 9. Modo tiempo real (webcam) para Colab y nota sobre ejecución local
> 10. Exportar modelo y recomendaciones para producción

---

## 0. Notas previas
- Ejecuta este notebook en Google Colab con **GPU** (Entorno de ejecución → Cambiar tipo de entorno → GPU).
- El notebook usa `keras-cv` para facilitar el pipeline y `opencv` para la inferencia y webcam.
- Si prefieres otro backbone (SSD/MobileNet) o usar la Object Detection API, puedo adaptar el notebook.

---

## 1) Preparar entorno
```python
# Instalar dependencias
!pip install -q -U keras-cv tensorflow opencv-python-headless matplotlib tqdm
# Opcional: si usas Google Drive para guardar checkpoints
from google.colab import drive
# drive.mount('/content/drive')
```

---

## 2) Estructura del proyecto y configuración (estilo PyImageSearch)
```python
# Crear estructura de carpetas (si trabajas en Colab)
import os
BASE_DIR = '/content/car_detector'
os.makedirs(BASE_DIR, exist_ok=True)
for d in ['config','dataset/images','dataset/annotations','scripts','output/models','output/plots','output/inference']:
    os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)

# Archivo de configuración (ejemplo simple)
CONFIG = {
    'IMG_SIZE': (640, 640),
    'BATCH_SIZE': 8,
    'EPOCHS': 25,
    'MODEL_BACKBONE': 'yolov8_s',
    'CLASS_NAMES': ['car'],
    'CHECKPOINT_DIR': os.path.join(BASE_DIR, 'output/models')
}
```

---

## 3) Descargar y preparar dataset
**Opción A — COCO (filtrado a la clase `car`) usando `keras_cv.datasets.COCODataset`**

```python
import keras_cv
from tensorflow import keras

# NOTA: Esto usa el loader de keras_cv. En Colab puede tardar en descargar/extraer.
train_ds = keras_cv.datasets.COCODataset(
    bounding_box_format="xywh",
    split="train",
    include_mask=False,
    classes=["car"]
)

val_ds = keras_cv.datasets.COCODataset(
    bounding_box_format="xywh",
    split="validation",
    include_mask=False,
    classes=["car"]
)

# Visualizar un ejemplo
sample = next(iter(train_ds))
print('Keys:', sample.keys())
print('Image shape:', sample['images'].shape)
print('Boxes:', sample['bounding_boxes'].shape)
```

**Opción B — Pascal VOC**
- Descargar VOC 2007/2012 manualmente y filtrar archivos XML por la etiqueta `car`.
- Anotar en Pascal VOC (XML) usando LabelImg si haces dataset propio.

---

## 4) (Opcional) Serializar dataset a TFRecords — método PyImageSearch
PyImageSearch recomienda crear TFRecords para entrenamiento robusto. A continuación tienes una función de ejemplo para convertir una imagen + anotación (formato COCO simplificado) a `tf.train.Example`.

```python
import tensorflow as tf
import numpy as np

def to_tfrecord_example(image, boxes_xywh, class_ids):
    # image: uint8 array HxWx3
    # boxes_xywh: Nx4 (x,y,w,h) absolute pixel coords
    h, w = image.shape[:2]
    encoded_jpg = tf.io.encode_jpeg(image).numpy()

    xmins = (boxes_xywh[:,0] / w).tolist()
    ymins = (boxes_xywh[:,1] / h).tolist()
    xmaxs = ((boxes_xywh[:,0] + boxes_xywh[:,2]) / w).tolist()
    ymaxs = ((boxes_xywh[:,1] + boxes_xywh[:,3]) / h).tolist()

    feature = {
        'image/encoded': tf.train.Feature(bytes_list=tf.train.BytesList(value=[encoded_jpg])),
        'image/height': tf.train.Feature(int64_list=tf.train.Int64List(value=[h])),
        'image/width': tf.train.Feature(int64_list=tf.train.Int64List(value=[w])),
        'image/object/bbox/xmin': tf.train.Feature(float_list=tf.train.FloatList(value=xmins)),
        'image/object/bbox/xmax': tf.train.Feature(float_list=tf.train.FloatList(value=xmaxs)),
        'image/object/bbox/ymin': tf.train.Feature(float_list=tf.train.FloatList(value=ymins)),
        'image/object/bbox/ymax': tf.train.Feature(float_list=tf.train.FloatList(value=ymaxs)),
        'image/object/class/label': tf.train.Feature(int64_list=tf.train.Int64List(value=class_ids.tolist()))
    }
    example = tf.train.Example(features=tf.train.Features(feature=feature))
    return example
```

> Nota: si usas `keras_cv.datasets.COCODataset` directamente, no es estrictamente necesario convertir a TFRecords; `tf.data` y `model.preprocess` pueden usarse para directamente preparar `Dataset`.

---

## 5) Definir el modelo — Transfer learning con KerasCV (YOLOv8 small)
En la metodología PyImageSearch se prioriza el `transfer learning` y partir de un modelo preentrenado. Aquí usamos `keras_cv.models.YOLOV8Detector` y ajustamos `num_classes=1`.

```python
import keras_cv
from tensorflow import keras

model = keras_cv.models.YOLOV8Detector(
    num_classes=1,
    bounding_box_format="xywh",
    backbone="yolov8_s"
)

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-4),
    # KerasCV ya maneja losses internas, pero si quieres personalizar puedes añadir callbacks
)

model.summary()
```

---

## 6) Preparar datasets para entrenamiento (augmentations y preprocess)
PyImageSearch hace énfasis en augmentaciones. `model.preprocess` de KerasCV hace parte del trabajo; para más control puedes usar `tf.image` o `imgaug`.

```python
AUTOTUNE = tf.data.AUTOTUNE

def prepare_dataset(ds, batch_size, shuffle=False):
    # ds es el generador de keras_cv.datasets.COCODataset
    ds = ds.map(lambda x: {'images': x['images'], 'bounding_boxes': x['bounding_boxes']})
    if shuffle:
        ds = ds.shuffle(1024)
    ds = ds.batch(batch_size)
    # aplicar preprocess de modelo
    ds = ds.map(lambda batch: model.preprocess(batch, training=True), num_parallel_calls=AUTOTUNE)
    ds = ds.prefetch(AUTOTUNE)
    return ds

train_dataset = prepare_dataset(train_ds, CONFIG['BATCH_SIZE'], shuffle=True)
val_dataset = prepare_dataset(val_ds, CONFIG['BATCH_SIZE'], shuffle=False)
```

---

## 7) Entrenamiento (callbacks, checkpoints, logging)
```python
checkpoint_path = os.path.join(CONFIG['CHECKPOINT_DIR'], 'yolov8_car')
callbacks = [
    keras.callbacks.ModelCheckpoint(checkpoint_path, save_best_only=True, save_weights_only=False),
    keras.callbacks.ReduceLROnPlateau(patience=3, factor=0.5, verbose=1),
    keras.callbacks.EarlyStopping(patience=6, restore_best_weights=True)
]

history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=CONFIG['EPOCHS'],
    callbacks=callbacks
)
```

> PyImageSearch recomienda monitorizar curvas de loss y precision/recall; guarda `history` y plotea.

```python
import matplotlib.pyplot as plt
plt.plot(history.history['loss'], label='train_loss')
plt.plot(history.history['val_loss'], label='val_loss')
plt.legend()
plt.title('Loss durante entrenamiento')
plt.show()
```

---

## 8) Evaluación y métricas
KerasCV ofrece utilidades para evaluar; si quieres mAP completo usa la evaluación COCO. Aquí mostramos una evaluación básica por IoU + NMS.

```python
# Inferir en un batch de validación y mostrar resultados sencillos
import numpy as np
batch = next(iter(val_dataset))
images = batch['images']
preds = model.predict(images)

# preds contiene bounding boxes y scores; visualiza con keras_cv.visualization
from keras_cv import visualization
visualization.plot_bounding_box_gallery(images, y_pred=preds, class_mapping={0: 'car'})
```

---

## 9) Inferencia en imágenes y en tiempo real (webcam)
### Inferencia en una imagen
```python
import cv2
from PIL import Image

img = cv2.imread('/content/sample.jpg')  # reemplaza por tu imagen
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
res = model.predict(img_rgb[None, ...])
visualization.plot_bounding_box_gallery(img_rgb[None, ...], y_pred=res, class_mapping={0:'car'})
```

### Webcam en Colab (nota: Colab no soporta un stream continuo nativo; se usa un método de tomar snapshots continuamente):
```python
# Utilidad para tomar foto desde la webcam de Colab (pseudostream)
from google.colab.output import eval_js
from base64 import b64decode
from io import BytesIO
from PIL import Image
import IPython.display as display

JS = """
async function capture() {
  const div = document.createElement('div');
  const video = document.createElement('video');
  const stream = await navigator.mediaDevices.getUserMedia({video: true});
  document.body.appendChild(div);
  div.appendChild(video);
  video.srcObject = stream;
  await video.play();
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  stream.getVideoTracks()[0].stop();
  const data = canvas.toDataURL('image/jpeg');
  div.remove();
  return data;
}
capture();
"""

def take_photo():
    data = eval_js(JS)
    data = data.split(',')[1]
    image = Image.open(BytesIO(b64decode(data)))
    return image

# Bucle simple para tomar N snapshots y procesarlas
for i in range(30):
    img = take_photo()
    frame = np.array(img.convert('RGB'))
    preds = model.predict(frame[None,...])
    visualization.plot_bounding_box_gallery(frame[None,...], y_pred=preds, class_mapping={0:'car'})
```

**Ejecución local (recomendada para streaming real):** si ejecutas el script localmente (tu PC), usa `cv2.VideoCapture(0)` y procesa cada frame en un bucle — esto ofrece un streaming continuo y FPS más altos.

---

## 10) Exportar y poner en producción
```python
# Guardar modelo Keras
model.save('/content/car_detector_yolov8.keras')
```

**Recomendaciones PyImageSearch-style:**
- Convertir el modelo a TensorFlow SavedModel y optimizar con TensorRT o TFLite (si vas a CPU/Edge).
- Servir con TensorFlow Serving o FastAPI para inferencia en servidor.
- Hacer pruebas con videos y escenarios reales para ajustar augmentations y mejorar recall/precision.

---

## Apéndice: scripts útiles (plantillas)
- `scripts/prepare_dataset.py` — convertir VOC/COCO a TFRecords
- `scripts/train.py` — entrenamiento reproducible (argument parser, logging)
- `scripts/detect.py` — inferencia en imágenes
- `scripts/detect_realtime.py` — inferencia webcam local

---

# Fin del Notebook

*Este notebook está pensado como plantilla completa: combina la metodología y estructura de PyImageSearch con herramientas modernas (KerasCV) para que puedas entrenar y desplegar un detector de coches en Colab.*

Si quieres, adapto este documento y lo convierto en un archivo `.ipynb` listo para descargar y ejecutar en Colab, o lo traduzco en celdas separadas listas para ejecutar paso a paso.

