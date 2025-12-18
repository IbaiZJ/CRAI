# Script para ejecutar el video stream demo desde src
Set-Location $PSScriptRoot
$env:PYTHONPATH = (Get-Location).Path
python video\_videostream_demo.py $args
