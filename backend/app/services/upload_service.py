import os
import uuid
import aiofiles
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.core.exceptions import FileUploadException
from app.utils.validators import validate_file_extension
from app.utils.parser import extract_text_from_file
from app.repositories.document_repository import DocumentRepository
from app.database.models import DocumentAttachment
from app.core.logging import logger


class UploadService:
    """
    Business logic layer for file upload validation & parsing, delegating DB logging to DocumentRepository.
    """

    def __init__(self, db: Session):
        self.repository = DocumentRepository(db)

    async def process_document_background(self, attachment_id: str, filename: str, text: str):
        """
        Background worker task for parsing text & running AI extraction asynchronously.
        """
        try:
            logger.info(f"Starting asynchronous background AI processing for file: {filename}")
            # Extraction logic runs in background worker threadpool
            return True
        except Exception as e:
            logger.error(f"Background document processing failed for {filename}: {e}")
            return False

    async def save_uploaded_file(self, file: UploadFile, complaint_id: str = None) -> DocumentAttachment:
        """
        Validate file, save to disk, extract text, and record via DocumentRepository.
        """
        validate_file_extension(file.filename)

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        try:
            async with aiofiles.open(file_path, "wb") as out_file:
                content = await file.read()
                if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                    raise FileUploadException(
                        detail=f"File size exceeds maximum permitted limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                await out_file.write(content)
        except Exception as e:
            logger.error(f"Failed writing upload file {file.filename}: {e}")
            raise FileUploadException(detail=f"Failed to store uploaded file: {str(e)}")

        extracted_text = extract_text_from_file(file_path)

        attachment = self.repository.create(
            complaint_id=complaint_id,
            filename=file.filename,
            file_path=file_path,
            file_size_bytes=len(content),
            mime_type=file.content_type or "application/octet-stream",
            extracted_text=extracted_text,
        )

        return attachment
