import os
import yaml
from functools import lru_cache


def _default_base_dir():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def resolve_path(path_str: str, base_dir: str | None = None) -> str | None:
    """Return absolute path for relative entries in config.

    - If the value is already absolute, return as-is.
    - If the value is None/empty, return None.
    - Otherwise join with the project base directory.
    """
    if not path_str:
        return None
    base = base_dir or _default_base_dir()
    if os.path.isabs(path_str):
        return os.path.normpath(path_str)
    return os.path.normpath(os.path.join(base, path_str))


@lru_cache(maxsize=1)
def load_config() -> dict:
    """Load YAML config once and cache it."""
    base = _default_base_dir()
    config_path = os.path.join(base, "config", "config.yaml")
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}
