from fastapi import FastAPI
import argparse
from routers.router import router
from conf.config import settings

parser = argparse.ArgumentParser()
parser.add_argument("--unzipData", action="store_true", help="Unzip and process data files")
args, unknown = parser.parse_known_args()

if args.unzipData:
    print("Unzipping data files...")
    

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

app.include_router(router)