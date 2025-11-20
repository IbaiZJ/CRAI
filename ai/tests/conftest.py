"""
Configuración de pytest para todo el proyecto.
Este archivo contiene fixtures compartidos por todos los tests.
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app


@pytest.fixture(scope="module")
def test_client():
    """
    Fixture que proporciona un cliente de pruebas para FastAPI.
    Se crea una vez por módulo de tests.
    """
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="function")
def test_client_fresh():
    """
    Fixture que proporciona un cliente de pruebas fresco para cada test.
    Útil cuando necesitas un estado limpio en cada test.
    """
    with TestClient(app) as client:
        yield client
