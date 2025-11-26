import re

class EnvironmentalBadgeService:
    """Service for processing environmental badges based on car plates"""
    
    def get_badge_by_plate(self, plate: str) -> str:
        """Get the environmental badge for a given car plate"""
        plate = self.validate_plate(plate)
        if plate is None:
            return "Invalid plate format"
        
        return plate.upper()

    def validate_plate(self, plate: str) -> str | None:
        """Validate the format of the car plate"""
        
        formatted_plate = plate.upper().replace(" ", "").replace("-", "")
        
        if re.match(r"^\d{4}[B-DF-HJ-NP-TV-Z]{3}$", formatted_plate):
            return formatted_plate
        
        return None


plateService = EnvironmentalBadgeService()
