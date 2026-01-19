#!/usr/bin/env python3
"""
🔍 SCRIPT DE DIAGNÓSTICO PARA SSD DETECTOR
============================================

Ejecuta este script para diagnosticar problemas con el detector SSD.

Uso:
    cd ai
    python scripts/diagnose_ssd.py

Este script verifica:
1. Existencia de archivos de modelo
2. Configuración del dataset
3. Distribución de bounding boxes
4. Carga de pesos del modelo
5. Test de inferencia
"""

import os
import sys
import glob
import numpy as np

# Añadir src al path
script_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(os.path.dirname(script_dir), 'src')
sys.path.insert(0, src_dir)

def print_header(title):
    print("\n" + "=" * 80)
    print(f"🔍 {title}")
    print("=" * 80)

def print_ok(msg):
    print(f"   ✅ {msg}")

def print_warn(msg):
    print(f"   ⚠️  {msg}")

def print_error(msg):
    print(f"   ❌ {msg}")

def check_model_files():
    """Verificar existencia de archivos de modelo"""
    print_header("1. ARCHIVOS DE MODELO")
    
    base_dir = os.path.dirname(script_dir)
    locations = [
        os.path.join(base_dir, 'src', 'models'),
        os.path.join(base_dir, 'notebooks', 'models'),
    ]
    
    found_models = []
    for loc in locations:
        if os.path.exists(loc):
            files = os.listdir(loc)
            for f in files:
                if f.endswith(('.keras', '.h5', '.weights.h5')):
                    full_path = os.path.join(loc, f)
                    size_mb = os.path.getsize(full_path) / (1024 * 1024)
                    found_models.append((f, size_mb, full_path))
                    
                    if size_mb > 5:
                        print_ok(f"{f}: {size_mb:.2f} MB")
                    else:
                        print_warn(f"{f}: {size_mb:.2f} MB (muy pequeño, puede estar corrupto)")
    
    if not found_models:
        print_error("No se encontraron archivos de modelo")
        print("   Ubicaciones buscadas:")
        for loc in locations:
            print(f"      - {loc}")
        return False
    
    return True

def check_dataset():
    """Verificar configuración del dataset"""
    print_header("2. CONFIGURACIÓN DEL DATASET")
    
    base_dir = os.path.dirname(script_dir)
    data_yaml = os.path.join(base_dir, 'notebooks', 'UA-DETRAC-DATASET-10K-2', 'data.yaml')
    
    if not os.path.exists(data_yaml):
        print_error(f"data.yaml no encontrado en: {data_yaml}")
        return False
    
    print_ok(f"data.yaml encontrado")
    
    with open(data_yaml, 'r') as f:
        content = f.read()
        print("   Contenido:")
        for line in content.strip().split('\n'):
            print(f"      {line}")
    
    # Extraer número de clases
    import yaml
    with open(data_yaml, 'r') as f:
        data = yaml.safe_load(f)
    
    nc = data.get('nc', 'N/A')
    names = data.get('names', [])
    
    print(f"\n   📊 Clases en dataset: {nc}")
    print(f"   📊 Nombres: {names}")
    
    if nc == 4:
        print_warn("El dataset tiene 4 clases (bus, car, truck, van)")
        print_warn("Si el modelo entrena con NUM_CLASSES=1, perderá información")
    
    return True

