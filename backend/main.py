import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.core.logging import logger
from app.core.exceptions import AppException
from app.database.database import init_db

from app.api.routes.complaint import router as complaint_router
from app.api.routes.ai import router as ai_router
from app.api.routes.upload import router as upload_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context: initialize directories and database tables.
    """
    logger.info("Initializing PharmaPilot AI Backend...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.STATIC_DIR, exist_ok=True)
    init_db()
    yield
    logger.info("Shutting down PharmaPilot AI Backend.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI Application backend for Pharmaceutical Complaint Management & Risk Assessment",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for custom AppExceptions
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "extra": exc.extra}
    )


# Ensure mount directories exist prior to mounting
os.makedirs(settings.STATIC_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount Static and Upload directories
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Include API Routers under /api/v1
app.include_router(complaint_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(upload_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "status": "online",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
