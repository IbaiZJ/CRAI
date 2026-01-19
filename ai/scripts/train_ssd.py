#!/usr/bin/env python3
"""
🚀 SCRIPT DE ENTRENAMIENTO SSD - VERSIÓN CORREGIDA
===================================================

Este script entrena el modelo SSD con la configuración CORRECTA:
- 1 clase (vehículo genérico)
- Mínimo 100 epochs
- Scales y aspect ratios optimizados para UA-DETRAC
- Guardado compatible con ssd_detector.py

Uso:
    cd ai
    python scripts/train_ssd.py

    # O con parámetros personalizados:
    python scripts/train_ssd.py --epochs 150 --batch-size 8
"""

import os
import sys
import argparse
import numpy as np
from glob import glob
from tqdm import tqdm
import cv2
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Compatibilidad con futuras versiones de NumPy
if not hasattr(np, "object"):
    np.object = np.object_

# Configurar TensorFlow antes de importar
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Conv2D, Reshape, Concatenate, Input, Activation
from tensorflow.keras.models import Model

# =============================================================================
# CONFIGURACIÓN CRÍTICA - NO CAMBIAR SIN RAZÓN
# =============================================================================

# Tamaño de imagen (DEBE coincidir con ssd_detector.py)
IMG_HEIGHT = 640
IMG_WIDTH = 640
IMG_SIZE = (IMG_HEIGHT, IMG_WIDTH)

# Clases: 1 = vehículo genérico (agrupa bus, car, truck, van)
NUM_CLASSES = 1
NUM_ANCHORS = 4

# Anchors optimizados para UA-DETRAC
FEATURE_MAP_SIZES = [
    (80, 80),   # stride 8
    (40, 40),   # stride 16
    (20, 20)    # stride 32
]

SCALES = [
    (0.03, 0.12),   # Small
    (0.10, 0.28),   # Medium
    (0.22, 0.50)    # Large
]

ASPECT_RATIOS = [1.0, 1.5, 2.0, 3.0]

# Capas de features
FEATURE_LAYER_NAMES = [
    'block_6_expand_relu',
    'block_13_expand_relu',
    'out_relu'
]

# =============================================================================
# FUNCIONES DE DATASET
# =============================================================================

def load_image(image_path: str) -> tf.Tensor:
    """Carga y preprocesa una imagen"""
    image = tf.io.read_file(image_path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, IMG_SIZE)
    image = tf.cast(image, tf.float32) / 255.0
    return image


def load_yolo_label(label_path: str) -> tuple:
    """Carga labels YOLO - ignora class_id, todo es 'vehicle' (clase 0)"""
    boxes = []
    
    with open(label_path, "r") as f:
        for line in f.readlines():
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            # Ignoramos class_id original, todo es clase 0 (vehicle)
            x, y, w, h = map(float, parts[1:5])
            boxes.append([x, y, w, h])
    
    boxes = np.array(boxes, dtype=np.float32).reshape(-1, 4)
    # Todas las clases son 0 (vehicle)
    classes = np.zeros(len(boxes), dtype=np.int32)
    
    return boxes, classes


def load_sample(image_path: str, label_path: str):
    """Carga un par imagen-label"""
    image = load_image(image_path)
    boxes, classes = load_yolo_label(label_path)
    
    boxes = tf.convert_to_tensor(boxes, dtype=tf.float32)
    classes = tf.convert_to_tensor(classes, dtype=tf.int32)
    
    return image, {"boxes": boxes, "classes": classes}


def augment_image_and_boxes(image, boxes):
    """
    Data augmentation SIN transformaciones espaciales (no altera coordenadas de boxes):
    - Brillo aleatorio
    - Contraste aleatorio
    - Saturación aleatorio
    - Blur gaussiano
    """
    image = tf.cast(image, tf.float32)
    
    # 1. Brillo aleatorio (±30%)
    if tf.random.uniform([]) > 0.5:
        delta = tf.random.uniform([], -0.3, 0.3)
        image = tf.image.adjust_brightness(image, delta)
    
    # 2. Contraste aleatorio (0.7-1.3x)
    if tf.random.uniform([]) > 0.5:
        factor = tf.random.uniform([], 0.7, 1.3)
        image = tf.image.adjust_contrast(image, factor)
    
    # 3. Saturación aleatorio (0.7-1.3x)
    if tf.random.uniform([]) > 0.5:
        factor = tf.random.uniform([], 0.7, 1.3)
        image = tf.image.adjust_saturation(image, factor)
    
 
    
    # Clipping de imagen
    image = tf.clip_by_value(image, 0.0, 1.0)
    
    return image, boxes


