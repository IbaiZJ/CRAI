#!/bin/bash

echo "==========================================="
echo "INSTALACIÓN DE DEPENDENCIAS - YOLO DETECTOR"
echo "==========================================="
echo ""

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "[1/4] Creando entorno virtual..."
    python3 -m venv venv
else
    echo "[1/4] Entorno virtual ya existe"
fi

# Activar entorno virtual
echo "[2/4] Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "[3/4] Instalando dependencias..."
pip install --upgrade pip
pip install -r requirements.txt

# Verificar instalación
echo "[4/4] Verificando instalación..."
python -c "import ultralytics; import torch; import cv2; print('✓ Todas las dependencias instaladas correctamente')"

echo ""
echo "==========================================="
echo "INSTALACIÓN COMPLETADA"
echo "==========================================="
echo ""
echo "Para ejecutar el sistema:"
echo "  1. Activar entorno: source venv/bin/activate"
echo "  2. Ir a src: cd src"
echo "  3. Ejecutar: python main.py"
echo ""
echo "GPU disponible: $(python -c 'import torch; print(torch.cuda.is_available())')"
echo ""
