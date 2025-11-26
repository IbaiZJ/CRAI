import re
from util.get_badge_from_plates import get_badge_from_plate

class EnvironmentalBadgeService:
    """Service for processing environmental badges based on car plates"""
    
    def get_badge_by_plate(self, plate: str) -> dict:
        """Get the environmental badge for a given car plate"""
        plate = self.validate_plate(plate)
        if plate is None:
            return {"error": "Invalid plate format"}
        
        badge = get_badge_from_plate(plate, "data/environmentalBadge.txt")
        if badge is None:
            return {"error": "Badge not found"}
        
        badge = self.convert_badge_code_to_name(badge)
        
        return badge

    def validate_plate(self, plate: str) -> str | None:
        """Validate the format of the car plate"""
        
        formatted_plate = plate.upper().replace(" ", "").replace("-", "")
        
        if re.match(r"^\d{4}[B-DF-HJ-NP-TV-Z]{3}$", formatted_plate):
            return formatted_plate
        
        return None
    
    def convert_badge_code_to_name(self, badge_code: str) -> dict:
        """Convert badge code to structured badge information"""
        
        # Casos especiales
        if badge_code == "TIPO DE ETIQUETA" or badge_code == "SIN DISTINTIVO":
            return {
                "vehicleType": None,
                "badge": None,
                "badgeName": "No Badge"
            }
        
        # Remove prefix "16" if present
        if badge_code.startswith("16"):
            badge_code = badge_code[2:]
        
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
            # "badgeName": f"{badge_name} Badge" if badge_name != "Unknown" else "Unknown Badge"
        }


plateService = EnvironmentalBadgeService()