def index_dataset(images_dir: str, labels_dir: str) -> list:
    """Indexa el dataset"""
    samples = []
    image_paths = sorted(glob(os.path.join(images_dir, "*.jpg")))
    
    print(f"Encontradas {len(image_paths)} imágenes en {images_dir}")
    
    for img_path in image_paths:
        filename = os.path.splitext(os.path.basename(img_path))[0]
        label_path = os.path.join(labels_dir, filename + ".txt")
        
        if os.path.exists(label_path):
            samples.append((img_path, label_path))
    
    print(f"Samples indexados: {len(samples)}")
    return samples


# =============================================================================
# GENERACIÓN DE ANCHORS
# =============================================================================

def generate_anchors_for_feature_map(feature_map_size, scale_min, scale_max):
    """Genera anchors para un feature map"""
    fh, fw = feature_map_size
    anchors = []
    scale = scale_min + (scale_max - scale_min) / 2
    
    for i in range(fh):
        for j in range(fw):
            cx = (j + 0.5) / fw
            cy = (i + 0.5) / fh
            
            for ratio in ASPECT_RATIOS:
                w = scale * np.sqrt(ratio)
                h = scale / np.sqrt(ratio)
                w = min(w, 1.0)
                h = min(h, 1.0)
                anchors.append([cx, cy, w, h])
    
    return np.array(anchors, dtype=np.float32)


def generate_all_anchors():
    """Genera todos los anchors"""
    all_anchors = []
    
    for i, fm_size in enumerate(FEATURE_MAP_SIZES):
        scale_min, scale_max = SCALES[i]
        anchors = generate_anchors_for_feature_map(fm_size, scale_min, scale_max)
        all_anchors.append(anchors)
        print(f"Feature map {i} ({fm_size[0]}x{fm_size[1]}): {len(anchors)} anchors")
    
    all_anchors = np.concatenate(all_anchors, axis=0)
    print(f"Total anchors: {len(all_anchors)}")
    
    return tf.constant(all_anchors, dtype=tf.float32)


# =============================================================================
# MODELO SSD
# =============================================================================

def create_detection_head(feature_map, num_anchors, num_classes, name_prefix):
    """Crea cabezas de detección para un feature map"""
    # Box regression: 4 valores por anchor
    box_conv = Conv2D(
        filters=num_anchors * 4,
        kernel_size=(3, 3),
        padding='same',
        kernel_initializer='he_normal',
        name=f'{name_prefix}_box_conv'
    )(feature_map)
    box_output = Reshape((-1, 4), name=f'{name_prefix}_box_reshape')(box_conv)
    
    # Classification: num_classes por anchor
    class_conv = Conv2D(
        filters=num_anchors * num_classes,
        kernel_size=(3, 3),
        padding='same',
        kernel_initializer='he_normal',
        name=f'{name_prefix}_class_conv'
    )(feature_map)
    class_conv = Activation('sigmoid', name=f'{name_prefix}_class_sigmoid')(class_conv)
    class_output = Reshape((-1, num_classes), name=f'{name_prefix}_class_reshape')(class_conv)
    
    return box_output, class_output


def build_ssd_model():
    """Construye el modelo SSD completo"""
    print("Construyendo modelo SSD MobileNetV2...")
    
    # Input
    input_tensor = Input(shape=(IMG_HEIGHT, IMG_WIDTH, 3), name="input_image")
    
    # Backbone
    backbone = MobileNetV2(
        input_tensor=input_tensor,
        include_top=False,
        weights='imagenet',
        alpha=1.0
    )
    backbone.trainable = False
    print(f"✓ Backbone MobileNetV2 cargado (congelado)")
    
    # Feature maps
    feature_maps = []
    for layer_name in FEATURE_LAYER_NAMES:
        layer = backbone.get_layer(layer_name)
        feature_maps.append(layer.output)
        print(f"  Feature map '{layer_name}': {layer.output.shape}")
    
    # Detection heads
    all_box_outputs = []
    all_class_outputs = []
    
    for i, feat_map in enumerate(feature_maps):
        box_out, class_out = create_detection_head(
            feat_map, NUM_ANCHORS, NUM_CLASSES, f'detect_{i}'
        )
        all_box_outputs.append(box_out)
        all_class_outputs.append(class_out)
    
    # Concatenate
    box_predictions = Concatenate(axis=1, name='concat_boxes')(all_box_outputs)
    class_predictions = Concatenate(axis=1, name='concat_classes')(all_class_outputs)
    
    # Model
    model = Model(
        inputs=input_tensor,
        outputs={'boxes': box_predictions, 'classes': class_predictions},
        name='SSD_MobileNetV2_VehicleDetector'
    )
    
    print(f"✓ Modelo construido: {model.count_params():,} parámetros")
    print(f"  Output boxes: {box_predictions.shape}")
    print(f"  Output classes: {class_predictions.shape}")
    
    return model, input_tensor, box_predictions, class_predictions


