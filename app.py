import os
import sys
from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# Ensure root directory is on Python path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.core.config import PORT, HOST
from src.api.routes import router as api_router

app = FastAPI(
    title="Supply Chain Disruption Response Assistant",
    description="Agentic Disruption Response Assistant for Distributors (PS08)",
    version="1.0.0"
)

# Enable CORS for local testing and embedding
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Mount static files for the frontend UI
STATIC_DIR = ROOT_DIR / "src" / "static"
if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PS08 Disruption Assistant", "port": PORT}

@app.get("/login")
def serve_login():
    login_file = STATIC_DIR / "login.html"
    if login_file.exists():
        return FileResponse(str(login_file))
    return FileResponse(str(STATIC_DIR / "index.html"))

# Mount static files at /static and at root / so both /static/... and ./... asset links resolve cleanly
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="root_static")

if __name__ == "__main__":
    print("=" * 70)
    print(f"Starting Supply Chain Disruption Response Assistant on http://127.0.0.1:{PORT}")
    print(f"FastAPI Interactive Swagger Docs: http://127.0.0.1:{PORT}/docs")
    print("=" * 70)
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
