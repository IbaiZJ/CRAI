import argparse
import signal
import sys

parser = argparse.ArgumentParser()
parser.add_argument("-f", "--file", type=str, default="../data/environmentalBadge.txt", help="file to read", required=False)
args = parser.parse_args()

# Ctrl + C
def def_handler(signal, frame):
    sys.exit(1)
signal.signal(signal.SIGINT, def_handler)

def get_badge_types():
    """Returns the different types of environmental badges from the dataset file"""

    try :
        badges = set()
        
        with open(args.file, "r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if '|' in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        badge = parts[1].strip()
                        
                        if badge and badge not in badges:
                            badges.add(badge)
                            print(f"Loaded badge type: {badge}")
    except FileNotFoundError:
        print(f"Error: The badge types file was not found: '{args.file}'")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    get_badge_types()