# =============================================================================
# LOSS FUNCTIONS
# =============================================================================

class SSDBoxLoss(tf.keras.losses.Loss):
    """Box Loss con anchor matching"""
    
    def __init__(self, anchors, name='ssd_box_loss'):
        super().__init__(name=name)
        self.anchors = tf.cast(anchors, tf.float32)
        self.num_anchors = int(anchors.shape[0])
    
    def call(self, y_true, y_pred):
        batch_size = tf.shape(y_true)[0]
        
        anchors_tiled = tf.tile(tf.expand_dims(self.anchors, 0), [batch_size, 1, 1])
        iou_matrix = self._batch_compute_iou(anchors_tiled, y_true)
        
        # Mask invalid GT boxes
        gt_valid_mask = tf.reduce_sum(tf.abs(y_true), axis=-1) > 0
        gt_valid_mask = tf.cast(tf.expand_dims(gt_valid_mask, 1), tf.float32)
        iou_matrix = iou_matrix * gt_valid_mask
        
        # Match anchors
        best_gt_idx = tf.argmax(iou_matrix, axis=2)
        max_iou = tf.reduce_max(iou_matrix, axis=2)
        positive_mask = max_iou >= 0.5
        
        # Gather matched GT
        batch_indices = tf.tile(tf.expand_dims(tf.range(batch_size), 1), [1, self.num_anchors])
        gather_indices = tf.stack([batch_indices, tf.cast(best_gt_idx, tf.int32)], axis=-1)
        matched_gt_boxes = tf.gather_nd(y_true, gather_indices)
        
        # Encode
        encoded_gt = self._encode_boxes(matched_gt_boxes, anchors_tiled)
        
        # Huber loss
        diff = y_pred - encoded_gt
        abs_diff = tf.abs(diff)
        huber = tf.where(abs_diff < 1.0, 0.5 * tf.square(diff), abs_diff - 0.5)
        loss = tf.reduce_sum(huber, axis=-1)
        
        masked_loss = loss * tf.cast(positive_mask, tf.float32)
        total_loss = tf.reduce_sum(masked_loss)
        num_pos = tf.reduce_sum(tf.cast(positive_mask, tf.float32))
        
        return total_loss / tf.maximum(num_pos, 1.0)
    
    def _batch_compute_iou(self, boxes1, boxes2):
        b1_x1 = boxes1[..., 0:1] - boxes1[..., 2:3]/2
        b1_y1 = boxes1[..., 1:2] - boxes1[..., 3:4]/2
        b1_x2 = boxes1[..., 0:1] + boxes1[..., 2:3]/2
        b1_y2 = boxes1[..., 1:2] + boxes1[..., 3:4]/2
        
        b2_x1 = boxes2[..., 0:1] - boxes2[..., 2:3]/2
        b2_y1 = boxes2[..., 1:2] - boxes2[..., 3:4]/2
        b2_x2 = boxes2[..., 0:1] + boxes2[..., 2:3]/2
        b2_y2 = boxes2[..., 1:2] + boxes2[..., 3:4]/2
        
        b2_x1_t = tf.transpose(b2_x1, [0, 2, 1])
        b2_y1_t = tf.transpose(b2_y1, [0, 2, 1])
        b2_x2_t = tf.transpose(b2_x2, [0, 2, 1])
        b2_y2_t = tf.transpose(b2_y2, [0, 2, 1])
        
        inter_x1 = tf.maximum(b1_x1, b2_x1_t)
        inter_y1 = tf.maximum(b1_y1, b2_y1_t)
        inter_x2 = tf.minimum(b1_x2, b2_x2_t)
        inter_y2 = tf.minimum(b1_y2, b2_y2_t)
        
        inter_area = tf.maximum(0.0, inter_x2 - inter_x1) * tf.maximum(0.0, inter_y2 - inter_y1)
        
        b1_area = boxes1[..., 2:3] * boxes1[..., 3:4]
        b2_area = boxes2[..., 2:3] * boxes2[..., 3:4]
        b2_area_t = tf.transpose(b2_area, [0, 2, 1])
        
        union_area = b1_area + b2_area_t - inter_area
        return inter_area / (union_area + 1e-6)
    
    def _encode_boxes(self, gt_boxes, anchors):
        gt_w = tf.maximum(gt_boxes[..., 2], 1e-6)
        gt_h = tf.maximum(gt_boxes[..., 3], 1e-6)
        anchor_w = tf.maximum(anchors[..., 2], 1e-6)
        anchor_h = tf.maximum(anchors[..., 3], 1e-6)
        
        tx = (gt_boxes[..., 0] - anchors[..., 0]) / anchor_w
        ty = (gt_boxes[..., 1] - anchors[..., 1]) / anchor_h
        tw = tf.math.log(gt_w / anchor_w)
        th = tf.math.log(gt_h / anchor_h)
        
        return tf.stack([tx, ty, tw, th], axis=-1)


