from fastapi import APIRouter
from conf.config import settings
from service.service import plateService

router = APIRouter(
    prefix=settings.API_PREFIX,
    tags=settings.API_TAGS
)

@router.get("")
async def detect_plate(carPlate: str):
    result: str = plateService.get_itv_date_by_plate(carPlate)
    return {"carPlate": carPlate, "itv_date": result}