from fastapi import FastAPI
from routers.router import router
from conf.config import settings
from util.util import unzip_itv_date_file
    
unzip_itv_date_file()

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

app.include_router(router)