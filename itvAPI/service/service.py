import re
import pandas as pd
from termcolor import colored
from datetime import date, timedelta
from util.util import unzip_itv_date_file

data_file_path = "data/plates_itv.csv"

class PlatesItvService:
    """Service for processing environmental badges based on car plates"""
    
    def __init__(self):
        print(colored("Initializing PlatesItvService...", "green"))
        # Descomprimir el archivo .7z si no existe el CSV
        unzip_itv_date_file()
        print(colored("Loading data from:", "yellow"), data_file_path)
        self.df = pd.read_csv(data_file_path, header=None, dtype=str)
        self.df.columns = ['plate', 'date_itv']
        self.plate_to_itv_date = dict(zip(self.df['plate'], self.df['date_itv']))
        print(colored(f"Loaded {len(self.df)} records from the dataset.", "green"))

    
    def get_itv_date_by_plate(self, plate: str):
        """Get the ITV expiry date for a given car plate"""
        plate = self.validate_plate(plate)
        if plate is None:
            return {"error": "Invalid plate format"}
        
        itv_date = self.plate_to_itv_date.get(plate, None)
        if itv_date is None:
            return "none"
        
        itv_status = self.convert_itv_date_code_to_state(itv_date)
        
        return itv_status

    def validate_plate(self, plate: str) -> str | None:
        """Validate the format of the car plate and convert to uppercase"""
        
        formatted_plate = plate.upper().replace(" ", "").replace("-", "")
        
        if re.match(r"^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$", formatted_plate):
            return formatted_plate
        
        return None
    
    def convert_itv_date_code_to_state(self, itv_date_code: str):
        """
        Compara la fecha de caducidad ITV con la fecha actual (hoy).
     
          - 1 si está caducado 
          - 0 si está vigente 
          - "warning" si falta menos de un mes para caducar
        """
        try:
            # Parsear la fecha de caducidad (formato ISO: YYYY-MM-DD)
            expiry_date = date.fromisoformat(itv_date_code)
            today = date.today()
            
            # Si ya pasó la fecha de caducidad
            if today > expiry_date:
                return 1  # caducado
            
            # Verificar si falta menos de un mes (30 días)
            days_until_expiry = (expiry_date - today).days
            if days_until_expiry < 30:
                return "warning"  # aviso: menos de un mes para caducar
            
            # Si está vigente
            return 0
        
        except (ValueError, TypeError):
            # Si hay error en el parseo de la fecha
            return 0  # por defecto considerar como vigente
        

plateService = PlatesItvService()
