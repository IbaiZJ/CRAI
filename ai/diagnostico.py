#!/usr/bin/env python3
"""
Script de diagnóstico completo para verificar el estado del sistema.
Ejecuta múltiples checks y genera un reporte detallado.
"""

import sys
import os
import subprocess
import platform

def print_section(title):
    """Imprime una sección con formato."""
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def check_python_version():
    """Verifica la versión de Python."""
    print_section("VERSIÓN DE PYTHON")
    version = sys.version_info
    print(f"Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("⚠️  ADVERTENCIA: Se recomienda Python 3.8 o superior")
        return False
    else:
        print("✅ Versión correcta")
        return True

def check_dependencies():
    """Verifica que las dependencias estén instaladas."""
    print_section("DEPENDENCIAS")
    
    dependencies = {
        'cv2': 'opencv-python',
        'torch': 'torch',
        'ultralytics': 'ultralytics',
        'numpy': 'numpy'
    }
    
    all_ok = True
    for module, package in dependencies.items():
        try:
            __import__(module)
            print(f"✅ {package}: Instalado")
        except ImportError:
            print(f"❌ {package}: NO INSTALADO")
            all_ok = False
    
    return all_ok

def check_gpu():
    """Verifica disponibilidad de GPU."""
    print_section("GPU / CUDA")
    
    try:
        import torch
        
        if torch.cuda.is_available():
            print(f"✅ GPU disponible")
            print(f"   Dispositivo: {torch.cuda.get_device_name(0)}")
            print(f"   CUDA version: {torch.version.cuda}")
            print(f"   Memoria total: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
            return True
        else:
            print("⚠️  GPU no disponible - usando CPU")
            print("   (El sistema funcionará pero más lento)")
            return False
    except Exception as e:
        print(f"❌ Error al verificar GPU: {e}")
        return False

def check_camera():
    """Verifica que la cámara esté disponible."""
    print_section("CÁMARA")
    
    try:
        import cv2
        
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                h, w = frame.shape[:2]
                print(f"✅ Cámara 0 disponible")
                print(f"   Resolución: {w}x{h}")
                cap.release()
                return True
            else:
                print("❌ Cámara 0 abierta pero no puede leer frames")
                cap.release()
                return False
        else:
            print("❌ No se puede abrir cámara 0")
            print("   Verifica que:")
            print("   - La cámara esté conectada")
            print("   - No esté siendo usada por otra app")
            print("   - Tengas permisos de acceso")
            return False
    except Exception as e:
        print(f"❌ Error al verificar cámara: {e}")
        return False

def check_yolo_model():
    """Verifica que el modelo YOLO se pueda cargar."""
    print_section("MODELO YOLO")
    
    try:
        from ultralytics import YOLO
        
        print("⏳ Cargando YOLOv8n...")
        model = YOLO('yolov8n.pt')
        print("✅ Modelo YOLOv8n cargado correctamente")
        print("   (Primera vez puede tardar unos segundos en descargar)")
        return True
    except Exception as e:
        print(f"❌ Error al cargar modelo: {e}")
        return False

def check_vehicle_detector():
    """Verifica que VehicleDetector se pueda importar."""
    print_section("VEHICLE DETECTOR")
    
    # Añadir src al path
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
    
    try:
        from vehicle_detector import VehicleDetector
        print("✅ VehicleDetector importado correctamente")
        
        print("⏳ Inicializando detector...")
        detector = VehicleDetector()
        print("✅ Detector inicializado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error con VehicleDetector: {e}")
        return False

def check_video_stream():
    """Verifica que VideoStream se pueda importar."""
    print_section("VIDEO STREAM")
    
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
    
    try:
        from video.video_stream import VideoStream
        print("✅ VideoStream importado correctamente")
        return True
    except Exception as e:
        print(f"❌ Error con VideoStream: {e}")
        return False

def check_disk_space():
    """Verifica espacio en disco."""
    print_section("ESPACIO EN DISCO")
    
    try:
        if platform.system() == "Windows":
            import shutil
            total, used, free = shutil.disk_usage("/")
        else:
            import shutil
            total, used, free = shutil.disk_usage("/")
        
        free_gb = free / (1024**3)
        print(f"Espacio libre: {free_gb:.2f} GB")
        
        if free_gb < 1:
            print("⚠️  ADVERTENCIA: Poco espacio en disco")
            return False
        else:
            print("✅ Suficiente espacio en disco")
            return True
    except Exception as e:
        print(f"⚠️  No se pudo verificar espacio: {e}")
        return True  # No es crítico

def generate_report():
    """Genera un reporte completo del sistema."""
    print("\n" + "=" * 70)
    print(" DIAGNÓSTICO COMPLETO DEL SISTEMA")
    print(" Sistema de Detección de Vehículos - CRAI")
    print("=" * 70)
    
    print(f"\nSistema operativo: {platform.system()} {platform.release()}")
    print(f"Arquitectura: {platform.machine()}")
    print(f"Procesador: {platform.processor()}")
    
    results = {
        "Python": check_python_version(),
        "Dependencias": check_dependencies(),
        "GPU": check_gpu(),
        "Cámara": check_camera(),
        "Espacio en disco": check_disk_space(),
        "Modelo YOLO": check_yolo_model(),
        "VehicleDetector": check_vehicle_detector(),
        "VideoStream": check_video_stream()
    }
    
    # Resumen final
    print_section("RESUMEN")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\nTests pasados: {passed}/{total}")
    print("\nDetalles:")
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}  {test}")
    
    # Recomendaciones
    print_section("RECOMENDACIONES")
    
    if not results["Dependencias"]:
        print("\n📦 Instalar dependencias:")
        print("   pip install -r requirements.txt")
    
    if not results["GPU"]:
        print("\n⚡ Para mejor rendimiento, considera usar GPU:")
        print("   - Instala CUDA Toolkit")
        print("   - Reinstala PyTorch con soporte CUDA")
    
    if not results["Cámara"]:
        print("\n📹 Problemas con la cámara:")
        print("   - Verifica conexión física")
        print("   - Cierra otras apps usando la cámara")
        print("   - Verifica permisos del sistema")
        print("   - Prueba con --source 1 en el comando")
    
    # Estado final
    print_section("ESTADO FINAL")
    
    if passed == total:
        print("\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!")
        print("\nPuedes ejecutar:")
        print("   cd src")
        print("   python main.py")
    elif passed >= total - 2:
        print("\n⚠️  Sistema mayormente funcional con advertencias menores")
        print("\nPuedes intentar ejecutar:")
        print("   cd src")
        print("   python main.py")
        print("\nPero puede haber problemas de rendimiento o funcionalidad")
    else:
        print("\n❌ Sistema requiere configuración adicional")
        print("\nSigue las recomendaciones arriba antes de ejecutar")
    
    print("\n" + "=" * 70)
    print()

if __name__ == '__main__':
    try:
        generate_report()
    except KeyboardInterrupt:
        print("\n\n⚠️  Diagnóstico interrumpido por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error fatal durante diagnóstico: {e}")
        import traceback
        traceback.print_exc()
