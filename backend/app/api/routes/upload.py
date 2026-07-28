from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from app.schemas.ai import AiDocumentExtractionResponse
from app.services.upload_service import UploadService
from app.services.ai_service import AIService
from app.api.dependencies import get_upload_service, get_ai_service

router = APIRouter(prefix="/upload", tags=["Document Upload"])


@router.post("/", response_model=AiDocumentExtractionResponse, status_code=status.HTTP_201_CREATED)
async def upload_document_and_extract(
    file: UploadFile = File(...),
    complaint_id: Optional[str] = Form(None),
    upload_service: UploadService = Depends(get_upload_service),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Upload quality document (PDF/Image), extract text, auto-fill form, and calculate risk.
    """
    attachment = await upload_service.save_uploaded_file(file=file, complaint_id=complaint_id)
    
    extraction_res = ai_service.extract_from_document_text(
        filename=attachment.filename,
        text=attachment.extracted_text or ""
    )
    return extraction_res
