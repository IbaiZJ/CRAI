"""
Detector de vehículos en tiempo real usando YOLOv8n (nano).
Optimizado para máxima velocidad en detección de vehículos.
"""

import cv2
import numpy as np
from ultralytics import YOLO
from typing import Tuple, Optional
import torch


class VehicleDetector:
    """
    Clase para detectar vehículos en tiempo real usando YOLOv8n.
    
    Características:
    - Usa YOLOv8n (nano) para máxima velocidad
    - Filtra solo clases de vehículos del dataset COCO
    - Optimizado para inferencia en tiempo real
    - Compatible con GPU (CUDA) y CPU
    """
    
    # Clases de vehículos en el dataset COCO (0-indexed)
    VEHICLE_CLASSES = {
        2: 'car',
        3: 'motorcycle',
        5: 'bus',
        7: 'truck'
    }
    
    def __init__(
        self, 
        model_path: str = 'yolov8n.pt',
        confidence_threshold: float = 0.5,
        use_half_precision: bool = True,
        device: Optional[str] = None
    ):
        """
        Inicializa el detector de vehículos.
        
        Args:
            model_path: Ruta al modelo YOLO (por defecto yolov8n.pt)
            confidence_threshold: Umbral mínimo de confianza para detecciones (0.0-1.0)
            use_half_precision: Usar FP16 para mayor velocidad (requiere GPU)
            device: Dispositivo para inferencia ('cuda', 'cpu', o None para auto-detectar)
        """
        print("[INFO] Inicializando VehicleDetector...")
        
        # Auto-detectar dispositivo si no se especifica
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
            
        print(f"[INFO] Usando dispositivo: {self.device}")
        
        # Cargar modelo YOLOv8n una sola vez
        self.model = YOLO(model_path)
        self.model.to(self.device)
        
        # Configurar half precision si está disponible y habilitado
        self.use_half = use_half_precision and self.device == 'cuda'
        if self.use_half:
            self.model.model.half()
            print("[INFO] Usando precisión FP16 para mayor velocidad")
        
        self.confidence_threshold = confidence_threshold
        
        # IDs de clases de vehículos para filtrado
        self.vehicle_class_ids = list(self.VEHICLE_CLASSES.keys())
        
        print(f"[INFO] Modelo cargado: {model_path}")
        print(f"[INFO] Detectando clases: {list(self.VEHICLE_CLASSES.values())}")
        print(f"[INFO] Umbral de confianza: {confidence_threshold}")
        print("[INFO] VehicleDetector listo para procesar frames")
        
    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Procesa un frame y dibuja las detecciones de vehículos.
        
        Args:
            frame: Frame BGR de OpenCV (numpy array)
            
        Returns:
            Frame con las bounding boxes dibujadas
        """
        # Realizar predicción con configuración optimizada para velocidad
        results = self.model.predict(
            frame,
            conf=self.confidence_threshold,
            classes=self.vehicle_class_ids,  # Solo detectar vehículos
            verbose=False,  # Sin output de consola
            stream=False,  # No usar streaming (para un solo frame)
            half=self.use_half  # Usar FP16 si está disponible
        )
        
        # Obtener el primer resultado (solo procesamos un frame)
        result = results[0]
        
        # Dibujar detecciones en el frame
        annotated_frame = self._draw_detections(frame, result)
        
        return annotated_frame
    
    def _draw_detections(self, frame: np.ndarray, result) -> np.ndarray:
        """
        Dibuja las bounding boxes y etiquetas en el frame.
        
        Args:
            frame: Frame original
            result: Resultado de la predicción de YOLO
            
        Returns:
            Frame anotado con las detecciones
        """
        # Crear copia del frame para no modificar el original
        annotated_frame = frame.copy()
        
        # Extraer boxes, scores y clases
        boxes = result.boxes
        
        if boxes is None or len(boxes) == 0:
            return annotated_frame
        
        # Procesar cada detección
        for box in boxes:
            # Coordenadas de la bounding box
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            
            # Confianza y clase
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = self.VEHICLE_CLASSES.get(class_id, 'unknown')
            
            # Elegir color según el tipo de vehículo
            color = self._get_color_for_class(class_id)
            
            # Dibujar bounding box
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            
            # Preparar texto de la etiqueta
            label = f"{class_name}: {confidence:.2f}"
            
            # Calcular tamaño del texto para el fondo
            (text_width, text_height), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
            )
            
            # Dibujar fondo del texto
            cv2.rectangle(
                annotated_frame,
                (x1, y1 - text_height - baseline - 5),
                (x1 + text_width, y1),
                color,
                -1
            )
            
            # Dibujar texto
            cv2.putText(
                annotated_frame,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )
        
        return annotated_frame
    
    def _get_color_for_class(self, class_id: int) -> Tuple[int, int, int]:
        """
        Retorna un color BGR para cada tipo de vehículo.
        
        Args:
            class_id: ID de la clase COCO
            
        Returns:
            Color BGR como tupla (B, G, R)
        """
        colors = {
            2: (0, 255, 0),      # car - verde
            3: (255, 0, 0),      # motorcycle - azul
            5: (0, 165, 255),    # bus - naranja
            7: (0, 0, 255)       # truck - rojo
        }
        return colors.get(class_id, (255, 255, 255))
    
    def get_detections(self, frame: np.ndarray) -> list:
        """
        Obtiene las detecciones sin dibujar en el frame.
        Útil si necesitas procesar las detecciones de otra manera.
        
        Args:
            frame: Frame BGR de OpenCV
            
        Returns:
            Lista de diccionarios con información de cada detección:
            [{'bbox': [x1, y1, x2, y2], 'confidence': float, 'class': str}, ...]
        """
        results = self.model.predict(
            frame,
            conf=self.confidence_threshold,
            classes=self.vehicle_class_ids,
            verbose=False,
            stream=False,
            half=self.use_half
        )
        
        result = results[0]
        boxes = result.boxes
        
        if boxes is None or len(boxes) == 0:
            return []
        
        detections = []
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = self.VEHICLE_CLASSES.get(class_id, 'unknown')
            
            detections.append({
                'bbox': [x1, y1, x2, y2],
                'confidence': confidence,
                'class': class_name,
                'class_id': class_id
            })
        
        return detections
