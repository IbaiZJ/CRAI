import re
import pandas as pd
from termcolor import colored

data_file_path = "data/environmentalBadge.csv"

class EnvironmentalBadgeService:
    """Service for processing environmental badges based on car plates"""
    
    def __init__(self):
        print(colored("Initializing EnvironmentalBadgeService...", "green"))
        print(colored("Loading data from:", "yellow"), data_file_path)
        self.df = pd.read_csv(data_file_path, header=None, dtype=str)
        self.df.columns = ['plate', 'badge']
        self.plate_to_badge = dict(zip(self.df['plate'], self.df['badge']))
        print(colored(f"Loaded {len(self.df)} records from the dataset.", "green"))

    
    def get_badge_by_plate(self, plate: str) -> dict | str:
        """Get the environmental badge for a given car plate"""
        plate = self.validate_plate(plate)
        if plate is None:
            return {"error": "Invalid plate format"}
        
        badge = self.get_badge_from_plate(plate)
        if badge is None:
            return "none"
        
        badge = self.convert_badge_code_to_name(badge)
        
        return badge

    def validate_plate(self, plate: str) -> str | None:
        """Validate the format of the car plate"""
        
        formatted_plate = plate.upper().replace(" ", "").replace("-", "")
        
        if re.match(r"^\d{4}[BCDFGHJKLMNPQRSTVWXYZ]{3}$", formatted_plate):
            return formatted_plate
        
        return None
    
    def get_badge_from_plate(self, plate: str) -> dict:
        """Public method to get badge information by plate"""
        return self.plate_to_badge.get(plate, None)
    
    def convert_badge_code_to_name(self, badge_code: str) -> dict:
        """Convert badge code to structured badge information"""
        
        # Extract vehicle type (first character)
        vehicle_type = None
        if badge_code.startswith("T"):
            vehicle_type = "turism"
        elif badge_code.startswith("M"):
            vehicle_type = "motorbike"
        
        # Extract badge (last character)
        badge_char = badge_code[-1] if len(badge_code) > 1 else None
        
        # Convert badge to name
        badge_names = {
            "0": "0",
            "B": "B",
            "C": "C",
            "E": "ECO"
        }
        badge_name = badge_names.get(badge_char, "Unknown")
        
        return {
            "vehicleType": vehicle_type,
            "badge": badge_name,
        }


plateService = EnvironmentalBadgeService()
