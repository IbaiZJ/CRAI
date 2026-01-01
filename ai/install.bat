@echo off
echo ===========================================
echo INSTALACIÓN DE DEPENDENCIAS - YOLO DETECTOR
echo ===========================================
echo.

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo [1/4] Creando entorno virtual...
    python -m venv venv
) else (
    echo [1/4] Entorno virtual ya existe
)

REM Activar entorno virtual
echo [2/4] Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo [3/4] Instalando dependencias...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Verificar instalación
echo [4/4] Verificando instalación...
python -c "import ultralytics; import torch; import cv2; print('✓ Todas las dependencias instaladas correctamente')"

echo.
echo ===========================================
echo INSTALACIÓN COMPLETADA
echo ===========================================
echo.
echo Para ejecutar el sistema:
echo   1. Activar entorno: venv\Scripts\activate
echo   2. Ir a src: cd src
echo   3. Ejecutar: python main.py
echo.
python -c "import torch; print('GPU disponible:', torch.cuda.is_available())"
echo.
pause
