import logging
import cv2
import os
import time
import warnings
from datetime import datetime

# Suprimir warnings de PyTorch relacionados con pin_memory
warnings.filterwarnings('ignore', category=UserWarning, message='.*pin_memory.*')

from video.video_stream import VideoStream
from video.fps import FPS
from detectors.vehicle_detector import VehicleDetector
from detectors.plate_detector import PlateDetector
from detectors.ocr import PlateReader
from config.config import Config
from utils.logger import get_logger, LogSection
from utils.terminal import Terminal
from api.plate_queue import PlateQueue

# Modos de detección
MODE_YOLO_OCR = "YOLO + OCR"
MODE_SSD_CUSTOM = "SSD Custom"


def main():
    Terminal.start()
    logger = get_logger("CRAI", level=logging.INFO)
    dir = os.path.dirname(os.path.abspath(__file__))
    
    with LogSection(logger, "Loading configuration"):
        config = Config("config/config.yaml")
        logger.info(f"Loading from: {config.config_path}")
    
    with LogSection(logger, "System initialization"):
        logger.info("1. Starting camera...")
        camera_source = config.get('camera.source', 1)
        camera_id = config.get('camera.cameraId', 137)
        auto_find = config.get('camera.auto_find', True)
        resolution = (config.get('camera.resolution.width', 1280), config.get('camera.resolution.height', 720))
        vs = VideoStream(src=camera_source, resolution=resolution, auto_find=auto_find).start()
        logger.info("✓ Camera started successfully")
        
        logger.info("2. Initializing plate queue...")
        endpoint_base = config.get('api.endpoint_base_url', 'http://localhost:6903')
        endpoint_path = config.get('api.car_plate_endpoint', '/ai/carPlate')
        full_endpoint = f"{endpoint_base}{endpoint_path}"
        
        plate_queue = PlateQueue(
            endpoint_url=full_endpoint,
            max_retries=config.get('api.max_retries', 3),
            retry_delay=config.get('api.retry_delay', 2.0),
            timeout=config.get('api.timeout', 10)
        )
        plate_queue.start()
        logger.info("✓ Plate queue initialized")
        
        # Create captures directory for saving detected plates
        captures_dir = os.path.join(dir, 'captures')
        os.makedirs(captures_dir, exist_ok=True)
        logger.info(f"✓ Captures directory: {captures_dir}")
        
        logger.info("3. Loading YOLO vehicle detector...")
        vehicle_model_path = config.get('vehicle_detector.model_path', 'models/yolov8n.pt')
        if not os.path.isabs(vehicle_model_path):
            vehicle_model_path = os.path.join(dir, vehicle_model_path)
        vehicle_detector = VehicleDetector(
            model_path=vehicle_model_path,
            conf_threshold=config.get('vehicle_detector.confidence_threshold', 0.5)
        )
        
        logger.info("4. Loading license plate detector...")
        plate_model_path = config.get('plate_detector.model_path', 'models/license_plate_detector.pt')
        if not os.path.isabs(plate_model_path):
            plate_model_path = os.path.join(dir, plate_model_path)
        plate_detector = PlateDetector(
            model_path=plate_model_path,
            conf_threshold=config.get('plate_detector.confidence_threshold', 0.4)
        )
        
        logger.info("5. Initializing OCR...")
        ocr_enabled = config.get('ocr.enabled', True)
        ocr_available = False
        plate_reader = None
        
        if ocr_enabled:
            try:
                plate_reader = PlateReader(
                    languages=config.get('ocr.languages', ['en']),
                    gpu=config.get('ocr.use_gpu', False)
                )
                ocr_available = plate_reader.available
            except Exception as e:
                logger.warning(f"OCR not available: {e}, continuing without text reading")
        else:
            logger.warning("OCR disabled in configuration")
        
        # 6. Cargar modelo SSD personalizado
        logger.info("6. Loading SSD custom model...")
        ssd_detector = None
        ssd_available = False
        try:
            from detectors.ssd_detector import SSDVehicleDetector
            
            # Buscar archivos de modelo en orden de preferencia
            # Primero en src/models, luego en notebooks/models
            src_models_dir = os.path.normpath(os.path.join(dir, 'models'))
            notebook_models_dir = os.path.normpath(os.path.join(dir, '..', 'notebooks', 'models'))
            
            # Preferir ssd_vehicle_detector.keras (nuevo modelo funcional)
            model_candidates = [
                (src_models_dir, 'ssd_vehicles_detector.keras'),
                (notebook_models_dir, 'ssd_vehicles_detector.keras'),
            ]
            
            ssd_path = None
            for models_dir, filename in model_candidates:
                candidate = os.path.join(models_dir, filename)
                if os.path.exists(candidate):
                    ssd_path = candidate
                    logger.info(f"Found SSD model: {filename}")
                    break
            
            if ssd_path:
                logger.info(f"Loading SSD from: {ssd_path}")
                ssd_detector = SSDVehicleDetector(
                    model_path=ssd_path,
                    conf_threshold=config.get('ssd_detector.confidence_threshold', 0.3)
                )
                ssd_available = ssd_detector.available
                if ssd_available:
                    logger.info("✓ SSD custom model loaded successfully")
                else:
                    logger.warning("SSD model initialized but not marked as available")
            else:
                logger.warning("SSD model files not found")
                logger.info("SSD model will not be available")
        except Exception as e:
            logger.warning(f"SSD model not available: {e}")
            import traceback
            logger.debug(traceback.format_exc())
    
    with LogSection(logger, "Parameter configuration"):
        window_name = config.get('display.window_name', 'CRAI - Car Registration AI')
        display_enabled = config.get('display.enabled', True)
        show_fps = config.get('display.show_fps', True)
        show_stats = config.get('display.show_stats', True)
        min_plate_width = config.get('plate_detector.min_plate_width', 30)
        min_plate_height = config.get('plate_detector.min_plate_height', 15)
        min_text_length = config.get('ocr.min_text_length', 5)
        color_vehicle = tuple(config.get('display.colors.vehicle_box', [0, 255, 0]))
        color_plate = tuple(config.get('display.colors.plate_box', [0, 255, 255]))
        
        # Frecuencia de OCR (ejecutar cada N frames para mejor rendimiento)
        ocr_frequency = config.get('ocr.ocr_frequency', 5)
        
        logger.info(f"Window: {window_name}")
        logger.info(f"OCR available: {ocr_available}")
        logger.info(f"Display enabled: {display_enabled}")
        logger.info(f"SSD available: {ssd_available}")
        logger.info(f"OCR frequency: every {ocr_frequency} frames")
        logger.info("Press 'M' to toggle between YOLO+OCR and SSD Custom modes")
    
    Terminal.print_info()
    logger.info("Starting main loop...")
    
    detected_plates = {}
    # Cache para mostrar la última matrícula detectada en pantalla
    last_plate_cache = {}  # {plate_bbox_key: {'text': 'ABC123', 'conf': 0.95, 'expires': frame_count + N}}
    frame_count = 0
    fps = FPS().start()
    
    # Modo actual de detección (True = YOLO+OCR, False = SSD Custom)
    use_yolo_mode = True
    current_mode = MODE_YOLO_OCR
    color_ssd = (255, 165, 0)  # Orange para SSD
    
    show_window = display_enabled

    try:
        while True:
            frame = vs.read()
            if frame is None:
                continue
            
            fps.update()
            frame_count += 1
            run_ocr_this_frame = (frame_count % ocr_frequency == 0)
            
            frame_display = frame.copy()
            total_plates = 0
            vehicles = []  # Inicializar lista de vehículos
            
            # ========== MODO SSD CUSTOM (sin OCR) ==========
            if not use_yolo_mode and ssd_available:
                vehicles = ssd_detector.detect(frame)
                
                for vehicle in vehicles:
                    x1, y1, x2, y2 = vehicle['bbox']
                    cv2.rectangle(frame_display, (x1, y1), (x2, y2), color_ssd, 2)
                    label = f"Car (SSD): {vehicle['confidence']:.2f}"
                    
                    # Fondo para texto
                    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    cv2.rectangle(frame_display, (x1, y1 - th - 10), (x1 + tw + 6, y1), color_ssd, -1)
                    cv2.putText(frame_display, label, (x1 + 3, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            
            # ========== MODO YOLO + OCR ==========
            else:
                vehicles = vehicle_detector.detect(frame)
                
                if not vehicles:
                    pass  # No vehicles detected
                else:
                    for vehicle in vehicles:
                        x1, y1, x2, y2 = vehicle['bbox']
                        cv2.rectangle(frame_display, (x1, y1), (x2, y2), color_vehicle, 2)
                        label = f"{vehicle['class_name']}: {vehicle['confidence']:.2f}"
                        cv2.putText(frame_display, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_vehicle, 2)
                        
                        vehicle_bbox = vehicle['bbox']
                        plate_detections = plate_detector.detect(frame, vehicle_bbox)
                        total_plates += len(plate_detections)
                
                        for plate in plate_detections:
                            px1, py1, px2, py2 = plate['bbox']
                            cv2.rectangle(frame_display, (px1, py1), (px2, py2), color_plate, 2)
                            
                            # Clave para cache basada en posición aproximada
                            cache_key = f"{px1//50}_{py1//50}"
                            
                            plate_text = None
                            ocr_conf = None
                            
                            # Verificar si hay resultado en cache
                            if cache_key in last_plate_cache:
                                cached = last_plate_cache[cache_key]
                                if cached['expires'] > frame_count:
                                    plate_text = cached['text']
                                    ocr_conf = cached['conf']
                            
                            # Ejecutar OCR solo cada N frames o si no hay cache
                            if ocr_available and (run_ocr_this_frame or plate_text is None):
                                plate_img = plate['plate_image']
                                if plate_img is not None and plate_img.size > 0:
                                    h, w = plate_img.shape[:2]
                                    
                                    if h > min_plate_height and w > min_plate_width:
                                        ocr_result = plate_reader.read_plate(plate_img)
                                        
                                        # DEBUG: Ver qué devuelve el OCR
                                        if ocr_result['text']:
                                            print(f"[OCR] Detectado: '{ocr_result['text']}' (conf: {ocr_result['confidence']:.2f})")
                                        
                                        # Mostrar cualquier texto detectado, aunque sea corto
                                        if ocr_result['success'] and ocr_result['text']:
                                            text = ocr_result['text']
                                            conf = ocr_result['confidence']
                                            
                                            # SIEMPRE guardar en cache para mostrar en pantalla
                                            plate_text = text
                                            ocr_conf = conf
                                            last_plate_cache[cache_key] = {
                                                'text': text,
                                                'conf': conf,
                                                'expires': frame_count + ocr_frequency * 5
                                            }
                                            
                                            # Solo guardar/enviar si cumple longitud mínima
                                            if len(text) >= min_text_length:
                                                if text not in detected_plates:
                                                    detected_plates[text] = {
                                                        'count': 1,
                                                        'confidence': conf,
                                                        'vehicle_type': vehicle['class_name']
                                                    }
                                                    
                                                    # Save captures of vehicle and plate
                                                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                                                    
                                                    # Save vehicle image
                                                    vehicle_img = frame[y1:y2, x1:x2]
                                                    if vehicle_img.size > 0:
                                                        vehicle_filename = f"{timestamp}_{text}_vehicle.jpg"
                                                        vehicle_path = os.path.join(captures_dir, vehicle_filename)
                                                        cv2.imwrite(vehicle_path, vehicle_img)
                                                    
                                                    # Save plate image
                                                    if plate_img is not None and plate_img.size > 0:
                                                        plate_filename = f"{timestamp}_{text}_plate.jpg"
                                                        plate_path = os.path.join(captures_dir, plate_filename)
                                                        cv2.imwrite(plate_path, plate_img)
                                                    
                                                    logger.info(f"Captures saved: {vehicle_filename}")
                                                    
                                                    # Send plate to queue for API posting
                                                    plate_queue.add_plate(
                                                        plate_text=text,
                                                        camera_id=camera_id
                                                    )
                                                    logger.info(f"New plate detected and queued: {text} (conf: {conf:.2f})")
                                                else:
                                                    detected_plates[text]['count'] += 1
                                    else:
                                        # Matrícula muy pequeña
                                        cv2.putText(frame_display, f"Small ({w}x{h})", (px1, py1 - 5),
                                                  cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 165, 255), 1)
                                        continue
                            
                            # Mostrar el label con la matrícula detectada
                            if plate_text and ocr_conf is not None:
                                if ocr_conf >= 0.6:
                                    text_color = (255, 255, 255)
                                    bg_color = (0, 128, 0)
                                elif ocr_conf >= 0.3:
                                    text_color = (0, 255, 255)
                                    bg_color = (0, 128, 128)
                                else:
                                    text_color = (0, 165, 255)
                                    bg_color = (0, 0, 128)
                                
                                label = f"{plate_text} ({ocr_conf:.2f})"
                                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                                cv2.rectangle(frame_display, (px1, py1 - th - 10), (px1 + tw + 6, py1), bg_color, -1)
                                cv2.putText(frame_display, label, (px1 + 3, py1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, text_color, 2)
                            else:
                                # Si no hay texto detectado, mostrar solo confidence del detector
                                label = f"Plate ({plate['confidence']:.2f})"
                                cv2.putText(frame_display, label, (px1, py1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color_plate, 1)
            
            # ========== MOSTRAR STATS Y MODO ACTUAL ==========
            if show_stats:
                overlay = frame_display.copy()
                cv2.rectangle(overlay, (10, 10), (250, 160), (0, 0, 0), -1)
                cv2.addWeighted(overlay, 0.6, frame_display, 0.4, 0, frame_display)
                
                y_offset = 30
                
                # Mostrar modo actual
                mode_color = (0, 255, 0) if use_yolo_mode else (255, 165, 0)
                cv2.putText(frame_display, f"Mode: {current_mode}", (20, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, mode_color, 2)
                y_offset += 25
                
                if show_fps:
                    cv2.putText(frame_display, f"FPS: {int(fps.fps_realtime())}", (20, y_offset), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    y_offset += 25
                
                cv2.putText(frame_display, f"Vehicles: {len(vehicles)}", (20, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                y_offset += 25
                
                if use_yolo_mode:
                    cv2.putText(frame_display, f"Plates: {total_plates}", (20, y_offset), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    y_offset += 25
                    cv2.putText(frame_display, f"Unique: {len(detected_plates)}", (20, y_offset), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    y_offset += 25
                
                # Mostrar instrucciones
                cv2.putText(frame_display, "Press 'M' to switch mode", (20, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
            
            key = None
            if show_window:
                try:
                    cv2.imshow(window_name, frame_display)
                    key = cv2.waitKey(1) & 0xFF
                except cv2.error as e:
                    logger.warning(f"Display disabled (OpenCV GUI not available): {e}")
                    show_window = False
                    key = None
            if key == ord('q'):
                break
            elif key == ord('m') or key == ord('M'):
                # Toggle between YOLO+OCR and SSD Custom modes
                if ssd_available:
                    use_yolo_mode = not use_yolo_mode
                    current_mode = MODE_YOLO_OCR if use_yolo_mode else MODE_SSD_CUSTOM
                    logger.info(f"Switched to mode: {current_mode}")
                    print(f"\n✓ Mode changed to: {current_mode}")
                else:
                    print("✗ SSD model not available, staying in YOLO mode")
            elif key == ord('s'):
                timestamp = int(time.time())
                filename = f"screenshots/screenshot_{timestamp}.jpg"
                cv2.imwrite(filename, frame_display)
                print(f"✓ Screenshot saved: {filename}")
            elif key == ord('r'):
                if plate_reader:
                    plate_reader.reset_history()
                print("✓ OCR history cleared")
    
    except KeyboardInterrupt:
        logger.info("\n[Ctrl+C] Keyboard interrupt received")
    except Exception as e:
        logger.error(f"\nUnexpected error: {e}", exc_info=True)
    
    with LogSection(logger, "Detection summary"):
        if not detected_plates:
            logger.warning("No plates with valid text detected")
        else:
            logger.info(f"Total unique plates detected: {len(detected_plates)}")
            
            sorted_plates = sorted(detected_plates.items(), key=lambda x: x[1]['count'], reverse=True)
            
            table_lines = [
                "",
                "=" * 60,
                f"{'Plate':<15} {'Times':<8} {'Confidence':<12} {'Vehicle'}",
                "-" * 60
            ]
            
            for plate_text, info in sorted_plates[:10]:
                table_lines.append(
                    f"{plate_text:<15} {info['count']:<8} {info['confidence']:<12.2f} {info['vehicle_type']}"
                )
            
            table_lines.extend(["=" * 60, ""])
            logger.info("\n".join(table_lines))
        
        # Show queue statistics
        queue_stats = plate_queue.get_stats()
        logger.info(f"Queue statistics: Sent={queue_stats['sent']}, Failed={queue_stats['failed']}, "
                   f"Pending={queue_stats['pending']}")
    
    with LogSection(logger, "System cleanup"):
        logger.info("Stopping plate queue...")
        plate_queue.stop()
        logger.info("Stopping video stream...")
        vs.stop()
        logger.info("Closing windows...")
        try:
            cv2.destroyAllWindows()
        except cv2.error as e:
            logger.warning(f"OpenCV GUI not available: {e}")
        logger.info("System closed successfully")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger = get_logger("CRAI")
        logger.warning("\n\nInterruption detected - Closing...")
    except Exception as e:
        logger = get_logger("CRAI")
        logger.exception(f"\nError: {e}")
        import traceback
        traceback.print_exc()
