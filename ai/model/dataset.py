"""
Dataset Loading and Augmentation
================================

Utilities for loading images and labels in YOLO format,
and applying data augmentation for training.
"""

import os
from glob import glob
from typing import Tuple, List

import numpy as np
import tensorflow as tf

from .config import IMG_SIZE, IMG_HEIGHT, IMG_WIDTH


def load_image(image_path: str) -> tf.Tensor:
    """
    Load and preprocess an image.
    
    Args:
        image_path: Path to the image file.
        
    Returns:
        Preprocessed image tensor normalized to [0, 1].
    """
    image = tf.io.read_file(image_path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, IMG_SIZE)
    image = tf.cast(image, tf.float32) / 255.0
    return image


def load_yolo_label(label_path: str) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load labels in YOLO format.
    
    All classes are mapped to class 0 (generic vehicle) regardless
    of the original class ID in the label file.
    
    Args:
        label_path: Path to the YOLO label file.
        
    Returns:
        Tuple of (boxes, classes) where:
            - boxes: Array of shape (N, 4) with [x_center, y_center, width, height]
            - classes: Array of shape (N,) with class indices (all zeros)
    """
    boxes = []
    
    with open(label_path, "r") as f:
        for line in f.readlines():
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            # Ignore original class_id, all are class 0 (vehicle)
            x, y, w, h = map(float, parts[1:5])
            boxes.append([x, y, w, h])
    
    boxes = np.array(boxes, dtype=np.float32).reshape(-1, 4)
    # All classes are 0 (vehicle)
    classes = np.zeros(len(boxes), dtype=np.int32)
    
    return boxes, classes


def load_sample(image_path: str, label_path: str) -> Tuple[tf.Tensor, dict]:
    """
    Load an image-label pair.
    
    Args:
        image_path: Path to the image file.
        label_path: Path to the corresponding label file.
        
    Returns:
        Tuple of (image, targets) where targets is a dict with 'boxes' and 'classes'.
    """
    image = load_image(image_path)
    boxes, classes = load_yolo_label(label_path)
    
    boxes = tf.convert_to_tensor(boxes, dtype=tf.float32)
    classes = tf.convert_to_tensor(classes, dtype=tf.int32)
    
    return image, {"boxes": boxes, "classes": classes}


def augment_image_and_boxes(
    image: tf.Tensor, 
    boxes: tf.Tensor
) -> Tuple[tf.Tensor, tf.Tensor]:
    """
    Apply data augmentation to image without spatial transformations.
    
    Only applies color-based augmentations that don't affect box coordinates:
    - Random brightness adjustment
    - Random contrast adjustment
    - Random saturation adjustment
    
    Args:
        image: Input image tensor.
        boxes: Bounding boxes tensor (unchanged by this function).
        
    Returns:
        Tuple of (augmented_image, boxes).
    """
    image = tf.cast(image, tf.float32)
    
    # Random brightness (±30%)
    if tf.random.uniform([]) > 0.5:
        delta = tf.random.uniform([], -0.3, 0.3)
        image = tf.image.adjust_brightness(image, delta)
    
    # Random contrast (0.7-1.3x)
    if tf.random.uniform([]) > 0.5:
        factor = tf.random.uniform([], 0.7, 1.3)
        image = tf.image.adjust_contrast(image, factor)
    
    # Random saturation (0.7-1.3x)
    if tf.random.uniform([]) > 0.5:
        factor = tf.random.uniform([], 0.7, 1.3)
        image = tf.image.adjust_saturation(image, factor)
    
    # Clip image values to valid range
    image = tf.clip_by_value(image, 0.0, 1.0)
    
    return image, boxes


def index_dataset(images_dir: str, labels_dir: str) -> List[Tuple[str, str]]:
    """
    Index a dataset by finding matching image-label pairs.
    
    Args:
        images_dir: Directory containing images.
        labels_dir: Directory containing label files.
        
    Returns:
        List of (image_path, label_path) tuples.
    """
    samples = []
    image_paths = sorted(glob(os.path.join(images_dir, "*.jpg")))
    
    print(f"Found {len(image_paths)} images in {images_dir}")
    
    for img_path in image_paths:
        filename = os.path.splitext(os.path.basename(img_path))[0]
        label_path = os.path.join(labels_dir, filename + ".txt")
        
        if os.path.exists(label_path):
            samples.append((img_path, label_path))
    
    print(f"Indexed samples: {len(samples)}")
    return samples


def create_tf_dataset(
    samples: List[Tuple[str, str]],
    batch_size: int,
    augment: bool = False,
    shuffle: bool = False,
    shuffle_buffer: int = 1000
) -> tf.data.Dataset:
    """
    Create a TensorFlow dataset from indexed samples.
    
    Args:
        samples: List of (image_path, label_path) tuples.
        batch_size: Batch size for the dataset.
        augment: Whether to apply data augmentation.
        shuffle: Whether to shuffle the dataset.
        shuffle_buffer: Size of shuffle buffer.
        
    Returns:
        A batched and prefetched tf.data.Dataset.
    """
    image_paths = [s[0] for s in samples]
    label_paths = [s[1] for s in samples]
    
    def load_with_augmentation(img_path, lbl_path):
        def wrapper(img_p, lbl_p):
            img, tgt = load_sample(
                img_p.numpy().decode('utf-8'), 
                lbl_p.numpy().decode('utf-8')
            )
            if augment:
                img, boxes = augment_image_and_boxes(img, tgt["boxes"])
            else:
                boxes = tgt["boxes"]
            return img.numpy(), boxes.numpy(), tgt["classes"].numpy()
        
        image, boxes, classes = tf.py_function(
            func=wrapper, 
            inp=[img_path, lbl_path],
            Tout=[tf.float32, tf.float32, tf.int32]
        )
        image.set_shape((IMG_HEIGHT, IMG_WIDTH, 3))
        boxes.set_shape([None, 4])
        classes.set_shape([None])
        return image, {"boxes": boxes, "classes": classes}
    
    dataset = tf.data.Dataset.from_tensor_slices((image_paths, label_paths))
    
    if shuffle:
        dataset = dataset.shuffle(shuffle_buffer)
    
    dataset = dataset.map(
        load_with_augmentation, 
        num_parallel_calls=tf.data.AUTOTUNE
    )
    
    dataset = dataset.padded_batch(
        batch_size,
        padded_shapes=(
            (IMG_HEIGHT, IMG_WIDTH, 3), 
            {"boxes": [None, 4], "classes": [None]}
        ),
        padding_values=(0.0, {"boxes": 0.0, "classes": -1})
    )
    
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    
    return dataset
