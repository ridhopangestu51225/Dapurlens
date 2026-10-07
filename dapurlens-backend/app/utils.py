import re

def slugify(text: str) -> str:
    """
    ubah "Nasi Goreng" jadi "nasi-goreng", "Nasi_Goreng" jadi "nasi-goreng", "Nasi Goreng!" jadi "nasi-goreng"
    1. Convert to lowercase
    2. Replace spaces and underscores with hyphens
    3. Remove any non-alphanumeric characters except hyphens
    """
    # Convert to lowercase
    text = text.lower()
    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    # Remove any non-alphanumeric characters except hyphens
    text = re.sub(r'[^a-z0-9-]', '', text)
    # Remove leading and trailing hyphens
    text = text.strip('-')
    
    return text