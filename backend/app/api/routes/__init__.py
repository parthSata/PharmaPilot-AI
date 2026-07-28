from app.api.routes.complaint import router as complaint_router
from app.api.routes.ai import router as ai_router
from app.api.routes.upload import router as upload_router

__all__ = ["complaint_router", "ai_router", "upload_router"]
