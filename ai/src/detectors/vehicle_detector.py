from ultralytics import YOLO
import cv2
import numpy as np
from utils.logger import get_logger

class VehicleDetector:
    """
    Vehicle detector using Ultralytics YOLO
    """
    
    # Vehicle classes in COCO dataset (IDs of interest)
    VEHICLE_CLASSES = {
        2: 'car',
        3: 'motorcycle', 
        5: 'bus',
        7: 'truck'
    }
    
    def __init__(self, model_path: str = 'yolov8n.pt', conf_threshold: float = 0.5):
        """
        Initialize the vehicle detector
        
        Args:
            model_path: Path to YOLO model (auto-downloads if not exists)
            conf_threshold: Minimum confidence threshold for detections
        """
        self.logger = get_logger("VehicleDetector")
        self.logger.info(f"Loading YOLO model: {model_path}")
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        self.logger.info(f"Model loaded successfully with threshold={conf_threshold}")
        
    def detect(self, frame):
        """
        Detect vehicles in a frame
        
        Args:
            frame: Video frame (numpy array BGR)
            
        Returns:
            List of dictionaries with detections:
            [
                {
                    'bbox': [x1, y1, x2, y2],
                    'confidence': 0.95,
                    'class_id': 2,
                    'class_name': 'car'
                },
                ...
            ]
        """
        # Run inference
        results = self.model(frame, conf=self.conf_threshold, verbose=False)[0]
        
        detections = []
        
        # Process each detection
        for box in results.boxes:
            class_id = int(box.cls[0])
            
            # Filter only vehicles
            if class_id in self.VEHICLE_CLASSES:
                # Extract coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                
                detection = {
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': confidence,
                    'class_id': class_id,
                    'class_name': self.VEHICLE_CLASSES[class_id]
                }
                
                detections.append(detection)
        
        return detections
    
    def draw_detections(self, frame, detections):
        """
        Draw detections on the frame
        
        Args:
            frame: Original frame
            detections: List of detections from detect() method
            
        Returns:
            Frame with detections drawn
        """
        frame_copy = frame.copy()
        
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            confidence = det['confidence']
            class_name = det['class_name']
            
            # Draw rectangle
            cv2.rectangle(frame_copy, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Prepare text
            label = f"{class_name}: {confidence:.2f}"
            
            # Background for text
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(frame_copy, (x1, y1 - 20), (x1 + w, y1), (0, 255, 0), -1)
            
            # Text
            cv2.putText(frame_copy, label, (x1, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        
        return frame_copy
    print("\n✓ Program finished")