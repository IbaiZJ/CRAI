from fastapi import FastAPI
import os
from routers.router import router
from conf.config import settings
import py7zr


print("Checking if environmentalBadge.txt exists...")
txt_file = "data/environmentalBadge.txt"
zip_file = "data/environmentalBadge.7z"

if not os.path.exists(txt_file):
    print(f"{txt_file} not found. Extracting from {zip_file}...")
    if os.path.exists(zip_file):
        try:
            with py7zr.SevenZipFile(zip_file, mode='r') as archive:
                archive.extractall(path='data')
            print(f"Successfully extracted {txt_file}")
        except ImportError:
            print("Error: py7zr not installed. Run: pip install py7zr")
        except Exception as e:
            print(f"Error extracting file: {e}")
    else:
        print(f"Error: {zip_file} not found")
else:
    print(f"{txt_file} already exists, skipping extraction")
    

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
)

app.include_router(router)