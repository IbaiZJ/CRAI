import requests
from typing import Optional, Dict, Any
import logging

class APIRequest:
    """HTTP client for simplified API requests."""
    
    def __init__(self, base_url: str = "", default_headers: Optional[Dict[str, str]] = None, timeout: int = 30):
        """
        Initializes the API client.
        
        Args:
            base_url: Base URL for all requests (optional)
            default_headers: Default headers for all requests
            timeout: Timeout in seconds for requests (default: 30)
        """
        self.base_url = base_url.rstrip('/')
        self.default_headers = default_headers or {}
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(self.default_headers)
        
        # Configure logging
        self.logger = logging.getLogger(__name__)
    
    def _build_url(self, endpoint: str) -> str:
        """Builds the complete URL by combining base_url and endpoint."""
        if endpoint.startswith('http://') or endpoint.startswith('https://'):
            return endpoint
        return f"{self.base_url}/{endpoint.lstrip('/')}" if self.base_url else endpoint
    
    def _merge_headers(self, headers: Optional[Dict[str, str]]) -> Dict[str, str]:
        """Merges default headers with request-specific headers."""
        merged = self.default_headers.copy()
        if headers:
            merged.update(headers)
        return merged
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, 
            headers: Optional[Dict[str, str]] = None, **kwargs) -> requests.Response:
        """
        Performs a GET request.
        
        Args:
            endpoint: Endpoint or full URL
            params: Query string parameters
            headers: Additional headers
            **kwargs: Additional arguments for requests.get
            
        Returns:
            requests Response object
            
        Raises:
            requests.exceptions.RequestException: If there's an error in the request
        """
        url = self._build_url(endpoint)
        merged_headers = self._merge_headers(headers)
        
        try:
            self.logger.info(f"GET {url}")
            response = self.session.get(
                url, 
                params=params, 
                headers=merged_headers,
                timeout=kwargs.pop('timeout', self.timeout),
                **kwargs
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            self.logger.error(f"GET {url} failed: {e}")
            raise
    
    def post(self, endpoint: str, data: Optional[Dict[str, Any]] = None, 
             json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None,
             **kwargs) -> requests.Response:
        """
        Performs a POST request.
        
        Args:
            endpoint: Endpoint or full URL
            data: Data to send as form-data
            json: Data to send as JSON
            headers: Additional headers
            **kwargs: Additional arguments for requests.post
            
        Returns:
            requests Response object
            
        Raises:
            requests.exceptions.RequestException: If there's an error in the request
        """
        url = self._build_url(endpoint)
        merged_headers = self._merge_headers(headers)
        
        try:
            self.logger.info(f"POST {url}")
            response = self.session.post(
                url, 
                data=data, 
                json=json, 
                headers=merged_headers,
                timeout=kwargs.pop('timeout', self.timeout),
                **kwargs
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            self.logger.error(f"POST {url} failed: {e}")
            raise
    
    def put(self, endpoint: str, data: Optional[Dict[str, Any]] = None,
            json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None,
            **kwargs) -> requests.Response:
        """Performs a PUT request."""
        url = self._build_url(endpoint)
        merged_headers = self._merge_headers(headers)
        
        try:
            self.logger.info(f"PUT {url}")
            response = self.session.put(
                url, 
                data=data, 
                json=json, 
                headers=merged_headers,
                timeout=kwargs.pop('timeout', self.timeout),
                **kwargs
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            self.logger.error(f"PUT {url} failed: {e}")
            raise
    
    def delete(self, endpoint: str, headers: Optional[Dict[str, str]] = None,
               **kwargs) -> requests.Response:
        """Performs a DELETE request."""
        url = self._build_url(endpoint)
        merged_headers = self._merge_headers(headers)
        
        try:
            self.logger.info(f"DELETE {url}")
            response = self.session.delete(
                url, 
                headers=merged_headers,
                timeout=kwargs.pop('timeout', self.timeout),
                **kwargs
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            self.logger.error(f"DELETE {url} failed: {e}")
            raise
    
    def patch(self, endpoint: str, data: Optional[Dict[str, Any]] = None,
              json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None,
              **kwargs) -> requests.Response:
        """Performs a PATCH request."""
        url = self._build_url(endpoint)
        merged_headers = self._merge_headers(headers)
        
        try:
            self.logger.info(f"PATCH {url}")
            response = self.session.patch(
                url, 
                data=data, 
                json=json, 
                headers=merged_headers,
                timeout=kwargs.pop('timeout', self.timeout),
                **kwargs
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            self.logger.error(f"PATCH {url} failed: {e}")
            raise
    
    def set_auth_token(self, token: str, token_type: str = "Bearer"):
        """
        Sets an authentication token in the default headers.
        
        Args:
            token: The authentication token
            token_type: Token type (default: "Bearer")
        """
        self.default_headers['Authorization'] = f"{token_type} {token}"
        self.session.headers.update({'Authorization': f"{token_type} {token}"})
    
    def close(self):
        """Closes the requests session."""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()