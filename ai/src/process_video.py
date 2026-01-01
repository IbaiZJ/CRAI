"""
Script de ejemplo para demostrar el uso del VehicleDetector con video de archivo.
Útil para testing sin necesidad de cámara en vivo.
"""

import cv2
import argparse
import time
from vehicle_detector import VehicleDetector
from video.fps import FPS


def main():
    parser = argparse.ArgumentParser(description='Detección de vehículos en video de archivo')
    parser.add_argument(
        '--video',
        type=str,
        required=True,
        help='Ruta al archivo de video'
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
        help='Umbral de confianza (default: 0.5)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Ruta para guardar el video procesado (opcional)'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("DETECCIÓN DE VEHÍCULOS EN VIDEO DE ARCHIVO")
    print("=" * 60)
    print(f"Video de entrada: {args.video}")
    print(f"Modelo: {args.model}")
    print(f"Umbral de confianza: {args.confidence}")
    if args.output:
        print(f"Video de salida: {args.output}")
    print("=" * 60)
    print("\nPresiona 'q' para salir\n")
    
    # Inicializar detector
    detector = VehicleDetector(
        model_path=args.model,
        confidence_threshold=args.confidence
    )
    
    # Abrir video
    cap = cv2.VideoCapture(args.video)
    
    if not cap.isOpened():
        print(f"[ERROR] No se pudo abrir el video: {args.video}")
        return
    
    # Obtener propiedades del video
    fps_video = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"[INFO] Video: {width}x{height} @ {fps_video} FPS")
    print(f"[INFO] Total de frames: {total_frames}\n")
    
    # Configurar writer si se especificó output
    writer = None
    if args.output:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(args.output, fourcc, fps_video, (width, height))
        print(f"[INFO] Guardando video procesado en: {args.output}")
    
    # Inicializar contador de FPS
    fps = FPS().start()
    frame_count = 0
    
    print("[INFO] Procesando video...\n")
    
    try:
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print("\n[INFO] Fin del video alcanzado")
                break
            
            frame_count += 1
            
            # Procesar frame con el detector
            processed_frame = detector.process_frame(frame)
            
            # Agregar información al frame
            info_text = f"Frame: {frame_count}/{total_frames} | FPS: {fps.fps_realtime():.2f}"
            cv2.putText(
                processed_frame,
                info_text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )
            
            # Guardar frame si se especificó output
            if writer:
                writer.write(processed_frame)
            
            # Mostrar frame
            cv2.imshow("Detección de Vehículos - Video", processed_frame)
            
            # Actualizar FPS
            fps.update()
            
            # Salir si se presiona 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n[INFO] Interrupción por usuario")
                break
                
    except KeyboardInterrupt:
        print("\n[INFO] Interrupción detectada")
    
    finally:
        # Estadísticas finales
        fps.stop()
        print("\n" + "=" * 60)
        print("ESTADÍSTICAS DE PROCESAMIENTO")
        print("=" * 60)
        print(f"Frames procesados: {frame_count}/{total_frames}")
        print(f"Tiempo transcurrido: {fps.elapsed():.2f} segundos")
        print(f"FPS de procesamiento: {fps.fps():.2f}")
        print("=" * 60)
        
        # Limpiar recursos
        cap.release()
        if writer:
            writer.release()
        cv2.destroyAllWindows()
        print("\n[INFO] Recursos liberados correctamente")


if __name__ == '__main__':
    main()
