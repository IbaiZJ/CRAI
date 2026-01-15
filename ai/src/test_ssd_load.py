"""Test SSD model loading and inference"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import sys
sys.path.insert(0, '.')

import numpy as np
import cv2
import glob
from detectors.ssd_detector import SSDVehicleDetector

# Usar el nuevo modelo entrenado
models_dir = os.path.normpath(os.path.join('.', 'models'))
keras_file = os.path.join(models_dir, 'ssd_vehicle_detector.keras')

# Write results to file
output_file = open('test_output.txt', 'w')
def log(msg):
    print(msg)
    output_file.write(msg + '\n')
    output_file.flush()

log(f'Model path: {keras_file}')
log(f'Exists: {os.path.exists(keras_file)}')

# Test with real images
real_img_dir = "../notebooks/UA-DETRAC-DATASET-10K-2/train/images/"
real_images = glob.glob(real_img_dir + "*.jpg")

if not real_images:
    log(f"No images found in: {real_img_dir}")
    output_file.close()
    sys.exit(1)

# Test with default threshold (0.25)
log("=" * 60)
log("Testing with default threshold=0.25")
log("=" * 60)
detector = SSDVehicleDetector(model_path=keras_file)
log(f"Anchors: {len(detector.anchors)}")

# Test on 5 images
total_dets = 0
for img_path in real_images[:5]:
    img = cv2.imread(img_path)
    detections = detector.detect(img)
    total_dets += len(detections)
    if len(detections) > 0:
        log(f"  {os.path.basename(img_path)}: {len(detections)} detections")
        for d in detections[:3]:
            log(f"    conf={d['confidence']:.3f} bbox={d['bbox']}")
    else:
        log(f"  {os.path.basename(img_path)}: 0 detections")

log(f"\nTOTAL: {total_dets} detections in 5 images")
log("=" * 60)
log("Test complete")
output_file.close()
print("\nResults saved to test_output.txt")