class SSDClassLoss(tf.keras.losses.Loss):
    """Classification Loss con hard negative mining"""
    
    def __init__(self, anchors, neg_pos_ratio=3.0, name='ssd_class_loss'):
        super().__init__(name=name)
        self.anchors = tf.cast(anchors, tf.float32)
        self.neg_pos_ratio = neg_pos_ratio
        self.num_anchors = int(anchors.shape[0])
    
    def call(self, y_true, y_pred):
        batch_size = tf.shape(y_true)[0]
        
        anchors_tiled = tf.tile(tf.expand_dims(self.anchors, 0), [batch_size, 1, 1])
        iou_matrix = self._batch_compute_iou(anchors_tiled, y_true)
        
        gt_valid_mask = tf.reduce_sum(tf.abs(y_true), axis=-1) > 0
        gt_valid_mask = tf.cast(tf.expand_dims(gt_valid_mask, 1), tf.float32)
        iou_matrix = iou_matrix * gt_valid_mask
        
        max_iou = tf.reduce_max(iou_matrix, axis=2)
        positive_mask = max_iou >= 0.5
        targets = tf.cast(positive_mask, tf.float32)
        
        y_pred = tf.squeeze(y_pred, axis=-1) if len(y_pred.shape) == 3 else y_pred
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        bce_loss = -(targets * tf.math.log(y_pred) + (1 - targets) * tf.math.log(1 - y_pred))
        
        pos_loss = bce_loss * targets
        neg_loss = bce_loss * (1.0 - targets)
        
        num_pos = tf.reduce_sum(targets, axis=1)
        num_neg = tf.cast(num_pos * self.neg_pos_ratio, tf.int32)
        
        num_neg_available = tf.cast(self.num_anchors, tf.float32) - num_pos
        num_neg = tf.minimum(num_neg, tf.cast(num_neg_available, tf.int32))
        
        neg_loss_for_sort = tf.where(positive_mask, -1e9 * tf.ones_like(neg_loss), neg_loss)
        sorted_losses, _ = tf.math.top_k(neg_loss_for_sort, k=self.num_anchors)
        
        cut_off_indices = tf.maximum(num_neg - 1, 0)
        batch_indices = tf.range(batch_size)
        gather_indices = tf.stack([batch_indices, cut_off_indices], axis=1)
        
        thresholds = tf.gather_nd(sorted_losses, gather_indices)
        thresholds = tf.expand_dims(thresholds, 1)
        
        hard_neg_mask = (neg_loss >= thresholds) & (neg_loss_for_sort > -1e9) & tf.expand_dims(num_neg > 0, 1)
        hard_neg_mask = tf.cast(hard_neg_mask, tf.float32)
        
        total_loss = tf.reduce_sum(pos_loss) + tf.reduce_sum(neg_loss * hard_neg_mask)
        total_samples = tf.reduce_sum(targets) + tf.reduce_sum(hard_neg_mask)
        
        return total_loss / tf.maximum(total_samples, 1.0)
    
    def _batch_compute_iou(self, boxes1, boxes2):
        # Same as SSDBoxLoss
        b1_x1 = boxes1[..., 0:1] - boxes1[..., 2:3]/2
        b1_y1 = boxes1[..., 1:2] - boxes1[..., 3:4]/2
        b1_x2 = boxes1[..., 0:1] + boxes1[..., 2:3]/2
        b1_y2 = boxes1[..., 1:2] + boxes1[..., 3:4]/2
        
        b2_x1 = boxes2[..., 0:1] - boxes2[..., 2:3]/2
        b2_y1 = boxes2[..., 1:2] - boxes2[..., 3:4]/2
        b2_x2 = boxes2[..., 0:1] + boxes2[..., 2:3]/2
        b2_y2 = boxes2[..., 1:2] + boxes2[..., 3:4]/2
        
        b2_x1_t = tf.transpose(b2_x1, [0, 2, 1])
        b2_y1_t = tf.transpose(b2_y1, [0, 2, 1])
        b2_x2_t = tf.transpose(b2_x2, [0, 2, 1])
        b2_y2_t = tf.transpose(b2_y2, [0, 2, 1])
        
        inter_x1 = tf.maximum(b1_x1, b2_x1_t)
        inter_y1 = tf.maximum(b1_y1, b2_y1_t)
        inter_x2 = tf.minimum(b1_x2, b2_x2_t)
        inter_y2 = tf.minimum(b1_y2, b2_y2_t)
        
        inter_area = tf.maximum(0.0, inter_x2 - inter_x1) * tf.maximum(0.0, inter_y2 - inter_y1)
        b1_area = boxes1[..., 2:3] * boxes1[..., 3:4]
        b2_area = boxes2[..., 2:3] * boxes2[..., 3:4]
        b2_area_t = tf.transpose(b2_area, [0, 2, 1])
        
        union_area = b1_area + b2_area_t - inter_area
        return inter_area / (union_area + 1e-6)


