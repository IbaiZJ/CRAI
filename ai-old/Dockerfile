# Usa una imagen base de Python
FROM python:3.9-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY requirements.txt pyproject.toml ./

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la carpeta `ai`
COPY . .

# Establece el comando por defecto
CMD ["python", "-m", "your_main_module"]