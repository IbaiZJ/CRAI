"""Tests para los routers de la API"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


@pytest.mark.api
class TestRouterEndpoints:
    """Tests específicos para los endpoints del router"""

    def test_hello_endpoint_structure(self):
        """Verifica la estructura completa de la respuesta"""
        response = client.get("/api/hello")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verifica que la respuesta es un diccionario
        assert isinstance(data, dict)
        
        # Verifica que contiene la clave 'message'
        assert "message" in data
        
        # Verifica el tipo del mensaje
        assert isinstance(data["message"], str)

    def test_hello_endpoint_performance(self):
        """Verifica que el endpoint responde rápido"""
        import time
        
        start = time.time()
        response = client.get("/api/hello")
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 1.0  # Debe responder en menos de 1 segundo

    def test_multiple_requests(self):
        """Verifica que el endpoint maneja múltiples peticiones"""
        for _ in range(5):
            response = client.get("/api/hello")
            assert response.status_code == 200
            assert "message" in response.json()


@pytest.mark.api
class TestRouterConfiguration:
    """Tests para la configuración del router"""

    def test_router_prefix(self):
        """Verifica que el router usa el prefijo correcto"""
        # Endpoint con prefijo debe funcionar
        response = client.get("/api/hello")
        assert response.status_code == 200
        
        # Endpoint sin prefijo no debe funcionar
        response = client.get("/hello")
        assert response.status_code == 404

    def test_openapi_schema(self):
        """Verifica que el schema OpenAPI está disponible"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        
        schema = response.json()
        assert "openapi" in schema
        assert "info" in schema
        assert "paths" in schema

    def test_docs_available(self):
        """Verifica que la documentación está disponible"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_available(self):
        """Verifica que ReDoc está disponible"""
        response = client.get("/redoc")
        assert response.status_code == 200
