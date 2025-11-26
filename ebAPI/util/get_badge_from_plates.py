import argparse
import pandas as pd
import signal
import sys

file_path = "../data/environmentalBadge.txt"

def get_badge_from_plate(carPlate: str, file_path: str) -> str | None:
    """Returns the environmental badge associated with the given car plate"""
    
    try:
        df = pd.read_csv(file_path, sep='|', header=None, names=['plate', 'badge'], dtype=str)
        df['plate'] = df['plate'].str.upper().str.replace(" ", "").str.replace("-", "")
        carPlate_formatted = carPlate.upper().replace(" ", "").replace("-", "")
        
        badge_row = df[df['plate'] == carPlate_formatted]
        if not badge_row.empty:
            badge = badge_row.iloc[0]['badge']
            print(f"Car Plate: {carPlate_formatted}, Badge: {badge}")
            return badge
        else:
            print(f"Car Plate: {carPlate_formatted}, Badge: Not Found")
            return None
    except FileNotFoundError:
        print(f"Error: The data file was not found: '{file_path}'")
        return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    # Ctrl + C
    def def_handler(sig, frame):
        sys.exit(1)
    signal.signal(signal.SIGINT, def_handler)
    
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--plate", type=str, help="plate to read", required=True)
    parser.add_argument("-f", "--file", type=str, default=file_path, help="file to read", required=False)
    args = parser.parse_args()
    
    get_badge_from_plate(args.plate, args.file)