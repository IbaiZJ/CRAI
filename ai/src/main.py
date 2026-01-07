import logging
import cv2
import os
import time
from video.video_stream import VideoStream
from video.fps import FPS
from detectors.vehicle_detector import VehicleDetector
from detectors.plate_detector import PlateDetector
from detectors.ocr import PlateReader
from config.config import Config
from utils.logger import get_logger, LogSection
from utils.terminal import Terminal


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
        auto_find = config.get('camera.auto_find', True)
        resolution = (config.get('camera.resolution.width', 1280), config.get('camera.resolution.height', 720))
        vs = VideoStream(src=camera_source, resolution=resolution, auto_find=auto_find).start()
        logger.info("✓ Camera started successfully")
        
        logger.info("2. Loading vehicle detector...")
        vehicle_model_path = config.get('vehicle_detector.model_path', 'models/yolov8n.pt')
        if not os.path.isabs(vehicle_model_path):
            vehicle_model_path = os.path.join(dir, vehicle_model_path)
        vehicle_detector = VehicleDetector(
            model_path=vehicle_model_path,
            conf_threshold=config.get('vehicle_detector.confidence_threshold', 0.5)
        )
        
        logger.info("3. Loading license plate detector...")
        plate_model_path = config.get('plate_detector.model_path', 'models/license_plate_detector.pt')
        if not os.path.isabs(plate_model_path):
            plate_model_path = os.path.join(dir, plate_model_path)
        plate_detector = PlateDetector(
            model_path=plate_model_path,
            conf_threshold=config.get('plate_detector.confidence_threshold', 0.4)
        )
        
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
    
    with LogSection(logger, "Parameter configuration"):
        window_name = config.get('display.window_name', 'CRAI - Car Registration AI')
        show_fps = config.get('display.show_fps', True)
        show_stats = config.get('display.show_stats', True)
        min_plate_width = config.get('plate_detector.min_plate_width', 30)
        min_plate_height = config.get('plate_detector.min_plate_height', 15)
        min_text_length = config.get('ocr.min_text_length', 5)
        color_vehicle = tuple(config.get('display.colors.vehicle_box', [0, 255, 0]))
        color_plate = tuple(config.get('display.colors.plate_box', [0, 255, 255]))
        
        logger.info(f"Window: {window_name}")
        logger.info(f"OCR available: {ocr_available}")
    
    Terminal.print_info()
    logger.info("Starting main loop...")
    
    detected_plates = {}
    fps = FPS().start()
    
    try:
        while True:
            frame = vs.read()
            if frame is None:
                continue
            
            fps.update()
            vehicles = vehicle_detector.detect(frame)
            
            if not vehicles:
                cv2.imshow(window_name, frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                continue
            
            frame_display = frame.copy()
            total_plates = 0
            
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
                    
                    if ocr_available:
                        plate_img = plate['plate_image']
                        if plate_img is not None and plate_img.size > 0:
                            h, w = plate_img.shape[:2]
                            
                            if h > min_plate_height and w > min_plate_width:
                                ocr_result = plate_reader.read_plate(plate_img)
                                
                                if ocr_result['success']:
                                    text = ocr_result['text']
                                    conf = ocr_result['confidence']
                                    
                                    if len(text) >= min_text_length:
                                        if text not in detected_plates:
                                            detected_plates[text] = {
                                                'count': 1,
                                                'confidence': conf,
                                                'vehicle_type': vehicle['class_name']
                                            }
                                        else:
                                            detected_plates[text]['count'] += 1
                                    
                                    if conf >= 0.6:
                                        color = (255, 255, 255)
                                        bg_color = (0, 128, 0)
                                    elif conf >= 0.3:
                                        color = (0, 255, 255)
                                        bg_color = (0, 128, 128)
                                    else:
                                        color = (0, 165, 255)
                                        bg_color = (0, 0, 128)
                                    
                                    label = f"{text} ({conf:.2f})"
                                    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                                    cv2.rectangle(frame_display, (px1, py1 - th - 10), (px1 + tw + 6, py1), bg_color, -1)
                                    cv2.putText(frame_display, label, (px1 + 3, py1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                            else:
                                cv2.putText(frame_display, f"Small ({w}x{h})", (px1, py1 - 5),
                                          cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 165, 255), 1)
            
            if show_stats:
                overlay = frame_display.copy()
                cv2.rectangle(overlay, (10, 10), (400, 110), (0, 0, 0), -1)
                cv2.addWeighted(overlay, 0.6, frame_display, 0.4, 0, frame_display)
                
                y_offset = 30
                if show_fps:
                    cv2.putText(frame_display, f"FPS: {int(fps.fps_realtime())}", (20, y_offset), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    y_offset += 25
                
                cv2.putText(frame_display, f"Vehicles: {len(vehicles)}", (20, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                y_offset += 25
                cv2.putText(frame_display, f"Plates: {total_plates}", (20, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                y_offset += 25
                cv2.putText(frame_display, f"Unique: {len(detected_plates)}", (20, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            cv2.imshow(window_name, frame_display)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
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