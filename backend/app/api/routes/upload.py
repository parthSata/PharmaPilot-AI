from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status
from app.schemas.ai import AiDocumentExtractionResponse
from app.services.upload_service import UploadService
from app.services.ai_service import AIService
from app.api.dependencies import get_upload_service, get_ai_service

router = APIRouter(prefix="/upload", tags=["Document Upload"])


@router.post("/", response_model=AiDocumentExtractionResponse, status_code=status.HTTP_201_CREATED)
async def upload_document_and_extract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    complaint_id: Optional[str] = Form(None),
    upload_service: UploadService = Depends(get_upload_service),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Upload quality document (PDF/Image), save record, and execute extraction pipeline in background worker.
    """
    attachment = await upload_service.save_uploaded_file(file=file, complaint_id=complaint_id)
    
    # Schedule background processing task for extraction
    background_tasks.add_task(
        upload_service.process_document_background,
        attachment_id=attachment.id,
        filename=attachment.filename,
        text=attachment.extracted_text or ""
    )

    extraction_res = ai_service.extract_from_document_text(
        filename=attachment.filename,
        text=attachment.extracted_text or ""
    )
    return extraction_res
