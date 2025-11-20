# Tests para CRAI API

Este directorio contiene todos los tests para la API de FastAPI del proyecto CRAI.

## Estructura

```
tests/
├── __init__.py
├── conftest.py              # Fixtures compartidos
├── pytest.ini               # Configuración de pytest (en raíz de ai/)
├── README.md               # Este archivo
└── api/
    ├── __init__.py
    ├── test_main.py        # Tests de la aplicación principal
    └── test_router.py      # Tests de los routers
```

## Instalación de dependencias

Primero, asegúrate de tener instaladas todas las dependencias:

```bash
pip install -r requirements.txt
```

Esto instalará:
- `pytest`: Framework de testing
- `pytest-cov`: Plugin para cobertura de código
- `pytest-asyncio`: Soporte para tests asíncronos
- `httpx`: Cliente HTTP usado por TestClient de FastAPI

## Ejecutar los tests

### Ejecutar todos los tests
```bash
cd ai
pytest
```

### Ejecutar con salida detallada
```bash
pytest -v
```

### Ejecutar tests específicos
```bash
# Un archivo específico
pytest tests/api/test_main.py

# Una clase específica
pytest tests/api/test_main.py::TestMainApp

# Un test específico
pytest tests/api/test_main.py::TestMainApp::test_app_exists
```

### Ejecutar tests por markers
```bash
# Solo tests de API
pytest -m api

# Solo tests unitarios
pytest -m unit

# Excluir tests lentos
pytest -m "not slow"
```

## Cobertura de código

### Ver cobertura en terminal
```bash
pytest --cov=api --cov-report=term-missing
```

### Generar reporte HTML
```bash
pytest --cov=api --cov-report=html
```
El reporte se generará en `htmlcov/index.html`

### Ver solo archivos con baja cobertura
```bash
pytest --cov=api --cov-report=term-missing --cov-fail-under=80
```

## Ejecutar tests en modo watch

Para ejecutar tests automáticamente cuando cambies archivos:

```bash
pip install pytest-watch
ptw
```

## Escribir nuevos tests

### Estructura básica de un test

```python
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_mi_endpoint():
    """Descripción del test"""
    response = client.get("/api/mi-endpoint")
    assert response.status_code == 200
    assert response.json() == {"key": "value"}
```

### Usando fixtures

```python
def test_con_fixture(test_client):
    """Usa el fixture test_client de conftest.py"""
    response = test_client.get("/api/hello")
    assert response.status_code == 200
```

### Marcar tests

```python
@pytest.mark.slow
def test_operacion_lenta():
    # Test que tarda mucho tiempo
    pass

@pytest.mark.integration
def test_integracion():
    # Test de integración
    pass
```

## Convenciones

1. **Nombres de archivos**: `test_*.py`
2. **Nombres de clases**: `Test*`
3. **Nombres de funciones**: `test_*`
4. **Docstrings**: Cada test debe tener un docstring explicativo
5. **Organización**: Agrupar tests relacionados en clases

## Tests actuales

### `test_main.py`
- ✅ Tests de la aplicación principal
- ✅ Tests de endpoints de salud
- ✅ Tests de métodos HTTP

### `test_router.py`
- ✅ Tests de endpoints del router
- ✅ Tests de configuración del router
- ✅ Tests de documentación (OpenAPI, Swagger, ReDoc)

## Comandos útiles

```bash
# Ejecutar y detener en el primer fallo
pytest -x

# Ejecutar los últimos tests que fallaron
pytest --lf

# Ejecutar solo tests que fallaron, luego el resto
pytest --ff

# Mostrar las 10 pruebas más lentas
pytest --durations=10

# Ejecutar en paralelo (requiere pytest-xdist)
pip install pytest-xdist
pytest -n auto
```

## CI/CD

Para integración continua, usa:

```bash
pytest --cov=api --cov-report=xml --cov-report=term
```

Esto genera un reporte XML compatible con la mayoría de servicios de CI/CD.
