from fastapi import APIRouter
from api.core.config import settings

router = APIRouter(
    prefix=settings.API_PREFIX,
    tags=settings.API_TAGS
)

@router.get("/hello")
async def detect_plate():
    return {"message": "Hello World"}