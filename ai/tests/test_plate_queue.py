import queue as queue_module
from unittest.mock import Mock

from api.plate_queue import PlateQueue


class DummyResponse:
    def __init__(self, status_code=200, text="ok"):
        self.status_code = status_code
        self.text = text


def test_send_plate_success():
    pq = PlateQueue(endpoint_url="http://example.com/api", timeout=1)
    pq.api_client = Mock()
    pq.api_client.post.return_value = DummyResponse(status_code=201)

    plate = {"plate": "1234BCD", "confidence": 0.9, "timestamp": "t"}
    assert pq._send_plate(plate) is True


def test_send_plate_failure_status():
    pq = PlateQueue(endpoint_url="http://example.com/api", timeout=1)
    pq.api_client = Mock()
    pq.api_client.post.return_value = DummyResponse(status_code=500, text="fail")

    plate = {"plate": "1234BCD", "confidence": 0.9, "timestamp": "t"}
    assert pq._send_plate(plate) is False


def test_send_plate_exception():
    pq = PlateQueue(endpoint_url="http://example.com/api", timeout=1)
    pq.api_client = Mock()
    pq.api_client.post.side_effect = RuntimeError("network")

    plate = {"plate": "1234BCD", "confidence": 0.9, "timestamp": "t"}
    assert pq._send_plate(plate) is False


def test_worker_retry_and_fail(monkeypatch):
    pq = PlateQueue(endpoint_url="http://example.com/api", max_retries=2, retry_delay=0)
    pq.running = True

    plate_data = {
        "plate": "1234BCD",
        "confidence": 0.9,
        "timestamp": "t",
        "retries": 0,
    }

    calls = {"count": 0}

    def fake_get(timeout=1.0):
        calls["count"] += 1
        if calls["count"] == 1:
            return plate_data
        if calls["count"] == 2:
            return plate_data
        pq.running = False
        raise queue_module.Empty

    monkeypatch.setattr(pq.queue, "get", fake_get)
    monkeypatch.setattr(pq, "_send_plate", Mock(return_value=False))
    monkeypatch.setattr("api.plate_queue.time.sleep", lambda *_: None)

    pq._worker()

    stats = pq.get_stats()
    assert stats["retrying"] == 1
    assert stats["failed"] == 1


def test_worker_success(monkeypatch):
    pq = PlateQueue(endpoint_url="http://example.com/api")
    pq.running = True

    plate_data = {
        "plate": "1234BCD",
        "confidence": 0.9,
        "timestamp": "t",
        "retries": 0,
    }

    def fake_get(timeout=1.0):
        pq.running = False
        return plate_data

    monkeypatch.setattr(pq.queue, "get", fake_get)
    monkeypatch.setattr(pq, "_send_plate", Mock(return_value=True))

    pq._worker()
    stats = pq.get_stats()
    assert stats["sent"] == 1


def test_start_and_stop(monkeypatch):
    pq = PlateQueue(endpoint_url="http://example.com/api")

    thread = Mock()
    thread.is_alive.return_value = False
    monkeypatch.setattr("api.plate_queue.threading.Thread", Mock(return_value=thread))

    pq.start()
    pq.start()
    assert pq.running is True

    pq.stop(timeout=0.1)
    assert pq.running is False


def test_stop_warns_if_thread_alive():
    pq = PlateQueue(endpoint_url="http://example.com/api")
    pq.running = True
    pq.worker_thread = Mock()
    pq.worker_thread.is_alive.return_value = True

    pq.stop(timeout=0.1)
    assert pq.running is False


def test_stop_when_not_running():
    pq = PlateQueue(endpoint_url="http://example.com/api")
    pq.stop()


def test_add_plate_and_stats():
    pq = PlateQueue(endpoint_url="http://example.com/api")
    pq.add_plate("1234BCD", 0.9, vehicle_type="car", metadata={"x": 1})

    stats = pq.get_stats()
    assert stats["pending"] == 1
    assert pq.get_queue_size() == 1
