# 🚀 GUÍA DE INICIO RÁPIDO - 5 MINUTOS

## Paso 1: Instalar Dependencias (2 minutos)

### Windows:
```bash
# Doble clic en:
install.bat

# O desde terminal:
pip install -r requirements.txt
```

### Linux/Mac:
```bash
chmod +x install.sh
./install.sh

# O manualmente:
pip install -r requirements.txt
```

## Paso 2: Verificar Instalación (30 segundos)

```bash
python test_system.py
```

✅ Si ves "TODOS LOS TESTS PASARON CORRECTAMENTE", estás listo!

## Paso 3: Primera Ejecución (1 minuto)

```bash
cd src
python main.py
```

**¡Listo!** Deberías ver tu cámara detectando vehículos en tiempo real.

## Controles

- **Presiona 'q'** para salir y ver estadísticas de FPS
- Si no ves tu cámara, prueba: `python main.py --source 1`

## Problemas Comunes

### ❌ "No se pudo abrir la cámara"
```bash
# Prueba diferentes IDs de cámara
python main.py --source 0
python main.py --source 1
python main.py --source 2
```

### ❌ "Modelo no encontrado"
El modelo se descarga automáticamente la primera vez (6MB).
Espera unos segundos...

### ❌ FPS muy bajo (< 5 FPS)
```bash
# Reduce la resolución
python main.py --resolution 640x480

# O ajusta el umbral
python main.py --confidence 0.7
```

## Siguiente Paso

Lee [YOLO_GUIDE.md](YOLO_GUIDE.md) para opciones avanzadas y configuración para tu presentación.

## Resumen de Comandos

```bash
# Tiempo real con webcam
python main.py

# Procesar un video
python process_video.py --video video.mp4

# Ver ejemplos avanzados
python ejemplos_avanzados.py

# Verificar sistema
python test_system.py
```

---

**¿Funciona?** 🎉 ¡Perfecto! Ya puedes empezar a preparar tu presentación.

**¿No funciona?** Ejecuta `python test_system.py` y copia los errores que veas.
