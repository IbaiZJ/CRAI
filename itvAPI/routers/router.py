from fastapi import APIRouter, Query
from conf.config import settings
from service.service import plateService

router = APIRouter(
    prefix=settings.API_PREFIX,
    tags=settings.API_TAGS
)

@router.get("")
async def detect_plate(car_plate: str = Query(..., alias="carPlate")):
    result: str = plateService.get_itv_date_by_plate(car_plate)
    return {"carPlate": car_plate, "itv_date": result}