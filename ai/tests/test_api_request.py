import requests
from unittest.mock import Mock

from api.request import APIRequest


class DummyResponse:
    def __init__(self, status_code=200, text="ok", raise_exc=None):
        self.status_code = status_code
        self.text = text
        self._raise_exc = raise_exc

    def raise_for_status(self):
        if self._raise_exc:
            raise self._raise_exc


def _make_session(response):
    session = Mock()
    session.headers = {}
    session.get.return_value = response
    session.post.return_value = response
    session.put.return_value = response
    session.delete.return_value = response
    session.patch.return_value = response
    return session


def test_build_url_and_headers(monkeypatch):
    response = DummyResponse()
    session = _make_session(response)
    monkeypatch.setattr(requests, "Session", lambda: session)

    client = APIRequest(base_url="http://example.com/", default_headers={"X-Base": "1"})
    assert client._build_url("path") == "http://example.com/path"
    assert client._build_url("http://other") == "http://other"
    assert client._merge_headers({"X-Req": "2"}) == {"X-Base": "1", "X-Req": "2"}


def test_get_success(monkeypatch):
    response = DummyResponse()
    session = _make_session(response)
    monkeypatch.setattr(requests, "Session", lambda: session)

    client = APIRequest(base_url="http://example.com", timeout=5)
    result = client.get("/health", params={"q": "1"}, headers={"X": "y"}, timeout=2)

    assert result is response
    session.get.assert_called_once()


def test_get_raises(monkeypatch):
    exc = requests.exceptions.HTTPError("boom")
    response = DummyResponse(raise_exc=exc)
    session = _make_session(response)
    monkeypatch.setattr(requests, "Session", lambda: session)

    client = APIRequest(base_url="http://example.com")
    try:
        client.get("/fail")
    except requests.exceptions.HTTPError:
        pass
    else:
        assert False, "Expected HTTPError"


def test_other_methods(monkeypatch):
    response = DummyResponse(status_code=201)
    session = _make_session(response)
    monkeypatch.setattr(requests, "Session", lambda: session)

    client = APIRequest(base_url="http://example.com")
    assert client.post("/p", json={"a": 1}) is response
    assert client.put("/u", data={"b": 2}) is response
    assert client.delete("/d") is response
    assert client.patch("/pt", json={"c": 3}) is response


def test_set_auth_token_and_context_manager(monkeypatch):
    response = DummyResponse()
    session = _make_session(response)
    monkeypatch.setattr(requests, "Session", lambda: session)

    client = APIRequest()
    client.set_auth_token("token123")
    assert client.default_headers["Authorization"] == "Bearer token123"
    assert client.session.headers["Authorization"] == "Bearer token123"

    client.close = Mock()
    with client:
        pass
    client.close.assert_called_once()


def test_methods_raise(monkeypatch):
    exc = requests.exceptions.RequestException("fail")
    response = DummyResponse(raise_exc=exc)
    session = _make_session(response)
    monkeypatch.setattr(requests, "Session", lambda: session)

    client = APIRequest(base_url="http://example.com")
    for method_name in ["post", "put", "delete", "patch"]:
        method = getattr(client, method_name)
        try:
            if method_name == "delete":
                method("/x")
            else:
                method("/x", json={"a": 1})
        except requests.exceptions.RequestException:
            pass
        else:
            assert False, f"Expected exception for {method_name}"
