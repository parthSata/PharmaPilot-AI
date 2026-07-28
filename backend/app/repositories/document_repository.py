from typing import Optional
from sqlalchemy.orm import Session
from app.database.models import DocumentAttachment
from app.core.logging import logger


class DocumentRepository:
    """
    Repository pattern encapsulating all SQLAlchemy database operations for DocumentAttachment entities.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        complaint_id: Optional[str],
        filename: str,
        file_path: str,
        file_size_bytes: int,
        mime_type: str,
        extracted_text: str,
    ) -> DocumentAttachment:
        attachment = DocumentAttachment(
            complaint_id=complaint_id,
            filename=filename,
            file_path=file_path,
            file_size_bytes=file_size_bytes,
            mime_type=mime_type,
            extracted_text=extracted_text,
        )
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        logger.info(f"Recorded document attachment in DB: {filename}")
        return attachment
