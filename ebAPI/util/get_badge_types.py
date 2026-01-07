import argparse
import signal
import sys

file_path = "../data/environmentalBadge.txt"


def def_handler(sig, frame):
    """Handle SIGINT (Ctrl+C) signal"""
    sys.exit(1)


def get_badge_types(file_to_read=None):
    """Returns the different types of environmental badges from the dataset file"""
    if file_to_read is None:
        file_to_read = file_path
    
    try:
        badges = set()

        with open(file_to_read, "r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if '|' in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        badge = parts[1].strip()

                        if badge and badge not in badges:
                            badges.add(badge)
                            print(f"Loaded badge type: {badge}")
        return badges
    except FileNotFoundError:
        print(f"Error: The badge types file was not found: '{file_to_read}'")
        return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None


def main():
    """Main entry point with command line argument parsing"""
    parser = argparse.ArgumentParser()
    parser.add_argument("-f", "--file", type=str, default=file_path, help="file to read", required=False)
    args = parser.parse_args()
    
    signal.signal(signal.SIGINT, def_handler)
    
    get_badge_types(args.file)


if __name__ == "__main__":
    main()
