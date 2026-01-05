import logging
import cv2
import os
import time
from video.video_stream import VideoStream
from detectors.vehicle_detector import VehicleDetector
from detectors.plate_detector import PlateDetector
from detectors.ocr import PlateReader
from config.config import Config
from utils.logger import get_logger, LogSection
from utils.terminal import Terminal

def main():
    
    logger = get_logger("CRAI", level=logging.INFO)
    Terminal.start()
    
    with LogSection(logger, "Loading configuration"):
        config = Config("config/config.yaml")
        logger.info(f"Loading from: {config.config_path}")
    
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    with LogSection(logger, "System initialization"):
        # 1. Video Stream
        logger.info("1. Starting camera...")
        camera_source = config.get('camera.source', 1)
        resolution = (config.get('camera.resolution.width', 1280), config.get('camera.resolution.height', 720))

        vs = VideoStream(src=camera_source, resolution=resolution).start()
        logger.info("✓ Camera started successfully")
        
        
        # 2. Vehicle detector
        logger.info("2. Loading vehicle detector...")
        vehicle_model_path = config.get('vehicle_detector.model_path', 'models/yolov8n.pt')
        # Ensure path is relative to script directory
        if not os.path.isabs(vehicle_model_path):
            vehicle_model_path = os.path.join(script_dir, vehicle_model_path)
        
        vehicle_detector = VehicleDetector(
            model_path=vehicle_model_path,
            conf_threshold=config.get('vehicle_detector.confidence_threshold', 0.5)
        )
        
        
        # 3. License plate detector
        logger.info("3. Loading license plate detector...")
        plate_model_path = config.get('plate_detector.model_path', 'models/license_plate_detector.pt')
        if not os.path.isabs(plate_model_path):
            plate_model_path = os.path.join(script_dir, plate_model_path)
        
        plate_detector = PlateDetector(
            model_path=plate_model_path,
            conf_threshold=config.get('plate_detector.confidence_threshold', 0.4)
        )
        
        
        # 4. OCR reader
        logger.info("4. Initializing OCR...")
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
    
    
    # Get additional configurations
    with LogSection(logger, "Parameter configuration"):
        window_name = config.get('display.window_name', 'CRAI - Car Registration AI')
        show_fps = config.get('display.show_fps', True)
        show_stats = config.get('display.show_stats', True)
        debug_mode = config.get('debug.enabled', False)
        debug_output_dir = config.get('debug.debug_output_dir', 'debug_plates')
        min_plate_width = config.get('plate_detector.min_plate_width', 30)
        min_plate_height = config.get('plate_detector.min_plate_height', 15)
        min_text_length = config.get('ocr.min_text_length', 5)
        
        # Colors from configuration
        color_vehicle = tuple(config.get('display.colors.vehicle_box', [0, 255, 0]))
        color_plate = tuple(config.get('display.colors.plate_box', [0, 255, 255]))
        
        logger.info(f"Window: {window_name}")
        logger.info(f"Debug mode: {debug_mode}")
        logger.info(f"OCR available: {ocr_available}")
    
    
    Terminal.print_info()
    logger.info("Starting main loop...")
    
    
    
    
    # ==========================================
    # MAIN LOOP
    # ==========================================
    
    frame_count = 0
    detected_plates = {}  # Cache of detected plates
    
    # Local cache to avoid reprocessing the same plate
    plate_ocr_cache = {}  # bbox_key -> (text, confidence, frame_expiry)
    
    # To calculate FPS
    fps_start_time = time.time()
    fps_frame_count = 0
    current_fps = 0
    
    try:
        while True:
            # Read frame
            frame = vs.read()
            if frame is None:
                continue
            
            frame_count += 1
            fps_frame_count += 1
            frame_display = frame.copy()
            
            # Calculate FPS every second
            if time.time() - fps_start_time >= 1.0:
                current_fps = fps_frame_count
                fps_frame_count = 0
                fps_start_time = time.time()
            
            # Clean expired cache every 100 frames
            if frame_count % 100 == 0:
                expired_keys = [k for k, v in plate_ocr_cache.items() if v[2] < frame_count]
                for k in expired_keys:
                    del plate_ocr_cache[k]
            
            # ==========================================
            # STEP 1: Detect vehicles
            # ==========================================
            vehicles = vehicle_detector.detect(frame)
            
            # ==========================================
            # STEP 2: Detect plates in each vehicle
            # ==========================================
            vehicle_plate_results = []
            
            for vehicle in vehicles:
                vehicle_bbox = vehicle['bbox']
                
                # Detect plates inside vehicle
                plate_detections = plate_detector.detect(frame, vehicle_bbox)
                
                # If plates found, process with OCR
                for plate in plate_detections:
                    plate_img = plate['plate_image']
                    plate_bbox = plate['bbox']
                    
                    # ==========================================
                    # STEP 3: Read plate text (OCR) - REAL TIME
                    # ==========================================
                    if ocr_available and plate_img is not None and plate_img.size > 0:
                        h, w = plate_img.shape[:2]
                        
                        if h > min_plate_height and w > min_plate_width:  # Minimum size from config
                            # Create key based on position (for temporary cache)
                            bbox_key = f"{plate_bbox[0]//20}_{plate_bbox[1]//20}"
                            
                            # Check if we already have result in local cache
                            cached = plate_ocr_cache.get(bbox_key)
                            if cached and cached[2] > frame_count:
                                # Use cached result
                                plate['ocr'] = {
                                    'text': cached[0],
                                    'confidence': cached[1],
                                    'success': len(cached[0]) >= 3,
                                    'cached': True
                                }
                            else:
                                # Do OCR (PlateReader has its own cache)
                                ocr_result = plate_reader.read_plate(plate_img, use_cache=False)
                                
                                # Add to history for voting
                                if ocr_result['success'] and len(ocr_result['text']) >= 4:
                                    plate_reader._history.append(ocr_result['text'])
                                
                                # Get stable reading by voting
                                stable_text = plate_reader.get_stable_reading(min_occurrences=3)
                                if stable_text:
                                    ocr_result['text'] = stable_text
                                    ocr_result['stabilized'] = True
                                
                                plate['ocr'] = ocr_result
                                
                                # Save in local cache for 5 frames (fast for switching between plates)
                                if ocr_result['success']:
                                    plate_ocr_cache[bbox_key] = (
                                        ocr_result['text'],
                                        ocr_result['confidence'],
                                        frame_count + 5
                                    )
                            
                            # Debug: save image if enabled
                            if debug_mode and plate['ocr'].get('success'):
                                os.makedirs(debug_output_dir, exist_ok=True)
                                text = plate['ocr']['text']
                                conf = plate['ocr']['confidence']
                                filename = f"{debug_output_dir}/plate_{frame_count}_{text}_{conf:.2f}.jpg"
                                cv2.imwrite(filename, plate_img)
                                logger.debug(f"Saved: {filename} - Size: {w}x{h}")
                        else:
                            plate['ocr'] = {'text': 'TOO_SMALL', 'confidence': 0.0, 'success': False}
                    else:
                        plate['ocr'] = {'text': 'NO_OCR', 'confidence': 0.0, 'success': False}
                # Save in cache only stabilized readings
                if (plate['ocr']['success'] and 
                        plate['ocr'].get('stabilized', False) and
                        len(plate['ocr']['text']) >= min_text_length):
                        plate_text = plate['ocr']['text']
                        if plate_text not in detected_plates:
                            detected_plates[plate_text] = {
                                'count': 1,
                                'confidence': plate['ocr']['confidence'],
                                'vehicle_type': vehicle['class_name']
                            }
                        else:
                            detected_plates[plate_text]['count'] += 1
                
                if plate_detections:
                    vehicle_plate_results.append((vehicle, plate_detections))
            # ==========================================
            # VISUALIZATION
            # ==========================================
            
            # Draw vehicles
            for vehicle in vehicles:
                x1, y1, x2, y2 = vehicle['bbox']
                cv2.rectangle(frame_display, (x1, y1), (x2, y2), color_vehicle, 2)
                
                label = f"{vehicle['class_name']}: {vehicle['confidence']:.2f}"
                cv2.putText(frame_display, label, (x1, y1 - 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_vehicle, 2)
            
            # Draw plates and OCR text
            for vehicle, plates in vehicle_plate_results:
                for plate in plates:
                    px1, py1, px2, py2 = plate['bbox']
                    
                    # Plate rectangle
                    cv2.rectangle(frame_display, (px1, py1), (px2, py2), color_plate, 2)
                    
                    # OCR text
                    if plate['ocr']['success'] and plate['ocr']['text']:
                        text = plate['ocr']['text']
                        conf = plate['ocr']['confidence']
                        is_stable = plate['ocr'].get('stabilized', False)
                        
                        # Color based on stabilization and confidence
                        if is_stable:
                            color = (255, 255, 255)  # White (stabilized)
                            bg_color = (0, 180, 0)   # Bright green
                            label = f"✓ {text}"
                        elif conf >= 0.6:
                            color = (255, 255, 255)  # White (high confidence)
                            bg_color = (0, 128, 0)   # Dark green
                            label = f"{text} ({conf:.2f})"
                        elif conf >= 0.3:
                            color = (0, 255, 255)    # Yellow (medium confidence)
                            bg_color = (0, 128, 128) # Dark
                            label = f"{text} ({conf:.2f})"
                        else:
                            color = (0, 165, 255)    # Orange (low confidence)
                            bg_color = (0, 0, 128)   # Dark red
                            label = f"{text} ({conf:.2f})"
                        
                        # Background for text
                        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                        cv2.rectangle(frame_display, (px1, py1 - th - 10), 
                                     (px1 + tw + 6, py1), bg_color, -1)
                        
                        # Text (larger if stabilized)
                        font_scale = 0.7 if is_stable else 0.6
                        cv2.putText(frame_display, label, (px1 + 3, py1 - 5),
                                   cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, 2)
                                   
                    elif plate['ocr']['text'] == 'TOO_SMALL':
                        # Show image size
                        h, w = plate['plate_image'].shape[:2]
                        cv2.putText(frame_display, f"Small ({w}x{h})", (px1, py1 - 5),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 165, 255), 1)
                    else:
                        cv2.putText(frame_display, "Processing...", (px1, py1 - 5),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            
            # ==========================================
            # ON-SCREEN INFO
            # ==========================================
            
            if show_stats:
                # Information panel (semi-transparent background)
                overlay = frame_display.copy()
                cv2.rectangle(overlay, (10, 10), (400, 140), (0, 0, 0), -1)
                cv2.addWeighted(overlay, 0.6, frame_display, 0.4, 0, frame_display)
                
                # Statistics
                info_lines = [
                    f"FPS: {current_fps}" if show_fps else None,
                    f"Frame: {frame_count}",
                    f"Vehicles: {len(vehicles)}",
                    f"Plates: {sum(len(plates) for _, plates in vehicle_plate_results)}",
                    f"Unique: {len(detected_plates)}"
                ]
                
                y_offset = 30
                for line in info_lines:
                    if line:
                        cv2.putText(frame_display, line, (20, y_offset),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                        y_offset += 25
            
            # ==========================================
            # SHOW FRAME
            # ==========================================
            
            cv2.imshow(window_name, frame_display)
            
            # ==========================================
            # CONTROLS
            # ==========================================
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Save screenshot
                filename = f"screenshot_{frame_count}.jpg"
                cv2.imwrite(filename, frame_display)
                print(f"✓ Screenshot saved: {filename}")
            elif key == ord('d'):
                # Toggle debug mode
                debug_mode = not debug_mode
                config.set('debug.enabled', debug_mode)
                print(f"{'✓' if debug_mode else '✗'} Debug mode: {'ENABLED' if debug_mode else 'DISABLED'}")
            elif key == ord('r'):
                # Reset cache
                plate_ocr_cache.clear()
                if plate_reader:
                    plate_reader.reset_history()
                print("✓ OCR cache cleared")
            elif key == ord('c'):
                # Show current configuration
                config.print_config()
    
    except KeyboardInterrupt:
        logger.info("\n[Ctrl+C] Keyboard interrupt received")
    except Exception as e:
        logger.error(f"\nUnexpected error: {e}", exc_info=True)
    
    # ==========================================
    # FINAL SUMMARY
    # ==========================================
    
    with LogSection(logger, "Detection summary"):
        if detected_plates:
            logger.info(f"Total unique plates detected: {len(detected_plates)}")
            
            # Sort by number of detections
            sorted_plates = sorted(detected_plates.items(), 
                                  key=lambda x: x[1]['count'], 
                                  reverse=True)
            
            # Build table as a single string
            table_lines = []
            table_lines.append("")
            table_lines.append("=" * 60)
            table_lines.append(f"{'Plate':<15} {'Times':<8} {'Confidence':<12} {'Vehicle'}")
            table_lines.append("-" * 60)
            
            for plate_text, info in sorted_plates[:10]:  # Top 10
                table_lines.append(
                    f"{plate_text:<15} {info['count']:<8} "
                    f"{info['confidence']:<12.2f} {info['vehicle_type']}"
                )
            
            table_lines.append("=" * 60)
            table_lines.append("")
            
            # Print entire table as one block
            logger.info("\n".join(table_lines))
        else:
            logger.warning("No plates with valid text detected")
    
    # ==========================================
    # CLEANUP
    # ==========================================
    
    with LogSection(logger, "System cleanup"):
        logger.info("Stopping video stream...")
        vs.stop()
        logger.info("Closing windows...")
        cv2.destroyAllWindows()
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