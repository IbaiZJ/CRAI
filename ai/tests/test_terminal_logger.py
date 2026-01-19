import logging
from unittest.mock import Mock

from utils import logger as logger_module
from utils.logger import Logger, ColoredFormatter, log_function_call, LogSection
from utils.terminal import Terminal


def test_terminal_start_calls_helpers(monkeypatch):
    mock_clear = Mock()
    mock_banner = Mock()
    monkeypatch.setattr(Terminal, "clear", mock_clear)
    monkeypatch.setattr(Terminal, "print_banner", mock_banner)

    Terminal.start()
    mock_clear.assert_called_once()
    mock_banner.assert_called_once()


def test_terminal_clear_and_info(monkeypatch, capsys):
    mock_system = Mock()
    monkeypatch.setattr("utils.terminal.os.system", mock_system)

    Terminal.clear()
    mock_system.assert_called_once()

    Terminal.print_banner()
    banner_out = capsys.readouterr().out
    assert "Car Registration" in banner_out

    Terminal.print_info()
    out = capsys.readouterr().out
    assert "SYSTEM READY" in out


def test_logger_handlers_and_formatter(tmp_path):
    log = Logger(log_to_file=True, log_to_console=True, log_dir=str(tmp_path))
    assert len(log.logger.handlers) >= 3

    fmt = log._create_formatter()
    assert isinstance(fmt, logging.Formatter)

    log.debug("d")
    log.info("i")
    log.warning("w")
    log.error("e")
    log.critical("c")
    log.exception("x")


def test_colored_formatter():
    formatter = ColoredFormatter()
    record = logging.LogRecord(
        name="x",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="hello",
        args=(),
        exc_info=None,
    )
    formatted = formatter.format(record)
    assert ColoredFormatter.COLORS["INFO"] in formatted


def test_get_logger_singleton():
    logger_module._logger_instance = None
    a = logger_module.get_logger(log_to_file=False, log_to_console=False)
    b = logger_module.get_logger(log_to_file=False, log_to_console=False)
    assert a is b


def test_log_function_call_success_and_error():
    class DummyLogger:
        def debug(self, *args, **kwargs):
            pass

        def error(self, *args, **kwargs):
            pass

    @log_function_call(logger=DummyLogger())
    def add(a, b):
        return a + b

    assert add(1, 2) == 3

    @log_function_call(logger=DummyLogger())
    def fail():
        raise ValueError("boom")

    try:
        fail()
    except ValueError:
        pass
    else:
        assert False, "Expected ValueError"


def test_log_function_call_default_logger(monkeypatch):
    class DummyLogger:
        def debug(self, *args, **kwargs):
            pass

        def error(self, *args, **kwargs):
            pass

    monkeypatch.setattr(logger_module, "get_logger", lambda: DummyLogger())

    @log_function_call()
    def add(a, b):
        return a + b

    assert add(1, 2) == 3


def test_log_section_success_and_error():
    class DummyLogger:
        def info(self, *args, **kwargs):
            pass

        def error(self, *args, **kwargs):
            pass

    logger = DummyLogger()

    with LogSection(logger, "ok"):
        pass

    try:
        with LogSection(logger, "fail"):
            raise RuntimeError("bad")
    except RuntimeError:
        pass
