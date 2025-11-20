import pytest
from fastapi.testclient import TestClient
from api.main import app

# Cliente de pruebas
client = TestClient(app)


class TestMainApp:
    """Tests para la aplicación principal de FastAPI"""

    def test_app_exists(self):
        """Verifica que la aplicación FastAPI existe"""
        assert app is not None

    def test_app_title(self):
        """Verifica que la aplicación tiene el título correcto"""
        assert app.title is not None

    def test_app_version(self):
        """Verifica que la aplicación tiene una versión"""
        assert app.version is not None


class TestHealthEndpoints:
    """Tests para los endpoints básicos"""

    def test_hello_endpoint(self):
        """Test del endpoint /api/hello"""
        response = client.get("/api/hello")
        assert response.status_code == 200
        assert "message" in response.json()
        assert response.json()["message"] == "Hello World"

    def test_hello_endpoint_response_type(self):
        """Verifica que el endpoint devuelve JSON"""
        response = client.get("/api/hello")
        assert response.headers["content-type"] == "application/json"

    def test_endpoint_not_found(self):
        """Test de endpoint que no existe"""
        response = client.get("/api/notexist")
        assert response.status_code == 404

    def test_root_endpoint_not_found(self):
        """Test del endpoint raíz (sin /api prefix)"""
        response = client.get("/")
        assert response.status_code == 404


class TestHTTPMethods:
    """Tests para diferentes métodos HTTP"""

    def test_hello_post_not_allowed(self):
        """Verifica que POST no está permitido en /hello"""
        response = client.post("/api/hello")
        assert response.status_code == 405  # Method Not Allowed

    def test_hello_put_not_allowed(self):
        """Verifica que PUT no está permitido en /hello"""
        response = client.put("/api/hello")
        assert response.status_code == 405

    def test_hello_delete_not_allowed(self):
        """Verifica que DELETE no está permitido en /hello"""
        response = client.delete("/api/hello")
        assert response.status_code == 405
