import cv2
import numpy as np
import re
from collections import deque
from utils.logger import get_logger

class PlateReader:
    """
    License plate reader using EasyOCR
    Optimized for real-time with cache and improved preprocessing
    """
    
    def __init__(self, languages=['en'], gpu=False):
        """
        Initialize the OCR reader
        
        Args:
            languages: List of languages for recognition ['en', 'es']
            gpu: Use GPU if available (True/False)
        """
        self.logger = get_logger("PlateReader")
        try:
            import easyocr
            self.logger.info(f"Initializing EasyOCR with languages: {languages}, GPU: {gpu}")
            self.reader = easyocr.Reader(languages, gpu=gpu, verbose=False)
            self.logger.info("EasyOCR loaded successfully")
            self.available = True
        except ImportError:
            self.logger.error("EasyOCR is not installed")
            self.logger.info("Install with: pip install easyocr")
            self.logger.info("Or with: pip install easyocr torch torchvision")
            self.available = False
        except Exception as e:
            self.logger.error(f"Error initializing EasyOCR: {e}")
            self.available = False
        
        # Cache for recent results (avoid reprocessing)
        self._cache = {}
        self._cache_max_size = 50
        
        # History for reading stabilization
        self._history = deque(maxlen=5)  # Reduced to change faster
        self._last_stable = None
    
    def _get_image_hash(self, image):
        """Generate a simple hash of the image for cache"""
        if image is None or image.size == 0:
            return None
        # Reduce to 8x8 and calculate hash
        small = cv2.resize(image, (8, 8), interpolation=cv2.INTER_AREA)
        if len(small.shape) == 3:
            small = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        return hash(small.tobytes())
    
    def read_plate(self, plate_image, use_cache=True):
        """
        Read text from a license plate image
        
        Args:
            plate_image: Cropped license plate image (numpy array)
            use_cache: Use cache for similar images
            
        Returns:
            dict: {
                'text': 'ABC1234',
                'confidence': 0.95,
                'raw_text': 'A BC 1234',
                'success': True
            }
        """
        if not self.available:
            return {
                'text': 'OCR_NO_DISPONIBLE',
                'confidence': 0.0,
                'raw_text': '',
                'success': False
            }
        
        if plate_image is None or plate_image.size == 0:
            return {
                'text': '',
                'confidence': 0.0,
                'raw_text': '',
                'success': False
            }
        
        # Check minimum size
        h, w = plate_image.shape[:2]
        if h < 15 or w < 30:
            return {
                'text': '',
                'confidence': 0.0,
                'raw_text': '',
                'success': False
            }
        
        # Search in cache
        if use_cache:
            img_hash = self._get_image_hash(plate_image)
            if img_hash in self._cache:
                return self._cache[img_hash]
        
        try:
            # OPTIMIZADO: Usar solo un método de preprocesamiento para mejor rendimiento
            processed = self._preprocess_fast(plate_image)
            results_all = self.reader.readtext(processed, detail=1, paragraph=False)
            
            if not results_all:
                result = {
                    'text': '',
                    'confidence': 0.0,
                    'raw_text': '',
                    'success': False
                }
            else:
                # Combine all results and choose the best
                # Filter results with alphanumeric text
                valid_results = []
                for r in results_all:
                    text = r[1]
                    conf = r[2]
                    clean = re.sub(r'[^A-Z0-9]', '', text.upper())
                    if len(clean) >= 3 and conf > 0.1:
                        valid_results.append((clean, conf, text))
                
                if valid_results:
                    # Sort by: length * confidence (prioritize long and reliable texts)
                    valid_results.sort(key=lambda x: len(x[0]) * x[1], reverse=True)
                    best = valid_results[0]
                    
                    # Apply corrections and cleaning
                    final_text = self._clean_plate_text(best[0])
                    
                    result = {
                        'text': final_text,
                        'confidence': best[1],
                        'raw_text': best[2],
                        'success': True
                    }
                else:
                    result = {
                        'text': '',
                        'confidence': 0.0,
                        'raw_text': '',
                        'success': False
                    }
            
            # Save in cache
            if use_cache and img_hash:
                if len(self._cache) >= self._cache_max_size:
                    # Remove oldest entry
                    oldest_key = next(iter(self._cache))
                    del self._cache[oldest_key]
                self._cache[img_hash] = result
            
            return result
            
        except Exception as e:
            print(f"Error en OCR: {e}")
            return {
                'text': '',
                'confidence': 0.0,
                'raw_text': '',
                'success': False
            }
    
    def read_plate_stabilized(self, plate_image):
        """
        Read license plate with temporal stabilization
        Uses reading history to give more stable result
        """
        result = self.read_plate(plate_image)
        
        if result['success']:
            self._history.append(result['text'])
        
        # If we have history, search for most common text
        if len(self._history) >= 3:
            from collections import Counter
            counter = Counter(self._history)
            most_common = counter.most_common(1)[0]
            
            if most_common[1] >= 2:  # At least 2 occurrences
                result['text'] = most_common[0]
                result['stabilized'] = True
        
        return result
    
    def read_plates_batch(self, plate_images):
        """
        Read multiple license plates in batch
        
        Args:
            plate_images: List of license plate images
            
        Returns:
            List of OCR results
        """
        results = []
        for plate_img in plate_images:
            result = self.read_plate(plate_img)
            results.append(result)
        return results
    
    def _preprocess_simple(self, plate_image):
        """Simple preprocessing: only scale"""
        if len(plate_image.shape) == 3:
            gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_image
        
        # Scale to optimal size for OCR
        height, width = gray.shape
        target_height = 64
        scale = target_height / height
        new_width = int(width * scale)
        
        resized = cv2.resize(gray, (new_width, target_height), interpolation=cv2.INTER_CUBIC)
        return resized
    
    def _preprocess_fast(self, plate_image):
        """
        Preprocesamiento rápido y optimizado para mejor rendimiento
        Un solo método eficiente en lugar de múltiples
        """
        if len(plate_image.shape) == 3:
            gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_image.copy()
        
        # Escalar a tamaño óptimo para OCR
        height, width = gray.shape
        target_height = 64
        scale = target_height / height
        new_width = int(width * scale)
        gray = cv2.resize(gray, (new_width, target_height), interpolation=cv2.INTER_LINEAR)
        
        # CLAHE rápido para mejorar contraste
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        return enhanced
    
    def _preprocess_high_contrast(self, plate_image):
        """Preprocessing with high contrast"""
        if len(plate_image.shape) == 3:
            gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_image.copy()
        
        # Escalar
        height, width = gray.shape
        target_height = 80
        scale = target_height / height
        new_width = int(width * scale)
        gray = cv2.resize(gray, (new_width, target_height), interpolation=cv2.INTER_CUBIC)
        
        # Aggressive CLAHE
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(4, 4))
        enhanced = clahe.apply(gray)
        
        # Otsu binarization
        _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return binary
    
    def _preprocess_plate(self, plate_image):
        """
        Preprocess the license plate image to improve OCR
        """
        # Convert to grayscale if color
        if len(plate_image.shape) == 3:
            gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_image.copy()
        
        # Scale to optimal size (height of 50-80 px is ideal for OCR)
        height, width = gray.shape
        target_height = 64
        scale = target_height / height
        new_width = int(width * scale)
        gray = cv2.resize(gray, (new_width, target_height), interpolation=cv2.INTER_CUBIC)
        
        # Reduce noise
        gray = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Improve contrast with CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 15, 4
        )
        
        # Morphological operations to clean
        kernel = np.ones((2, 2), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return thresh
        
        # Reduce noise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        return denoised
    
    def validate_plate(self, plate: str) -> str | None:
        """
        Validate the format of Spanish car plate and convert to uppercase
        Spanish plates format: 4 digits + 3 consonant letters (no vowels)
        Example: 1234BCD
        
        Args:
            plate: Plate text to validate
            
        Returns:
            Formatted plate if valid, None otherwise
        """
        if not plate:
            return None
        
        # Remove spaces and dashes, convert to uppercase
        formatted_plate = plate.upper().replace(" ", "").replace("-", "")
        
        # Check Spanish plate format: 4 digits + 3 consonants
        if re.match(r"^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$", formatted_plate):
            return formatted_plate
        
        return None
    
    def _clean_plate_text(self, text):
        """
        Clean the license plate text
        Remove spaces, dashes, special characters and normalize
        """
        if not text:
            return ""
            
        # Remove spaces, dashes and convert to uppercase
        text = text.replace(' ', '').replace('-', '').replace('.', '').upper()
        
        # Keep only letters and numbers
        text = re.sub(r'[^A-Z0-9]', '', text)
        
        if len(text) < 3:
            return text
        
        # DO NOT apply aggressive automatic corrections
        # Only clean obvious characters that don't exist in license plates
        
        # Very conservative corrections (only very clear cases)
        cleaned = list(text)
        
        # Safe replacements that are almost always OCR errors
        safe_replacements = {
            '$': 'S',
            '!': '1',
            '|': '1', 
            '@': 'A',
            '#': 'H',
        }
        
        for i, char in enumerate(cleaned):
            if char in safe_replacements:
                cleaned[i] = safe_replacements[char]
        
        result = ''.join(cleaned)
        
        # Validate Spanish plate format before returning
        validated = self.validate_plate(result)
        if validated:
            return validated
        
        # If not valid Spanish format, return empty string
        return ""
    
    def get_stable_reading(self, min_occurrences=2):
        """
        Get the most stable reading from history
        Uses character voting and common pattern detection
        """
        if len(self._history) < min_occurrences:
            return None
        
        from collections import Counter
        
        # Get recent readings
        recent = list(self._history)
        
        # If most recent reading is very different, clean history
        if len(recent) >= 2:
            last = recent[-1]
            prev = recent[-2]
            # Compare first characters (the start is usually more stable)
            min_len = min(len(last), len(prev), 4)
            diff_start = sum(1 for a, b in zip(last[:min_len], prev[:min_len]) if a != b)
            if diff_start >= 3:
                # New plate detected, clean history
                self._history.clear()
                self._history.append(last)
                self._last_stable = None
                return None
        
        # Find common pattern using alignment
        # Search for longest substring that appears in most readings
        
        if len(recent) >= 2:
            # Use reading with most reasonable length as reference
            # (filter very short and very long ones)
            lengths = [len(t) for t in recent]
            median_len = sorted(lengths)[len(lengths)//2]
            
            # Filter readings with length close to median
            valid_readings = [t for t in recent if abs(len(t) - median_len) <= 2]
            
            if valid_readings:
                # Find common core
                result = self._find_common_core(valid_readings)
                if result and len(result) >= 4:
                    self._last_stable = result
                    return result
        
        # Fallback: simple voting
        most_common = Counter(recent).most_common(1)[0][0]
        self._last_stable = most_common
        return most_common
    
    def _find_common_core(self, readings):
        """
        Find common core between several readings
        Ex: ['MI808THA', 'MI808TH', 'M808TH'] -> 'MI808TH'
        """
        if not readings:
            return None
        
        from collections import Counter
        
        # Sort by length (from largest to smallest)
        sorted_readings = sorted(readings, key=len, reverse=True)
        reference = sorted_readings[0]
        
        # Vote for each position
        max_len = len(reference)
        votes = []
        
        for i in range(max_len):
            chars_at_pos = []
            for reading in readings:
                if i < len(reading):
                    chars_at_pos.append(reading[i])
            
            if chars_at_pos:
                # Most common character at this position
                counter = Counter(chars_at_pos)
                most_common, count = counter.most_common(1)[0]
                # Only include if appears in at least 40% of readings
                if count >= len(readings) * 0.4:
                    votes.append(most_common)
                else:
                    # If no consensus, stop (probably noise at the end)
                    break
        
        return ''.join(votes) if votes else None
    
    def reset_history(self):
        """Clear reading history"""
        self._history.clear()
        self._last_stable = None
        self._cache.clear()