# =============================================================================
# CUSTOM MODEL WRAPPER
# =============================================================================

class SSDModel(tf.keras.Model):
    """Wrapper para training con custom losses"""
    
    def __init__(self, base_model, box_loss_fn, class_loss_fn, **kwargs):
        super().__init__(**kwargs)
        self.base_model = base_model
        self.box_loss_fn = box_loss_fn
        self.class_loss_fn = class_loss_fn
        
        self.box_loss_tracker = tf.keras.metrics.Mean(name="box_loss")
        self.class_loss_tracker = tf.keras.metrics.Mean(name="class_loss")
        self.total_loss_tracker = tf.keras.metrics.Mean(name="loss")
    
    def call(self, inputs, training=False):
        return self.base_model(inputs, training=training)
    
    @property
    def metrics(self):
        return [self.total_loss_tracker, self.box_loss_tracker, self.class_loss_tracker]
    
    def train_step(self, data):
        images, targets = data
        gt_boxes = targets["boxes"]
        
        with tf.GradientTape() as tape:
            predictions = self.base_model(images, training=True)
            pred_boxes = predictions['boxes']
            pred_classes = predictions['classes']
            
            box_loss = self.box_loss_fn(gt_boxes, pred_boxes)
            class_loss = self.class_loss_fn(gt_boxes, pred_classes)
            total_loss = box_loss + class_loss
        
        gradients = tape.gradient(total_loss, self.base_model.trainable_variables)
        self.optimizer.apply_gradients(zip(gradients, self.base_model.trainable_variables))
        
        self.total_loss_tracker.update_state(total_loss)
        self.box_loss_tracker.update_state(box_loss)
        self.class_loss_tracker.update_state(class_loss)
        
        return {
            "loss": self.total_loss_tracker.result(),
            "box_loss": self.box_loss_tracker.result(),
            "class_loss": self.class_loss_tracker.result()
        }
    
    def test_step(self, data):
        images, targets = data
        gt_boxes = targets["boxes"]
        
        predictions = self.base_model(images, training=False)
        pred_boxes = predictions['boxes']
        pred_classes = predictions['classes']
        
        box_loss = self.box_loss_fn(gt_boxes, pred_boxes)
        class_loss = self.class_loss_fn(gt_boxes, pred_classes)
        total_loss = box_loss + class_loss
        
        self.total_loss_tracker.update_state(total_loss)
        self.box_loss_tracker.update_state(box_loss)
        self.class_loss_tracker.update_state(class_loss)
        
        return {
            "loss": self.total_loss_tracker.result(),
            "box_loss": self.box_loss_tracker.result(),
            "class_loss": self.class_loss_tracker.result()
        }


# =============================================================================
# VISUALIZACIÓN DE DATA AUGMENTATION
# =============================================================================

