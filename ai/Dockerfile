# Use an image base de Python 3.13 slim
FROM python:3.13-slim

# Set the working directory inside the container
WORKDIR /app

# Set PYTHONPATH to include the working directory
ENV PYTHONPATH=/app

# Copy the files needed to install dependencies
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code from the `ai` folder
COPY . .

# Set the default command
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]