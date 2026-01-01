"""
Sistema de detección de vehículos en tiempo real usando YOLOv8n.
Integrado con la arquitectura de VideoStream existente.
"""

import cv2
import argparse
import time
from video.video_stream import VideoStream
from video.fps import FPS
from vehicle_detector import VehicleDetector


def main():
    """
    Función principal para ejecutar la detección de vehículos en tiempo real.
    """
    # Configurar argumentos de línea de comandos
    parser = argparse.ArgumentParser(description='Sistema de detección de vehículos en tiempo real')
    parser.add_argument(
        '--source',
        type=int,
        default=0,
        help='ID de la cámara (default: 0)'
    )
    parser.add_argument(
        '--model',
        type=str,
        default='yolov8n.pt',
        help='Ruta al modelo YOLO (default: yolov8n.pt)'
    )
    parser.add_argument(
        '--confidence',
        type=float,
        default=0.5,
        help='Umbral de confianza para detecciones (default: 0.5)'
    )
    parser.add_argument(
        '--no-display',
        action='store_true',
        help='No mostrar ventana de visualización (útil para testing)'
    )
    parser.add_argument(
        '--resolution',
        type=str,
        default='640x480',
        help='Resolución del video (default: 640x480)'
    )
    
    args = parser.parse_args()
    
    # Parsear resolución
    try:
        width, height = map(int, args.resolution.split('x'))
        resolution = (width, height)
    except:
        print("[WARNING] Formato de resolución inválido, usando 640x480")
        resolution = (640, 480)
    
    print("=" * 60)
    print("SISTEMA DE DETECCIÓN DE VEHÍCULOS EN TIEMPO REAL")
    print("=" * 60)
    print(f"Modelo: {args.model}")
    print(f"Fuente de video: {args.source}")
    print(f"Resolución: {resolution[0]}x{resolution[1]}")
    print(f"Umbral de confianza: {args.confidence}")
    print("=" * 60)
    print("\nPresiona 'q' para salir\n")
    
    # Inicializar el detector de vehículos (carga el modelo una sola vez)
    detector = VehicleDetector(
        model_path=args.model,
        confidence_threshold=args.confidence
    )
    
    # Inicializar el stream de video usando nuestra arquitectura existente
    print("\n[INFO] Iniciando stream de video...")
    vs = VideoStream(src=args.source, resolution=resolution).start()
    time.sleep(2.0)  # Permitir que la cámara se caliente
    
    # Inicializar el contador de FPS
    fps = FPS().start()
    
    print("[INFO] Sistema en funcionamiento. Procesando frames...\n")
    
    try:
        # Loop principal
        while True:
            # Leer frame del stream de video
            frame = vs.read()
            
            if frame is None:
                print("[WARNING] No se pudo leer el frame")
                continue
            
            # Procesar el frame con el detector de vehículos
            # Este método retorna el frame con las bounding boxes dibujadas
            processed_frame = detector.process_frame(frame)
            
            # Agregar información de FPS al frame
            fps_text = f"FPS: {fps.fps_realtime():.2f}"
            cv2.putText(
                processed_frame,
                fps_text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (0, 255, 0),
                2
            )
            
            # Mostrar el frame procesado
            if not args.no_display:
                cv2.imshow("Detección de Vehículos - YOLOv8n", processed_frame)
            
            # Actualizar contador de FPS
            fps.update()
            
            # Salir si se presiona 'q'
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("\n[INFO] Tecla 'q' presionada. Saliendo...")
                break
                
    except KeyboardInterrupt:
        print("\n[INFO] Interrupción detectada. Saliendo...")
    
    finally:
        # Detener el contador de FPS y mostrar información
        fps.stop()
        print("\n" + "=" * 60)
        print("ESTADÍSTICAS DE RENDIMIENTO")
        print("=" * 60)
        print(f"Tiempo transcurrido: {fps.elapsed():.2f} segundos")
        print(f"FPS promedio: {fps.fps():.2f}")
        print("=" * 60)
        
        # Limpiar recursos
        print("\n[INFO] Liberando recursos...")
        cv2.destroyAllWindows()
        vs.stop()
        print("[INFO] Sistema detenido correctamente")


if __name__ == '__main__':
    main()
