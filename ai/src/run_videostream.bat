@echo off
cd /d "%~dp0"
set PYTHONPATH=%cd%
py video\_videostream_demo.py %*
