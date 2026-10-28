"""
FastAPI Server Launcher Script for WindInsight Backend
Starts the Uvicorn server on port 8000 with auto-reload.
"""

import sys
import os
from pathlib import Path

# Add the Backend directory to sys.path so app can be imported cleanly
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"[INFO] Starting WindInsight Backend on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
