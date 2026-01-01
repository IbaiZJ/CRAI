"""
Ejemplos avanzados de uso del VehicleDetector.
Demuestra diferentes casos de uso y configuraciones.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import cv2
import time
from vehicle_detector import VehicleDetector
from video.video_stream import VideoStream


def ejemplo_1_basico():
    """
    Ejemplo 1: Uso básico con cámara web.
    El caso más simple para empezar.
    """
    print("\n" + "=" * 60)
    print("EJEMPLO 1: USO BÁSICO")
    print("=" * 60)
    
    # Inicializar detector
    detector = VehicleDetector()
    
    # Inicializar video stream
    vs = VideoStream(src=0).start()
    time.sleep(2.0)
    
    print("[INFO] Presiona 'q' para salir")
    
    while True:
        frame = vs.read()
        processed_frame = detector.process_frame(frame)
        
        cv2.imshow("Ejemplo 1 - Básico", processed_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    vs.stop()
    cv2.destroyAllWindows()


def ejemplo_2_detecciones_sin_dibujo():
    """
    Ejemplo 2: Obtener detecciones sin dibujar en el frame.
    Útil para análisis de datos o lógica personalizada.
    """
    print("\n" + "=" * 60)
    print("EJEMPLO 2: OBTENER DETECCIONES SIN DIBUJAR")
    print("=" * 60)
    
    detector = VehicleDetector(confidence_threshold=0.6)
    vs = VideoStream(src=0).start()
    time.sleep(2.0)
    
    print("[INFO] Mostrando coordenadas de detecciones en consola")
    print("[INFO] Presiona 'q' para salir")
    
    frame_count = 0
    
    while True:
        frame = vs.read()
        
        # Obtener lista de detecciones
        detections = detector.get_detections(frame)
        
        # Procesar detecciones
        if detections:
            frame_count += 1
            print(f"\n--- Frame {frame_count} ---")
            for i, det in enumerate(detections, 1):
                x1, y1, x2, y2 = det['bbox']
                conf = det['confidence']
                cls = det['class']
                print(f"  Detección {i}: {cls} ({conf:.2f}) en [{x1}, {y1}, {x2}, {y2}]")
        
        # Mostrar frame original (sin anotaciones)
        cv2.imshow("Ejemplo 2 - Frame Original", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    vs.stop()
    cv2.destroyAllWindows()


def ejemplo_3_contador_vehiculos():
    """
    Ejemplo 3: Contador de vehículos por tipo.
    Cuenta cuántos vehículos de cada tipo se detectan.
    """
    print("\n" + "=" * 60)
    print("EJEMPLO 3: CONTADOR DE VEHÍCULOS POR TIPO")
    print("=" * 60)
    
    detector = VehicleDetector(confidence_threshold=0.6)
    vs = VideoStream(src=0).start()
    time.sleep(2.0)
    
    # Contadores
    counters = {
        'car': 0,
        'motorcycle': 0,
        'bus': 0,
        'truck': 0
    }
    
    print("[INFO] Contando vehículos detectados")
    print("[INFO] Presiona 'q' para salir y ver estadísticas")
    
    while True:
        frame = vs.read()
        detections = detector.get_detections(frame)
        
        # Contar detecciones
        for det in detections:
            counters[det['class']] += 1
        
        # Dibujar frame procesado
        processed_frame = detector.process_frame(frame)
        
        # Agregar información de contadores al frame
        y_offset = 60
        for vehicle_type, count in counters.items():
            text = f"{vehicle_type}: {count}"
            cv2.putText(
                processed_frame,
                text,
                (10, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )
            y_offset += 30
        
        cv2.imshow("Ejemplo 3 - Contador", processed_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    vs.stop()
    cv2.destroyAllWindows()
    
    # Mostrar estadísticas finales
    print("\n" + "=" * 60)
    print("ESTADÍSTICAS DE DETECCIÓN")
    print("=" * 60)
    total = sum(counters.values())
    print(f"Total de detecciones: {total}")
    for vehicle_type, count in counters.items():
        percentage = (count / total * 100) if total > 0 else 0
        print(f"  {vehicle_type.capitalize()}: {count} ({percentage:.1f}%)")
    print("=" * 60)


def ejemplo_4_zona_de_interes():
    """
    Ejemplo 4: Detección solo en una zona de interés (ROI).
    Ignora vehículos fuera de la zona especificada.
    """
    print("\n" + "=" * 60)
    print("EJEMPLO 4: ZONA DE INTERÉS (ROI)")
    print("=" * 60)
    
    detector = VehicleDetector(confidence_threshold=0.5)
    vs = VideoStream(src=0).start()
    time.sleep(2.0)
    
    # Definir zona de interés (centro de la imagen)
    # Formato: (x1, y1, x2, y2)
    roi = None
    
    print("[INFO] Haz clic y arrastra para definir la zona de interés")
    print("[INFO] Presiona 'q' para salir")
    
    drawing = False
    start_point = None
    
    def mouse_callback(event, x, y, flags, param):
        nonlocal roi, drawing, start_point
        
        if event == cv2.EVENT_LBUTTONDOWN:
            drawing = True
            start_point = (x, y)
        
        elif event == cv2.EVENT_LBUTTONUP:
            drawing = False
            roi = (min(start_point[0], x), min(start_point[1], y),
                   max(start_point[0], x), max(start_point[1], y))
            print(f"[INFO] ROI definido: {roi}")
    
    cv2.namedWindow("Ejemplo 4 - ROI")
    cv2.setMouseCallback("Ejemplo 4 - ROI", mouse_callback)
    
    while True:
        frame = vs.read()
        detections = detector.get_detections(frame)
        
        # Filtrar detecciones dentro del ROI
        if roi:
            filtered_detections = []
            for det in detections:
                x1, y1, x2, y2 = det['bbox']
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2
                
                # Verificar si el centro está dentro del ROI
                if (roi[0] <= center_x <= roi[2] and 
                    roi[1] <= center_y <= roi[3]):
                    filtered_detections.append(det)
            
            # Dibujar solo detecciones filtradas
            display_frame = frame.copy()
            for det in filtered_detections:
                x1, y1, x2, y2 = det['bbox']
                cv2.rectangle(display_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{det['class']}: {det['confidence']:.2f}"
                cv2.putText(display_frame, label, (x1, y1-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # Dibujar ROI
            cv2.rectangle(display_frame, (roi[0], roi[1]), (roi[2], roi[3]),
                         (0, 0, 255), 2)
            cv2.putText(display_frame, f"ROI - {len(filtered_detections)} vehiculos",
                       (roi[0], roi[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                       (0, 0, 255), 2)
        else:
            display_frame = detector.process_frame(frame)
            cv2.putText(display_frame, "Dibuja un rectangulo para definir ROI",
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        cv2.imshow("Ejemplo 4 - ROI", display_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    vs.stop()
    cv2.destroyAllWindows()


def ejemplo_5_comparacion_modelos():
    """
    Ejemplo 5: Comparar diferentes modelos de YOLO.
    Muestra la diferencia entre nano, small y medium.
    """
    print("\n" + "=" * 60)
    print("EJEMPLO 5: COMPARACIÓN DE MODELOS")
    print("=" * 60)
    print("\n[ADVERTENCIA] Este ejemplo requiere descargar múltiples modelos")
    print("¿Continuar? (s/n): ", end='')
    
    if input().strip().lower() != 's':
        print("Ejemplo omitido.")
        return
    
    # Inicializar detectores con diferentes modelos
    print("\n[INFO] Cargando modelos...")
    detectors = {
        'YOLOv8n (nano)': VehicleDetector('yolov8n.pt'),
        'YOLOv8s (small)': VehicleDetector('yolov8s.pt'),
    }
    
    vs = VideoStream(src=0).start()
    time.sleep(2.0)
    
    print("[INFO] Presiona '1' para nano, '2' para small, 'q' para salir")
    
    current_model = 'YOLOv8n (nano)'
    
    while True:
        frame = vs.read()
        
        # Procesar con el modelo actual
        start_time = time.time()
        processed_frame = detectors[current_model].process_frame(frame)
        inference_time = (time.time() - start_time) * 1000  # ms
        
        # Mostrar información del modelo
        cv2.putText(
            processed_frame,
            f"Modelo: {current_model}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )
        cv2.putText(
            processed_frame,
            f"Tiempo: {inference_time:.1f}ms ({1000/inference_time:.1f} FPS)",
            (10, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )
        
        cv2.imshow("Ejemplo 5 - Comparación", processed_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('1'):
            current_model = 'YOLOv8n (nano)'
            print(f"[INFO] Cambiado a {current_model}")
        elif key == ord('2'):
            current_model = 'YOLOv8s (small)'
            print(f"[INFO] Cambiado a {current_model}")
        elif key == ord('q'):
            break
    
    vs.stop()
    cv2.destroyAllWindows()


def menu_principal():
    """Menú interactivo para elegir ejemplos."""
    
    ejemplos = {
        '1': ('Uso Básico', ejemplo_1_basico),
        '2': ('Obtener Detecciones Sin Dibujar', ejemplo_2_detecciones_sin_dibujo),
        '3': ('Contador de Vehículos', ejemplo_3_contador_vehiculos),
        '4': ('Zona de Interés (ROI)', ejemplo_4_zona_de_interes),
        '5': ('Comparación de Modelos', ejemplo_5_comparacion_modelos),
    }
    
    while True:
        print("\n" + "=" * 60)
        print("EJEMPLOS DE USO - VEHICLE DETECTOR")
        print("=" * 60)
        
        for key, (nombre, _) in ejemplos.items():
            print(f"  {key}. {nombre}")
        
        print("  0. Salir")
        print("=" * 60)
        print("\nElige un ejemplo: ", end='')
        
        opcion = input().strip()
        
        if opcion == '0':
            print("\n¡Hasta luego!")
            break
        elif opcion in ejemplos:
            _, funcion = ejemplos[opcion]
            try:
                funcion()
            except KeyboardInterrupt:
                print("\n[INFO] Ejemplo interrumpido por el usuario")
            except Exception as e:
                print(f"\n[ERROR] {e}")
        else:
            print("\n[ERROR] Opción inválida")


if __name__ == '__main__':
    menu_principal()
