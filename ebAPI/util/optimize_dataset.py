import pandas as pd
import re

dataset_file_path = "../data/environmentalBadge.txt"


try:
    df = pd.read_csv(dataset_file_path, sep='|', header=None, dtype=str)
    # pon un limite de 100 filas que se van a guardar
    # df = df.head(100)
    
    # change column names FIRST
    df.columns = ['PLATE', 'BADGE']
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['PLATE'])

    # Sort by plate
    df = df.sort_values(by='PLATE')

    # remove 16 from badge codes
    df['BADGE'] = df['BADGE'].apply(lambda x: x[2:] if isinstance(x, str) and x.startswith("16") else x)
    
    # remove rows with 'SIN DISTINTIVO' in BADGE (case/whitespace insensitive)
    df = df.loc[~df['BADGE'].astype(str).str.strip().str.upper().eq('SIN DISTINTIVO')]
    
    def _normalize_plate(p):
        if not isinstance(p, str):
            return ''
        s = p.strip().upper()
        s = re.sub(r'[\s-]+', '', s)  # eliminar espacios y guiones
        return s

    df['PLATE'] = df['PLATE'].apply(_normalize_plate)

    allowed = "BCDFGHJKLMNPRSTVWXYZ"
    pattern = re.compile(r'^\d{4}[' + allowed + r']{3}$')

    df = df[df['PLATE'].astype(str).str.match(pattern)]
    
    # change NaN to empty string
    df = df.fillna('')

    df = df.astype(str)

    # change extension to .csv
    dataset_file_path = dataset_file_path.replace('.txt', '.csv')

    # Save the optimized dataset back to the file
    df.to_csv(dataset_file_path, sep=',', header=True, index=False)

    print("Dataset optimized successfully.")
except Exception as e:
    print(f"Error optimizing dataset: {str(e)}")