def analyze_bbox_distribution():
    """Analizar distribución de bounding boxes"""
    print_header("3. DISTRIBUCIÓN DE BOUNDING BOXES")
    
    base_dir = os.path.dirname(script_dir)
    labels_dir = os.path.join(base_dir, 'notebooks', 'UA-DETRAC-DATASET-10K-2', 'train', 'labels')
    
    if not os.path.exists(labels_dir):
        print_error(f"Labels no encontrados en: {labels_dir}")
        return False
    
    label_files = glob.glob(os.path.join(labels_dir, '*.txt'))[:2000]
    
    if not label_files:
        print_error("No se encontraron archivos de labels")
        return False
    
    print_ok(f"Analizando {len(label_files)} archivos de labels...")
    
    widths, heights, classes = [], [], []
    for lf in label_files:
        with open(lf, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    classes.append(int(parts[0]))
                    widths.append(float(parts[3]))
                    heights.append(float(parts[4]))
    
    if not widths:
        print_error("No se encontraron bounding boxes válidos")
        return False
    
    widths = np.array(widths)
    heights = np.array(heights)
    aspect_ratios = widths / (heights + 1e-6)
    
    print(f"\n   📊 Estadísticas de {len(widths)} bounding boxes:")
    print(f"   ")
    print(f"   Width (normalizado):")
    print(f"      min={widths.min():.4f}, max={widths.max():.4f}")
    print(f"      mean={widths.mean():.4f}, std={widths.std():.4f}")
    print(f"   ")
    print(f"   Height (normalizado):")
    print(f"      min={heights.min():.4f}, max={heights.max():.4f}")
    print(f"      mean={heights.mean():.4f}, std={heights.std():.4f}")
    print(f"   ")
    print(f"   Aspect Ratio (W/H):")
    print(f"      min={aspect_ratios.min():.2f}, max={aspect_ratios.max():.2f}")
    print(f"      mean={aspect_ratios.mean():.2f}, median={np.median(aspect_ratios):.2f}")
    print(f"   ")
    print(f"   Clases encontradas: {set(classes)}")
    print(f"   Distribución de clases:")
    for c in sorted(set(classes)):
        count = classes.count(c)
        pct = count / len(classes) * 100
        class_names = ['bus', 'car', 'truck', 'van']
        name = class_names[c] if c < len(class_names) else f'class_{c}'
        print(f"      {c} ({name}): {count} ({pct:.1f}%)")
    
    # Recomendaciones de anchors
    print(f"\n   📐 RECOMENDACIONES PARA ANCHORS:")
    percentiles = [10, 25, 50, 75, 90]
    print(f"   Width percentiles: {np.percentile(widths, percentiles)}")
    print(f"   Height percentiles: {np.percentile(heights, percentiles)}")
    print(f"   ")
    print(f"   Scales sugeridas:")
    print(f"      Small:  ({np.percentile(widths, 10):.3f}, {np.percentile(widths, 30):.3f})")
    print(f"      Medium: ({np.percentile(widths, 30):.3f}, {np.percentile(widths, 60):.3f})")
    print(f"      Large:  ({np.percentile(widths, 60):.3f}, {np.percentile(widths, 90):.3f})")
    
    return True

def test_model_loading():
    """Probar carga del modelo"""
    print_header("4. TEST DE CARGA DEL MODELO")
    
    try:
        # Suprimir logs de TensorFlow
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
        import tensorflow as tf
        tf.get_logger().setLevel('ERROR')
        
        from detectors.ssd_detector import SSDVehicleDetector
        
        print("   Intentando cargar SSDVehicleDetector...")
        
        detector = SSDVehicleDetector(conf_threshold=0.5)
        
        if detector.available:
            print_ok("Modelo cargado correctamente")
            print(f"   Número de anchors: {len(detector.anchors)}")
            print(f"   Threshold: {detector.conf_threshold}")
            
            # Verificar pesos
            if hasattr(detector.model, 'layers'):
                detection_layers = [l for l in detector.model.layers 
                                   if 'detect' in l.name and 'conv' in l.name]
                
                if detection_layers:
                    weights = detection_layers[0].get_weights()
                    if weights:
                        kernel = weights[0]
                        mean_val = np.mean(np.abs(kernel))
                        std_val = np.std(kernel)
                        
                        print(f"\n   📊 Verificación de pesos de detección:")
                        print(f"      Capa: {detection_layers[0].name}")
                        print(f"      Mean(|weights|): {mean_val:.6f}")
                        print(f"      Std(weights): {std_val:.6f}")
                        
                        if mean_val < 0.01:
                            print_warn("Los pesos parecen muy pequeños (¿no entrenados?)")
                        else:
                            print_ok("Los pesos parecen razonables")
            
            return True
        else:
            print_error("Modelo no disponible después de carga")
            return False
            
    except Exception as e:
        print_error(f"Error al cargar modelo: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_inference():
    """Probar inferencia del modelo"""
    print_header("5. TEST DE INFERENCIA")
    
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
        import tensorflow as tf
        import cv2
        
        from detectors.ssd_detector import SSDVehicleDetector
        
        detector = SSDVehicleDetector(conf_threshold=0.3)
        
        if not detector.available:
            print_error("Modelo no disponible")
            return False
        
        # Crear imagen de prueba (ruido)
        dummy_frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        print("   Ejecutando inferencia en imagen de ruido...")
        detections = detector.detect(dummy_frame)
        
        print(f"   Detecciones en ruido: {len(detections)}")
        
        if len(detections) > 10:
            print_warn(f"MUCHAS detecciones en ruido ({len(detections)}) = modelo no entrenado")
            
            confidences = [d['confidence'] for d in detections]
            mean_conf = np.mean(confidences)
            std_conf = np.std(confidences)
            print(f"   Confianza media: {mean_conf:.3f}")
            print(f"   Confianza std: {std_conf:.3f}")
            
            if 0.45 < mean_conf < 0.65:
                print_error("PATRÓN CONFIRMADO: Confianzas ~0.5 = pesos aleatorios")
                print("   El modelo NO está entrenado. Necesita reentrenamiento.")
        elif len(detections) == 0:
            print_ok("Sin detecciones en ruido (correcto)")
        else:
            print_warn(f"Pocas detecciones ({len(detections)}) - revisar umbral")
        
        # Test con imagen real si existe
        base_dir = os.path.dirname(script_dir)
        test_images = glob.glob(os.path.join(base_dir, 'notebooks', 'UA-DETRAC-DATASET-10K-2', 'train', 'images', '*.jpg'))[:1]
        
        if test_images:
            print(f"\n   Probando con imagen real: {os.path.basename(test_images[0])}")
            real_frame = cv2.imread(test_images[0])
            
            if real_frame is not None:
                detections = detector.detect(real_frame)
                print(f"   Detecciones en imagen real: {len(detections)}")
                
                if detections:
                    for d in detections[:3]:
                        print(f"      - {d['class_name']}: {d['confidence']:.2f}")
        
        return True
        
    except Exception as e:
        print_error(f"Error en inferencia: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "🔧" * 40)
    print("   DIAGNÓSTICO DEL SISTEMA SSD")
    print("🔧" * 40)
    
    results = {
        'model_files': check_model_files(),
        'dataset': check_dataset(),
        'bbox_distribution': analyze_bbox_distribution(),
        'model_loading': test_model_loading(),
        'inference': test_inference(),
    }
    
    print_header("RESUMEN DE DIAGNÓSTICO")
    
    all_ok = True
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {check}: {status}")
        if not passed:
            all_ok = False
    
    if all_ok:
        print("\n   🎉 Todos los checks pasaron")
    else:
        print("\n   ⚠️  Hay problemas que necesitan atención")
        print("\n   PRÓXIMOS PASOS:")
        print("   1. Re-entrenar el modelo con el notebook crai.ipynb")
        print("   2. Asegurar mínimo 50 epochs")
        print("   3. Guardar con celda 'GUARDAR MODELO COMPATIBLE'")
        print("   4. Copiar a ai/src/models/")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
