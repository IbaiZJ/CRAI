import pandas as pd

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
    
    # replace SIN DISTINTIVO with 'n'
    df['BADGE'] = df['BADGE'].apply(lambda x: 'n' if isinstance(x, str) and x == 'SIN DISTINTIVO' else x)
    
    # add STOLEN column with empty values
    df['STOLEN'] = ''
    
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


