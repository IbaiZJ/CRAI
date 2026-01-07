# CRAI system detectors
from .vehicle_detector import VehicleDetector
from .plate_detector import PlateDetector
from .ocr import PlateReader

__all__ = ['VehicleDetector', 'PlateDetector', 'PlateReader']
