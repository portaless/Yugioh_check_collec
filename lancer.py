"""Lance l'IHM : python lancer.py  (ou bouton ▶ de VS Code sur ce fichier)."""
import subprocess
import sys
from pathlib import Path

APP = Path(__file__).resolve().parent / "app.py"

if __name__ == "__main__":
    subprocess.run([sys.executable, "-m", "streamlit", "run", str(APP)], cwd=APP.parent)
