"""
WindInsight • Wind Power Forecast Analysis API
Main FastAPI Application Entry Point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .data.repository import data_repository
from .routers import (
    health_router,
    analysis_router,
    timeseries_router,
    forecasts_router,
    quality_router,
    bmrs_router,
    auth_router,
    dataset_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: pre-loads and warms in-memory Pandas repositories."""
    print("[INFO] [WindInsight Backend] Initializing data repositories and pre-indexing datasets...")
    data_repository.initialize()
    print(f"[INFO] [WindInsight Backend] Loaded {len(data_repository.get_active_records())} settlement records in memory.")
    yield
    print("[INFO] [WindInsight Backend] Shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": str(request.url),
        },
    )

# Include all route modules
app.include_router(health_router)
app.include_router(analysis_router)
app.include_router(timeseries_router)
app.include_router(forecasts_router)
app.include_router(quality_router)
app.include_router(bmrs_router)
app.include_router(auth_router)
app.include_router(dataset_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
