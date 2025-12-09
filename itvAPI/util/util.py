import py7zr
import os
import sys
from termcolor import colored

txt_file = "data/plates_itv.csv"
zip_file = "data/plates_itv.7z"

def unzip_itv_date_file():
    print(colored("[INFO] Checking if plates_itv.csv exists...", "cyan"))
    if not os.path.exists(txt_file):
        print(colored(f"[WARNING] {txt_file} not found. Extracting from {zip_file}...", "yellow"))
        if os.path.exists(zip_file):
            try:
                with py7zr.SevenZipFile(zip_file, mode='r') as archive:
                    archive.extractall(path='data')
                print(colored(f"[INFO] Successfully extracted {txt_file}", "green"))
            except ImportError:
                print(colored("[ERROR] py7zr not installed. Run: pip install py7zr", "red"))
            except Exception as e:
                print(colored(f"[ERROR] Error extracting file: {e}", "red"))
                sys.exit(1)
        else:
            print(colored(f"[ERROR] {zip_file} not found", "red"))
            sys.exit(1)
    else:
        print(colored(f"[INFO] {txt_file} already exists, skipping extraction", "cyan"))