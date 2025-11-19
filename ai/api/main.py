from fastapi import FastAPI
from api.routers.router import router
from api.core.config import settings

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

app.include_router(router)