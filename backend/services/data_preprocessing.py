import pandas as pd
import os

def preprocess_upsc_data(input_file='backend/data/raw/upsc_prelims_data.csv'):
    """
    Cleans raw UPSC data and normalizes scores to a 0-100 percentage scale.
    """
    if not os.path.exists(input_file):
        print(f"❌ Error: {input_file} not found.")
        return

    # Load raw data
    df = pd.read_csv(input_file)

    # 1. Normalize GS Subjects (Raw marks are out of 25)
    gs_subjects = ['gs_history', 'gs_geography', 'gs_polity', 'gs_economy', 
                   'gs_sciencetech', 'gs_environment', 'gs_currentaffairs', 'gs_artculture']
    
    for sub in gs_subjects:
        df[f'{sub}_pct'] = (df[sub] / 25) * 100

    # 2. Normalize CSAT Sections (Scaling based on max recorded values)
    csat_sections = ['csat_comprehension', 'csat_logicalreasoning', 'csat_quantitative', 
                     'csat_datainterpretation', 'csat_decisionmaking']
    
    for sec in csat_sections:
        # Scale each section to 100 based on its own max to show relative performance
        df[f'{sec}_pct'] = (df[sec] / df[sec].max()) * 100

    # 3. Overall Performance
    df['gs_total_pct'] = (df['gs_total_score'] / 200) * 100
    df['csat_total_pct'] = (df['csat_total_score'] / 200) * 100

    # Create the processed directory if it doesn't exist
    output_dir = 'backend/data/processed/'
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the final version
    output_path = os.path.join(output_dir, 'upsc_prelims_processed.csv')
    df.to_csv(output_path, index=False)
    
    print(f"✅ Preprocessing complete! Processed data saved to: {output_path}")

if __name__ == "__main__":
    preprocess_upsc_data()