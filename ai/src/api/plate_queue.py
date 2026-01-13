import threading
import queue
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from api.request import APIRequest


class PlateQueue:
    """
    Thread-safe queue for sending license plate detections to API.
    Implements retry logic to ensure plates are not lost on send failure.
    """
    
    def __init__(self, endpoint_url: str, max_retries: int = 3, retry_delay: float = 2.0, timeout: int = 10):
        """
        Initialize the plate queue.
        
        Args:
            endpoint_url: Full URL to send POST requests (e.g., http://localhost:6903/ai/carPlate)
            max_retries: Maximum number of retry attempts per plate
            retry_delay: Delay in seconds between retries
            timeout: Request timeout in seconds
        """
        self.endpoint_url = endpoint_url
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.timeout = timeout
        
        self.queue = queue.Queue()
        self.running = False
        self.worker_thread = None
        
        self.logger = logging.getLogger("PlateQueue")
        self.api_client = APIRequest(timeout=timeout)
        
        # Statistics
        self.stats = {
            'sent': 0,
            'failed': 0,
            'retrying': 0
        }
        self.stats_lock = threading.Lock()
    
    def start(self):
        """Start the worker thread to process the queue."""
        if self.running:
            self.logger.warning("Queue worker is already running")
            return
        
        self.running = True
        self.worker_thread = threading.Thread(target=self._worker, daemon=True)
        self.worker_thread.start()
        self.logger.info(f"Plate queue worker started (endpoint: {self.endpoint_url})")
    
    def stop(self, timeout: float = 5.0):
        """
        Stop the worker thread gracefully.
        
        Args:
            timeout: Maximum time to wait for worker to finish
        """
        if not self.running:
            return
        
        self.running = False
        
        if self.worker_thread:
            self.worker_thread.join(timeout=timeout)
            if self.worker_thread.is_alive():
                self.logger.warning("Worker thread did not stop gracefully")
            else:
                self.logger.info("Worker thread stopped successfully")
    
    def add_plate(self, plate_text: str, confidence: float, vehicle_type: Optional[str] = None, 
                  metadata: Optional[Dict[str, Any]] = None):
        """
        Add a detected plate to the queue for sending.
        
        Args:
            plate_text: The license plate text
            confidence: OCR confidence score (0-1)
            vehicle_type: Type of vehicle (car, truck, etc.)
            metadata: Additional metadata to include
        """
        plate_data = {
            'plate': plate_text,
            'confidence': confidence,
            'vehicle_type': vehicle_type,
            'timestamp': datetime.now().isoformat(),
            'retries': 0
        }
        
        if metadata:
            plate_data['metadata'] = metadata
        
        self.queue.put(plate_data)
        self.logger.debug(f"Plate added to queue: {plate_text}")
    
    def _worker(self):
        """Worker thread that processes the queue."""
        self.logger.info("Queue worker thread started")
        
        while self.running:
            try:
                # Get plate from queue with timeout to allow checking running flag
                try:
                    plate_data = self.queue.get(timeout=1.0)
                except queue.Empty:
                    continue
                
                success = self._send_plate(plate_data)
                
                if success:
                    with self.stats_lock:
                        self.stats['sent'] += 1
                    self.queue.task_done()
                else:
                    # If failed, check if we should retry
                    plate_data['retries'] += 1
                    
                    if plate_data['retries'] < self.max_retries:
                        # Put back in queue for retry
                        with self.stats_lock:
                            self.stats['retrying'] += 1
                        
                        self.logger.warning(
                            f"Retrying plate {plate_data['plate']} "
                            f"(attempt {plate_data['retries'] + 1}/{self.max_retries})"
                        )
                        time.sleep(self.retry_delay)
                        self.queue.put(plate_data)
                        self.queue.task_done()
                    else:
                        # Max retries exceeded
                        with self.stats_lock:
                            self.stats['failed'] += 1
                        
                        self.logger.error(
                            f"Failed to send plate {plate_data['plate']} "
                            f"after {self.max_retries} attempts. Discarding."
                        )
                        self.queue.task_done()
            
            except Exception as e:
                self.logger.error(f"Error in worker thread: {e}", exc_info=True)
        
        self.logger.info("Queue worker thread stopped")
    
    def _send_plate(self, plate_data: Dict[str, Any]) -> bool:
        """
        Send plate data to the API endpoint.
        
        Args:
            plate_data: Plate information to send
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Prepare payload (remove internal fields)
            payload = {
                'plate': plate_data['plate'],
                'confidence': plate_data['confidence'],
                'timestamp': plate_data['timestamp']
            }
            
            if plate_data.get('vehicle_type'):
                payload['vehicle_type'] = plate_data['vehicle_type']
            
            if plate_data.get('metadata'):
                payload['metadata'] = plate_data['metadata']
            
            # Send POST request
            response = self.api_client.post(
                self.endpoint_url,
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code >= 200 and response.status_code < 300:
                self.logger.info(
                    f"Plate {plate_data['plate']} sent successfully "
                    f"(status: {response.status_code})"
                )
                return True
            else:
                self.logger.warning(
                    f"Failed to send plate {plate_data['plate']}: "
                    f"HTTP {response.status_code} - {response.text[:100]}"
                )
                return False
        
        except Exception as e:
            self.logger.error(f"Error sending plate {plate_data['plate']}: {e}")
            return False
    
    def get_stats(self) -> Dict[str, int]:
        """Get queue statistics."""
        with self.stats_lock:
            return {
                'sent': self.stats['sent'],
                'failed': self.stats['failed'],
                'retrying': self.stats['retrying'],
                'pending': self.queue.qsize()
            }
    
    def get_queue_size(self) -> int:
        """Get current queue size."""
        return self.queue.qsize()
