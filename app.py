"""
Entry point for Streamlit Community Cloud.
Redirects execution to streamlit_app.py.
"""
from pathlib import Path
import runpy

app_path = Path(__file__).resolve().parent / "streamlit_app.py"
runpy.run_path(str(app_path), run_name="__main__")

