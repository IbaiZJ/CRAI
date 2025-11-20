# Guía Rápida de Testing con pytest

## 📋 Resumen de lo configurado

### ✅ Tests creados
- `test_main.py`: 10 tests para la aplicación principal y endpoints básicos
- `test_router.py`: 7 tests para routers y configuración
- **Total: 17 tests pasando con 100% de cobertura**

### 📦 Dependencias instaladas
```bash
pytest              # Framework de testing
pytest-cov          # Cobertura de código
pytest-asyncio      # Soporte async
httpx               # Cliente HTTP para FastAPI
pydantic-settings   # Settings de Pydantic v2
```

## 🚀 Comandos útiles

### Ejecutar tests
```bash
# Todos los tests
cd ai
pytest

# Con salida detallada
pytest -v

# Con cobertura
pytest --cov=api

# Con cobertura detallada
pytest --cov=api --cov-report=term-missing

# Generar reporte HTML
pytest --cov=api --cov-report=html
# Abre: ai/htmlcov/index.html
```

### Tests específicos
```bash
# Un archivo
pytest tests/api/test_main.py

# Una clase
pytest tests/api/test_main.py::TestMainApp

# Un test específico
pytest tests/api/test_main.py::TestMainApp::test_app_exists

# Por markers
pytest -m api           # Solo tests de API
pytest -m integration   # Solo tests de integración
pytest -m "not slow"    # Excluir tests lentos
```

### Opciones útiles
```bash
# Detener en el primer fallo
pytest -x

# Mostrar print statements
pytest -s

# Ejecutar últimos tests que fallaron
pytest --lf

# Ejecutar solo tests modificados
pytest --ff

# Ver los 10 tests más lentos
pytest --durations=10

# Modo verbose con traceback corto
pytest -v --tb=short
```

## 📝 Estructura de un test

```python
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_mi_endpoint():
    """Siempre documenta qué hace el test"""
    response = client.get("/api/mi-endpoint")
    assert response.status_code == 200
    assert response.json() == {"expected": "data"}
```

## 🔧 Fixtures útiles

### Fixture del proyecto (en conftest.py)
```python
def test_usando_fixture(test_client):
    """Usa el fixture test_client de conftest.py"""
    response = test_client.get("/api/hello")
    assert response.status_code == 200
```

### Crear tu propio fixture
```python
@pytest.fixture
def usuario_test():
    """Crea un usuario para tests"""
    user = {"id": 1, "nombre": "Test"}
    yield user
    # Cleanup aquí si es necesario

def test_con_usuario(usuario_test):
    assert usuario_test["nombre"] == "Test"
```

## 🏷️ Markers

```python
@pytest.mark.api
def test_endpoint():
    """Test de API"""
    pass

@pytest.mark.slow
def test_operacion_lenta():
    """Test que tarda mucho"""
    pass

@pytest.mark.integration
def test_integracion():
    """Test de integración"""
    pass
```

## 📊 Cobertura de código

### Ver archivos no cubiertos
```bash
pytest --cov=api --cov-report=term-missing
```

### Exigir mínimo de cobertura
```bash
pytest --cov=api --cov-fail-under=80
```

### Excluir archivos de cobertura
En `pytest.ini`:
```ini
[pytest]
addopts = --cov=api --cov-report=term-missing
          --cov-config=.coveragerc
```

Crear `.coveragerc`:
```ini
[run]
omit = 
    */tests/*
    */migrations/*
    */__pycache__/*
```

## 🧪 Ejemplos de tests comunes

### Test GET
```python
def test_get_item():
    response = client.get("/api/items/1")
    assert response.status_code == 200
    assert "id" in response.json()
```

### Test POST
```python
def test_create_item():
    data = {"nombre": "Item 1"}
    response = client.post("/api/items", json=data)
    assert response.status_code == 201
    assert response.json()["nombre"] == "Item 1"
```

### Test validación
```python
def test_validation_error():
    data = {}  # Datos inválidos
    response = client.post("/api/items", json=data)
    assert response.status_code == 422
```

### Test autenticación
```python
def test_protected_endpoint():
    # Sin token
    response = client.get("/api/protected")
    assert response.status_code == 401
    
    # Con token
    headers = {"Authorization": "Bearer token"}
    response = client.get("/api/protected", headers=headers)
    assert response.status_code == 200
```

### Test parametrizado
```python
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
])
def test_double(input, expected):
    assert input * 2 == expected
```

### Test async
```python
@pytest.mark.asyncio
async def test_async_endpoint():
    # TestClient maneja async automáticamente
    response = client.get("/api/async-endpoint")
    assert response.status_code == 200
```

## 🐛 Debugging

### Con pdb
```python
def test_debug():
    import pdb; pdb.set_trace()
    # Tu código aquí
```

### Ver variables locales en fallos
```bash
pytest -l  # --showlocals
```

### Traceback completo
```bash
pytest --tb=long
```

## 📁 Archivos creados

```
ai/
├── pytest.ini                          # Configuración de pytest
├── requirements.txt                    # Dependencias actualizadas
├── tests/
│   ├── __init__.py
│   ├── conftest.py                    # Fixtures compartidos
│   ├── README.md                      # Documentación detallada
│   └── api/
│       ├── __init__.py
│       ├── test_main.py               # Tests principales (10 tests)
│       ├── test_router.py             # Tests de routers (7 tests)
│       └── template_test_example.py.txt  # Plantilla de ejemplo
└── htmlcov/                           # Reporte de cobertura HTML
```

## 🎯 Próximos pasos

1. **Cuando agregues un nuevo endpoint**:
   - Crea un nuevo archivo `test_nombre.py` en `tests/api/`
   - Escribe tests para todos los casos (éxito, error, validación)
   - Ejecuta `pytest` para verificar

2. **Buenas prácticas**:
   - Escribe tests ANTES de implementar (TDD)
   - Un test debe verificar UNA cosa
   - Tests deben ser independientes
   - Usa nombres descriptivos
   - Documenta con docstrings

3. **Mantén la cobertura alta**:
   - Objetivo: > 80%
   - Ejecuta `pytest --cov=api --cov-report=html` regularmente
   - Revisa `htmlcov/index.html` para ver qué falta cubrir

## 💡 Tips

- **F5** en VS Code: Ejecutar tests con debugger
- Instala extensión "Python Test Explorer" para ver tests en sidebar
- Usa `pytest-watch` para ejecutar tests automáticamente
- Crea un alias: `alias test='pytest -v'`

## 📚 Recursos

- [Documentación de pytest](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [pytest-cov](https://pytest-cov.readthedocs.io/)

---

**Resultado actual**: ✅ 17 tests pasando | 100% cobertura | 0.22s
