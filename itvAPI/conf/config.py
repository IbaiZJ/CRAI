from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_TITLE: str = "ITV API"
    API_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    API_TAGS: list = ["ITV API"]

settings = Settings()