def draw_boxes_on_image(image, boxes, color=(0, 255, 0), thickness=2):
    """Dibuja bounding boxes en una imagen"""
    img = image.copy()
    h, w = img.shape[:2]
    
    for box in boxes:
        x_center, y_center, width, height = box
        
        # Convertir de YOLO a coordenadas pixel
        x1 = int((x_center - width/2) * w)
        y1 = int((y_center - height/2) * h)
        x2 = int((x_center + width/2) * w)
        y2 = int((y_center + height/2) * h)
        
        # Clip a dimensiones de imagen
        x1 = max(0, min(x1, w-1))
        y1 = max(0, min(y1, h-1))
        x2 = max(0, min(x2, w-1))
        y2 = max(0, min(y2, h-1))
        
        cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
    
    return img




# =============================================================================
# MAIN TRAINING
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description='Entrenar modelo SSD')
    parser.add_argument('--epochs', type=int, default=100, help='Número de epochs (default: 100)')
    parser.add_argument('--batch-size', type=int, default=12, help='Batch size (default: 12)')
    parser.add_argument('--lr', type=float, default=1e-4, help='Learning rate (default: 1e-4)')
    parser.add_argument('--dataset', type=str, default='dataset/UA-DETRAC-DATASET-10K-2',
                        help='Ruta al dataset UA-DETRAC (relativa o absoluta)')
    args = parser.parse_args()
    
    print("=" * 80)
    print("🚀 ENTRENAMIENTO SSD - DETECTOR DE VEHÍCULOS")
    print("=" * 80)
    print(f"   Epochs: {args.epochs}")
    print(f"   Batch size: {args.batch_size}")
    print(f"   Learning rate: {args.lr}")
    print(f"   NUM_CLASSES: {NUM_CLASSES} (vehículo genérico)")
    print(f"   Image size: {IMG_WIDTH}x{IMG_HEIGHT}")
    print("=" * 80)
    
    # Rutas
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    
    # Si el path es absoluto, usarlo directamente; si no, tratarlo como relativo a base_dir
    if os.path.isabs(args.dataset):
        dataset_dir = args.dataset
    else:
        dataset_dir = os.path.join(base_dir, args.dataset)
    
    models_dir = os.path.join(base_dir, 'src', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    print(f"\n📂 Dataset dir: {dataset_dir}")
    
    # Detectar estructura del dataset automáticamente
    print("\n🔍 Detectando estructura del dataset...")
    
    # Estructura 1: UA_DETRAC (images/train, labels/train, images/val, labels/val)
    structure_1_train_img = os.path.join(dataset_dir, 'images', 'train')
    structure_1_train_lbl = os.path.join(dataset_dir, 'labels', 'train')
    structure_1_val_img = os.path.join(dataset_dir, 'images', 'val')
    structure_1_val_lbl = os.path.join(dataset_dir, 'labels', 'val')
    
    # Estructura 2: UA-DETRAC-DATASET-10K-2 (train/images, train/labels, valid/images, valid/labels)
    structure_2_train_img = os.path.join(dataset_dir, 'train', 'images')
    structure_2_train_lbl = os.path.join(dataset_dir, 'train', 'labels')
    structure_2_val_img = os.path.join(dataset_dir, 'valid', 'images')
    structure_2_val_lbl = os.path.join(dataset_dir, 'valid', 'labels')
    
    # Detectar cual estructura existe
    if (os.path.exists(structure_1_train_img) and os.path.exists(structure_1_train_lbl)):
        print("✓ Detectada estructura: images/train + labels/train")
        train_images_dir = structure_1_train_img
        train_labels_dir = structure_1_train_lbl
        val_images_dir = structure_1_val_img
        val_labels_dir = structure_1_val_lbl
        
    elif (os.path.exists(structure_2_train_img) and os.path.exists(structure_2_train_lbl)):
        print("✓ Detectada estructura: train/images + train/labels")
        train_images_dir = structure_2_train_img
        train_labels_dir = structure_2_train_lbl
        val_images_dir = structure_2_val_img
        val_labels_dir = structure_2_val_lbl
        
    else:
        print(f"❌ No se detectó estructura válida en: {dataset_dir}")
        print("\nEstructuras soportadas:")
        print("  1. images/train + labels/train + images/val + labels/val")
        print("  2. train/images + train/labels + valid/images + valid/labels")
        return
    
    # Verificar que existan las carpetas
    if not os.path.exists(train_images_dir):
        print(f"❌ No encontrado: {train_images_dir}")
        return
    
    print(f"\n📍 Rutas detectadas:")
    print(f"   Train images: {train_images_dir}")
    print(f"   Train labels: {train_labels_dir}")
    print(f"   Val images:   {val_images_dir}")
    print(f"   Val labels:   {val_labels_dir}")
    
    print("\n📂 Indexando dataset...")
    train_samples = index_dataset(train_images_dir, train_labels_dir)
    val_samples = index_dataset(val_images_dir, val_labels_dir) if os.path.exists(val_images_dir) else []
    
    if not train_samples:
        print("❌ No se encontraron samples de entrenamiento")
        return
    
    print(f"\n✅ Dataset indexado:")
    print(f"   Train: {len(train_samples)} muestras")
    print(f"   Val:   {len(val_samples)} muestras")
    
    # Crear datasets
    print("\n📦 Creando tf.data.Dataset...")
    
    train_image_paths = [s[0] for s in train_samples]
    train_label_paths = [s[1] for s in train_samples]
    val_image_paths = [s[0] for s in val_samples]
    val_label_paths = [s[1] for s in val_samples]
    
    def tf_load_train(img_path, lbl_path):
        def wrapper(img_p, lbl_p):
            img, tgt = load_sample(img_p.numpy().decode('utf-8'), lbl_p.numpy().decode('utf-8'))
            img, boxes = augment_image_and_boxes(img, tgt["boxes"])
            return img.numpy(), boxes.numpy(), tgt["classes"].numpy()
        
        image, boxes, classes = tf.py_function(
            func=wrapper, inp=[img_path, lbl_path],
            Tout=[tf.float32, tf.float32, tf.int32]
        )
        image.set_shape((IMG_HEIGHT, IMG_WIDTH, 3))
        boxes.set_shape([None, 4])
        classes.set_shape([None])
        return image, {"boxes": boxes, "classes": classes}
    
    def tf_load_val(img_path, lbl_path):
        def wrapper(img_p, lbl_p):
            img, tgt = load_sample(img_p.numpy().decode('utf-8'), lbl_p.numpy().decode('utf-8'))
            return img.numpy(), tgt["boxes"].numpy(), tgt["classes"].numpy()
        
        image, boxes, classes = tf.py_function(
            func=wrapper, inp=[img_path, lbl_path],
            Tout=[tf.float32, tf.float32, tf.int32]
        )
        image.set_shape((IMG_HEIGHT, IMG_WIDTH, 3))
        boxes.set_shape([None, 4])
        classes.set_shape([None])
        return image, {"boxes": boxes, "classes": classes}
    
    train_ds = tf.data.Dataset.from_tensor_slices((train_image_paths, train_label_paths))
    train_ds = train_ds.shuffle(1000).map(tf_load_train, num_parallel_calls=tf.data.AUTOTUNE)
    train_ds = train_ds.padded_batch(
        args.batch_size,
        padded_shapes=((IMG_HEIGHT, IMG_WIDTH, 3), {"boxes": [None, 4], "classes": [None]}),
        padding_values=(0.0, {"boxes": 0.0, "classes": -1})
    ).prefetch(tf.data.AUTOTUNE)
    
    val_ds = tf.data.Dataset.from_tensor_slices((val_image_paths, val_label_paths))
    val_ds = val_ds.map(tf_load_val, num_parallel_calls=tf.data.AUTOTUNE)
    val_ds = val_ds.padded_batch(
        args.batch_size,
        padded_shapes=((IMG_HEIGHT, IMG_WIDTH, 3), {"boxes": [None, 4], "classes": [None]}),
        padding_values=(0.0, {"boxes": 0.0, "classes": -1})
    ).prefetch(tf.data.AUTOTUNE)
    
    # Modelo
    print("\n🧠 Construyendo modelo...")
    base_model, input_tensor, box_preds, class_preds = build_ssd_model()
    
    # Anchors y losses
    print("\n⚓ Generando anchors...")
    anchors = generate_all_anchors()
    
    box_loss_fn = SSDBoxLoss(anchors)
    class_loss_fn = SSDClassLoss(anchors, neg_pos_ratio=3.0)
    
    # Wrapper
    ssd_model = SSDModel(base_model, box_loss_fn, class_loss_fn)
    ssd_model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=args.lr))
    
    # IMPORTANTE: Build del modelo antes de entrenar (requerido para guardar pesos)
    print("\n🔧 Construyendo modelo...")
    dummy_input = tf.zeros((1, IMG_HEIGHT, IMG_WIDTH, 3))
    _ = ssd_model(dummy_input, training=False)
    print("✓ Modelo construido correctamente")
    
    # Callbacks - guardar solo pesos (el modelo wrapper no es serializable)
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(models_dir, "ssd_best.weights.h5"),
            monitor="val_loss", save_best_only=True, save_weights_only=True, verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=5, min_lr=1e-7, verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=15, restore_best_weights=True, verbose=1
        ),
    ]
    
    # Entrenar - FASE 1: Backbone congelado (solo detection heads)
    print("\n" + "=" * 80)
    print("🏃 FASE 1: ENTRENAMIENTO INICIAL (Backbone congelado)")
    print("=" * 80)
    
    # Calcular epochs para cada fase asegurando al menos 1 epoch en cada una
    if args.epochs < 2:
        phase1_epochs = 1
        phase2_epochs = 0
    else:
        phase1_epochs = min(max(int(args.epochs * 0.7), 1), args.epochs - 1)
        phase2_epochs = args.epochs - phase1_epochs

    history_phase1 = ssd_model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=phase1_epochs,
        callbacks=callbacks,
        verbose=1
    )

    # =============================
    # FASE 2: Fine-tuning (descongelar backbone)
    print("\n" + "=" * 80)
    print("🔥 FASE 2: FINE-TUNING (Backbone parcialmente decongelado)")
    print("=" * 80)

    # Descongelar solo las últimas capas del backbone
    for layer in ssd_model.base_model.layers[:-20]:
        layer.trainable = False

    for layer in ssd_model.base_model.layers[-20:]:
        layer.trainable = True

    print("✓ Backbone parcialmente decongelado (últimas 20 capas)")

    # Learning rate más bajo para fine-tuning
    lr_finetuning = args.lr / 10
    ssd_model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr_finetuning)
    )
    print(f"✓ Learning rate ajustado a {lr_finetuning}")

    history_phase2 = None
    if phase2_epochs > 0:
        history_phase2 = ssd_model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=phase1_epochs + phase2_epochs,
            initial_epoch=phase1_epochs,
            callbacks=callbacks,
            verbose=1
        )
    
    # Combinar historiales
    if history_phase2 and 'loss' in history_phase2.history:
        history = {
            'loss': history_phase1.history['loss'] + history_phase2.history['loss'],
            'val_loss': history_phase1.history['val_loss'] + history_phase2.history['val_loss'],
            'phase1_epochs': phase1_epochs,
            'phase2_epochs': phase2_epochs
        }
    else:
        history = {
            'loss': history_phase1.history['loss'],
            'val_loss': history_phase1.history['val_loss'],
            'phase1_epochs': phase1_epochs,
            'phase2_epochs': 0
        }
    
    print("\n📊 Resumen de entrenamiento:")
    print(f"  Fase 1 (Backbone congelado): {phase1_epochs} epochs")
    print(f"  Fase 2 (Fine-tuning): {phase2_epochs} epochs")
    print(f"  Total: {args.epochs} epochs")
    
    # Guardar modelo final
    print("\n💾 Guardando modelo...")
    
    # Modelo funcional (compatible con ssd_detector.py)
    functional_model = Model(
        inputs=input_tensor,
        outputs={'boxes': box_preds, 'classes': class_preds},
        name='SSD_MobileNetV2_VehicleDetector'
    )
    functional_model.set_weights(ssd_model.base_model.get_weights())
   
    keras_path = os.path.join(models_dir, "ssd_vehicle_detector.keras")
    weights_path = os.path.join(models_dir, "ssd_vehicle_detector.weights.h5")
    
    functional_model.save(keras_path)
    functional_model.save_weights(weights_path)
    
    print(f"✅ Modelo guardado: {keras_path}")
    print(f"✅ Pesos guardados: {weights_path}")
    
    # Resumen
    print("\n" + "=" * 80)
    print("🎉 ENTRENAMIENTO COMPLETADO")
    print("=" * 80)

    print(f"   Epochs completados: {len(history['loss'])}")
    print(f"   Mejor val_loss: {min(history['val_loss']):.4f}")
    print(f"   Loss final: {history['loss'][-1]:.4f}")
    print(f"\n   Modelo listo para usar con ssd_detector.py")
    print("=" * 80)


if __name__ == '__main__':
    main()
