from ultralytics import YOLO
import cv2
import numpy as np
from utils.logger import get_logger

class PlateDetector:
    """
    License plate detector using YOLO
    Can work with full frame or vehicle ROI
    """
    
    def __init__(self, model_path: str = 'license_plate_detector.pt', conf_threshold: float = 0.5):
        """
        Initialize the license plate detector
        
        Args:
            model_path: Path to YOLO model trained for license plates
            conf_threshold: Minimum confidence threshold
            
        Note: If you don't have a model, download one from:
        - https://github.com/niconielsen32/LicensePlateDetector
        - Or train your own model with Ultralytics
        """
        self.logger = get_logger("PlateDetector")
        try:
            self.logger.info(f"Loading license plate model: {model_path}")
            self.model = YOLO(model_path)
            self.conf_threshold = conf_threshold
            self.logger.info(f"License plate model loaded successfully with threshold={conf_threshold}")
        except Exception as e:
            self.logger.error(f"Error loading model: {e}")
            self.logger.info("OPTIONS:")
            self.logger.info("1. Download a pre-trained model")
            self.logger.info("2. Use vehicle region of interest (ROI) detection")
            self.logger.info("3. Train your own model with your data")
            raise
    
    def detect(self, frame, vehicle_bbox=None):
        """
        Detect license plates in a frame or specific region
        
        Args:
            frame: Full frame (numpy array BGR)
            vehicle_bbox: [x1, y1, x2, y2] optional - search only in this region
            
        Returns:
            List of dictionaries with detections:
            [
                {
                    'bbox': [x1, y1, x2, y2],  # Coordenadas en el frame original
                    'confidence': 0.95,
                    'plate_image': np.array  # Imagen recortada de la matrícula
                },
                ...
            ]
        """
        # If vehicle bbox is provided, crop that region
        if vehicle_bbox is not None:
            x1, y1, x2, y2 = vehicle_bbox
            # Ensure coordinates are within frame
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)
            roi = frame[y1:y2, x1:x2]
            offset_x, offset_y = x1, y1
        else:
            roi = frame
            offset_x, offset_y = 0, 0
        
        # Run inference
        results = self.model(roi, conf=self.conf_threshold, verbose=False)[0]
        
        detections = []
        
        # Process each detection
        for box in results.boxes:
            # Extract coordinates relative to ROI
            rx1, ry1, rx2, ry2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0])
            
            # Convert to original frame coordinates
            x1 = int(rx1 + offset_x)
            y1 = int(ry1 + offset_y)
            x2 = int(rx2 + offset_x)
            y2 = int(ry2 + offset_y)
            
            # Crop license plate image
            plate_image = frame[y1:y2, x1:x2]
            
            detection = {
                'bbox': [x1, y1, x2, y2],
                'confidence': confidence,
                'plate_image': plate_image
            }
            
            detections.append(detection)
        
        return detections
    
    def detect_in_vehicles(self, frame, vehicle_detections):
        """
        Detect license plates inside each detected vehicle
        
        Args:
            frame: Original frame
            vehicle_detections: List of vehicle detections (from VehicleDetector)
            
        Returns:
            List of tuples (vehicle_detection, plate_detections):
            [
                (vehicle_dict, [plate_dict1, plate_dict2, ...]),
                ...
            ]
        """
        results = []
        
        for vehicle in vehicle_detections:
            vehicle_bbox = vehicle['bbox']
            
            # Search for plates only in vehicle region
            plate_detections = self.detect(frame, vehicle_bbox)
            
            if plate_detections:  # Only save if plates were found
                results.append((vehicle, plate_detections))
        
        return results
    
    def draw_detections(self, frame, plate_detections, color=(0, 255, 255)):
        """
        Draw license plate detections on the frame
        
        Args:
            frame: Original frame
            plate_detections: List of detections from detect() method
            color: BGR color for rectangle
            
        Returns:
            Frame with detections drawn
        """
        frame_copy = frame.copy()
        
        for det in plate_detections:
            x1, y1, x2, y2 = det['bbox']
            confidence = det['confidence']
            
            # Draw rectangle (yellow by default)
            cv2.rectangle(frame_copy, (x1, y1), (x2, y2), color, 2)
            
            # Prepare text
            label = f"Plate: {confidence:.2f}"
            
            # Background for text
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame_copy, (x1, y1 - 15), (x1 + w, y1), color, -1)
            
            # Text
            cv2.putText(frame_copy, label, (x1, y1 - 3), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        
        return frame_copy
    
    def draw_vehicles_with_plates(self, frame, vehicle_plate_results):
        """
        Draw vehicles and their detected license plates
        
        Args:
            frame: Original frame
            vehicle_plate_results: Result from detect_in_vehicles()
            
        Returns:
            Frame with vehicles (green) and plates (yellow) drawn
        """
        frame_copy = frame.copy()
        
        for vehicle, plates in vehicle_plate_results:
            # Draw vehicle (green)
            vx1, vy1, vx2, vy2 = vehicle['bbox']
            cv2.rectangle(frame_copy, (vx1, vy1), (vx2, vy2), (0, 255, 0), 2)
            
            vehicle_label = f"{vehicle['class_name']}: {vehicle['confidence']:.2f}"
            cv2.putText(frame_copy, vehicle_label, (vx1, vy1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
            # Draw plates (yellow)
            for plate in plates:
                px1, py1, px2, py2 = plate['bbox']
                cv2.rectangle(frame_copy, (px1, py1), (px2, py2), (0, 255, 255), 2)
                
                plate_label = f"Plate: {plate['confidence']:.2f}"
                cv2.putText(frame_copy, plate_label, (px1, py1 - 3), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
        
        return frame_copy

