"""
Script de prueba rápida para verificar que el VehicleDetector funciona correctamente.
Crea una imagen de prueba y verifica que YOLO se inicialice correctamente.
"""

import sys
import os

# Añadir el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import numpy as np
import cv2
from vehicle_detector import VehicleDetector


def test_installation():
    """Prueba la instalación y configuración básica."""
    
    print("=" * 60)
    print("TEST DE INSTALACIÓN - VEHICLE DETECTOR")
    print("=" * 60)
    
    # Test 1: Importaciones
    print("\n[TEST 1/4] Verificando importaciones...")
    try:
        import ultralytics
        import torch
        import cv2
        print("✓ Todas las librerías importadas correctamente")
    except ImportError as e:
        print(f"✗ Error de importación: {e}")
        return False
    
    # Test 2: Detección de GPU
    print("\n[TEST 2/4] Verificando disponibilidad de GPU...")
    import torch
    if torch.cuda.is_available():
        print(f"✓ GPU detectada: {torch.cuda.get_device_name(0)}")
        print(f"  Memoria disponible: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    else:
        print("⚠ No se detectó GPU - usando CPU (más lento pero funcional)")
    
    # Test 3: Inicialización del detector
    print("\n[TEST 3/4] Inicializando VehicleDetector...")
    try:
        detector = VehicleDetector(
            model_path='yolov8n.pt',
            confidence_threshold=0.5
        )
        print("✓ VehicleDetector inicializado correctamente")
    except Exception as e:
        print(f"✗ Error al inicializar detector: {e}")
        return False
    
    # Test 4: Procesamiento de imagen de prueba
    print("\n[TEST 4/4] Probando procesamiento de frame...")
    try:
        # Crear imagen de prueba (640x480, fondo negro)
        test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Dibujar un rectángulo simulando un coche
        cv2.rectangle(test_frame, (200, 200), (400, 350), (100, 100, 100), -1)
        
        # Procesar frame
        result = detector.process_frame(test_frame)
        
        if result is not None and result.shape == test_frame.shape:
            print("✓ Frame procesado correctamente")
        else:
            print("✗ Error en el procesamiento del frame")
            return False
            
    except Exception as e:
        print(f"✗ Error al procesar frame: {e}")
        return False
    
    # Test exitoso
    print("\n" + "=" * 60)
    print("✅ TODOS LOS TESTS PASARON CORRECTAMENTE")
    print("=" * 60)
    print("\nEl sistema está listo para usar.")
    print("\nPara ejecutar la detección en tiempo real:")
    print("  cd src")
    print("  python main.py")
    print("")
    
    return True


def test_camera():
    """Prueba rápida de la cámara."""
    print("\n" + "=" * 60)
    print("TEST DE CÁMARA (OPCIONAL)")
    print("=" * 60)
    print("\n¿Deseas probar la cámara? (s/n): ", end='')
    
    response = input().strip().lower()
    if response != 's':
        print("Test de cámara omitido.")
        return
    
    print("\n[INFO] Intentando abrir la cámara...")
    print("[INFO] Presiona 'q' para cerrar")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("✗ No se pudo abrir la cámara")
        print("  Verifica que:")
        print("  - La cámara esté conectada")
        print("  - No esté siendo usada por otra aplicación")
        print("  - Tengas permisos de acceso")
        return
    
    print("✓ Cámara abierta correctamente")
    print("[INFO] Mostrando vista previa...")
    
    for _ in range(30):  # Mostrar 30 frames
        ret, frame = cap.read()
        if ret:
            cv2.putText(
                frame,
                "Test de Camara - Presiona 'q' para salir",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )
            cv2.imshow("Test de Cámara", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    
    cap.release()
    cv2.destroyAllWindows()
    print("✓ Test de cámara completado")


if __name__ == '__main__':
    success = test_installation()
    
    if success:
        test_camera()
    else:
        print("\n⚠ Se encontraron errores. Por favor:")
        print("  1. Verifica que hayas ejecutado: pip install -r requirements.txt")
        print("  2. Revisa los mensajes de error arriba")
        print("  3. Intenta reinstalar las dependencias")
