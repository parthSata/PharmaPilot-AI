from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.complaint_service import ComplaintService
from app.services.upload_service import UploadService
from app.services.ai_service import AIService


def get_complaint_service(db: Session = Depends(get_db)) -> ComplaintService:
    return ComplaintService(db)


def get_upload_service(db: Session = Depends(get_db)) -> UploadService:
    return UploadService(db)


def get_ai_service(db: Session = Depends(get_db)) -> AIService:
    return AIService(db)
