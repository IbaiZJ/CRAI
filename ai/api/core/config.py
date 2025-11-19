from pydantic import BaseSettings

class Settings(BaseSettings):
    API_TITLE: str = "CRAI ANPR API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    API_TAGS: list = ["ANPR"]

settings = Settings()