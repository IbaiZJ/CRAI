import yaml
import os
import logging
from typing import Any, Dict
from utils.logger import get_logger


class Config:
    """
    Class to manage system configuration
    Loads from config.yaml and provides easy access to parameters
    """
    
    def __init__(self, config_path: str = "config/config.yaml"):
        """
        Initialize configuration
        
        Args:
            config_path: Path to config.yaml file (relative or absolute)
        """
        self.logger = get_logger("Config")
        
        # Resolve path: if relative, make it relative to the script directory
        if not os.path.isabs(config_path):
            # Get the directory where the script is being executed from
            script_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one level (from config/ to src/) and then resolve the path
            base_dir = os.path.dirname(script_dir)
            self.config_path = os.path.join(base_dir, config_path)
        else:
            self.config_path = config_path
            
        self._config = self._load_config()
    
    def _load_config(self) -> Dict:
        """Load YAML configuration file"""
        if not os.path.exists(self.config_path):
            self.logger.warning(f"{self.config_path} not found, using default configuration")
            return self._get_default_config()
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
                self.logger.info(f"Configuration loaded from: {self.config_path}")
                return config
        except Exception as e:
            self.logger.error(f"Error loading configuration: {e}")
            self.logger.info("Using default configuration")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict:
        """Default configuration if file doesn't exist"""
        return {
            'camera': {
                'source': 1,
                'cameraId': 137,
                'use_threading': True
            },
            'vehicle_detector': {
                'model_path': 'yolov8n.pt',
                'confidence_threshold': 0.5
            },
            'plate_detector': {
                'model_path': 'models/license_plate_detector.pt',
                'confidence_threshold': 0.3,
                'min_plate_width': 40,
                'min_plate_height': 20
            },
            'ocr': {
                'enabled': True,
                'engine': 'easyocr',
                'languages': ['en'],
                'use_gpu': False,
                'confidence_threshold': 0.3,
                'min_text_length': 4,
                'ocr_frequency': 15
            },
            'display': {
                'window_name': 'Recognition System',
                'enabled': True,
                'show_fps': True,
                'show_stats': True
            },
            'debug': {
                'enabled': False,
                'save_debug_images': False
            }
        }
    
    def get(self, path: str, default: Any = None) -> Any:
        """
        Get a configuration value using dot notation
        
        Args:
            path: Path to value (e.g.: "camera.source", "ocr.confidence_threshold")
            default: Default value if not found
        
        Returns:
            Configuration value or default
        
        Example:
            config.get("camera.source")  # Returns 1
            config.get("ocr.languages")  # Returns ['en']
        """
        keys = path.split('.')
        value = self._config
        
        try:
            for key in keys:
                value = value[key]
            return value
        except (KeyError, TypeError):
            return default
    
    def set(self, path: str, value: Any):
        """
        Set a configuration value
        
        Args:
            path: Path to value (e.g.: "camera.source")
            value: New value
        """
        keys = path.split('.')
        config = self._config
        
        # Navigate to second-to-last level
        for key in keys[:-1]:
            if key not in config:
                config[key] = {}
            config = config[key]
        
        # Set the value
        config[keys[-1]] = value
    
    def save(self, path: str = None):
        """
        Save current configuration to a YAML file
        
        Args:
            path: Path where to save (uses config_path by default)
        """
        save_path = path or self.config_path
        
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, 'w', encoding='utf-8') as f:
                yaml.dump(self._config, f, default_flow_style=False, 
                         allow_unicode=True, sort_keys=False)
            
            print(f"✓ Configuration saved to: {save_path}")
            return True
        except Exception as e:
            print(f"✗ Error saving configuration: {e}")
            return False
    
    def reload(self):
        """Reload configuration from file"""
        self._config = self._load_config()
        print("✓ Configuration reloaded")
    
    def print_config(self):
        """Print current configuration"""
        print("\n" + "="*60)
        print("CURRENT CONFIGURATION")
        print("="*60)
        self._print_dict(self._config)
        print("="*60 + "\n")
    
    def _print_dict(self, d: Dict, indent: int = 0):
        """Print a dictionary in readable format"""
        for key, value in d.items():
            if isinstance(value, dict):
                print("  " * indent + f"{key}:")
                self._print_dict(value, indent + 1)
            else:
                print("  " * indent + f"{key}: {value}")
    
    # Common shortcuts
    @property
    def camera_source(self) -> int:
        return self.get("camera.source", 0)
    
    @property
    def vehicle_model_path(self) -> str:
        return self.get("vehicle_detector.model_path", "yolov8n.pt")
    
    @property
    def vehicle_confidence(self) -> float:
        return self.get("vehicle_detector.confidence_threshold", 0.5)
    
    @property
    def plate_model_path(self) -> str:
        return self.get("plate_detector.model_path", "models/license_plate_detector.pt")
    
    @property
    def plate_confidence(self) -> float:
        return self.get("plate_detector.confidence_threshold", 0.3)
    
    @property
    def ocr_enabled(self) -> bool:
        return self.get("ocr.enabled", True)
    
    @property
    def ocr_languages(self) -> list:
        return self.get("ocr.languages", ["en"])
    
    @property
    def ocr_confidence(self) -> float:
        return self.get("ocr.confidence_threshold", 0.3)
    
    @property
    def debug_enabled(self) -> bool:
        return self.get("debug.enabled", False)


# ============================================
# Example Script
# ============================================

if __name__ == "__main__":
    print("=== Configuration System Test ===\n")
    
    # Load configuration
    config = Config("config/config.yaml")
    
    # Show configuration
    config.print_config()
    
    # Access with dot notation
    print("\n--- Access Examples ---")
    print(f"Camera: {config.get('camera.source')}")
    print(f"Vehicle model: {config.get('vehicle_detector.model_path')}")
    print(f"OCR threshold: {config.get('ocr.confidence_threshold')}")
    print(f"OCR languages: {config.get('ocr.languages')}")
    
    # Access with properties
    print("\n--- Using Properties ---")
    print(f"Camera: {config.camera_source}")
    print(f"Vehicle confidence: {config.vehicle_confidence}")
    print(f"OCR enabled: {config.ocr_enabled}")
    
    # Modify value
    print("\n--- Modify Configuration ---")
    config.set("camera.source", 2)
    config.set("debug.enabled", True)
    print(f"New camera: {config.get('camera.source')}")
    print(f"Debug: {config.get('debug.enabled')}")
    
    # Save
    config.save("config/config_modified.yaml")
    
    print("\n✓ Test completed")
