import json
from pathlib import Path
from typing import List


def load_json_file(filename: str) -> List[dict]:
    """Charge un fichier JSON depuis le répertoire backend."""
    base_dir = Path(__file__).resolve().parent.parent
    file_path = base_dir / filename
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Erreur: Le fichier {filename} n'a pas été trouvé.")
        return []
    except json.JSONDecodeError:
        print(f"Erreur: Le fichier {filename} n'est pas un JSON valide.")
        return []
