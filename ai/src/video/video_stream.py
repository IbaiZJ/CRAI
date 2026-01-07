import cv2
import time
from .webcam_video_stream import WebcamVideoStream
from utils.logger import get_logger

class VideoStream:
    """ Video Stream class """
    
    def __init__(self, src: int = 0, use_pi_camera: bool = False, resolution: tuple = (320, 240), 
                 framerate: int = 32, auto_find: bool = True):
        """Initialize VideoStream
        
        Args:
            src: Camera source index
            use_pi_camera: Use Raspberry Pi camera
            resolution: Video resolution (width, height)
            framerate: Target framerate
            auto_find: If True and src fails, automatically find working camera
        """
        self.logger = get_logger("VideoStream")
        
        if use_pi_camera:
            from .pi_video_stream import PiVideoStream
            self.logger.info(f"Inicializando Pi Camera con resolution={resolution}, framerate={framerate}")
            self.stream = PiVideoStream(resolution=resolution, framerate=framerate)
        else:
            # Try the configured source first
            self.logger.info(f"Intentando inicializar webcam en source={src}...")
            test_cap = cv2.VideoCapture(src)
            
            if test_cap.isOpened():
                ret, frame = test_cap.read()
                test_cap.release()
                
                if ret and frame is not None:
                    self.logger.info(f"✓ Camera {src} funciona correctamente")
                    self.stream = WebcamVideoStream(src=src, resolution=resolution, framerate=framerate)
                elif auto_find:
                    self.logger.warning(f"✗ Camera {src} abre pero no puede leer frames")
                    self._try_auto_find(src, resolution, framerate)
                else:
                    self.logger.error(f"✗ Camera {src} no funciona")
                    raise RuntimeError(f"Camera {src} cannot read frames and auto_find is disabled")
            elif auto_find:
                self.logger.warning(f"✗ Camera {src} no disponible, buscando alternativas...")
                self._try_auto_find(src, resolution, framerate)
            else:
                test_cap.release()
                raise RuntimeError(f"Camera {src} not available and auto_find is disabled")
    
    def _try_auto_find(self, original_src: int, resolution: tuple, framerate: int):
        """Try to find an alternative working camera"""
        available = self.find_available_cameras(max_cameras=6)
        
        if available:
            # Prefer the first available that's not the original
            selected = available[0]
            self.logger.info(f"✓ Usando camera {selected} en su lugar")
            self.stream = WebcamVideoStream(src=selected, resolution=resolution, framerate=framerate)
        else:
            self.logger.error("✗ No se encontraron cámaras disponibles")
            raise RuntimeError("No working cameras found")
            
    def start(self):
        # start the threaded video stream
        return self.stream.start()
    
    def update(self):
        # grab the next frame from the stream
        self.stream.update()
        
    def read(self):
        # return the current frame
        return self.stream.read()
    
    def stop(self):
        # stop the thread and release any resources
        self.stream.stop()
            
    @staticmethod
    def find_available_cameras(max_cameras: int = 5, timeout: float = 1.0):
        """Find all available camera sources
        
        Args:
            max_cameras: Maximum number of camera indices to test (0 to max_cameras-1)
            timeout: Timeout in seconds for each camera test
            
        Returns:
            List of available camera indices
        """
        logger = get_logger("VideoStream")
        available = []
        
        logger.info(f"Scanning for available cameras (0-{max_cameras-1})...")
        
        for i in range(max_cameras):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                # Try to read a frame
                ret, frame = cap.read()
                if ret and frame is not None:
                    available.append(i)
                    logger.info(f"  ✓ Camera {i} available")
                else:
                    logger.debug(f"  ✗ Camera {i} opened but cannot read frames")
            else:
                logger.debug(f"  ✗ Camera {i} not available")
            cap.release()
            time.sleep(0.1)  # Small delay between tests
        
        return available