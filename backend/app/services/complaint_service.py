from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.complaint_repository import ComplaintRepository
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate
from app.database.models import Complaint
from app.core.exceptions import NotFoundException
from app.core.logging import logger


class ComplaintService:
    """
    Business logic layer for pharmaceutical complaints, delegating DB queries to ComplaintRepository.
    """

    def __init__(self, db: Session):
        self.repository = ComplaintRepository(db)

    def create_complaint(self, data: ComplaintCreate) -> Complaint:
        complaint = self.repository.create(data)
        logger.info(f"ComplaintService: Successfully created complaint {complaint.id}")
        return complaint

    def get_complaint(self, complaint_id: str) -> Complaint:
        complaint = self.repository.get_by_id(complaint_id)
        if not complaint:
            raise NotFoundException(resource="Complaint", resource_id=complaint_id)
        return complaint

    def get_all_complaints(self, limit: int = 100, skip: int = 0) -> List[Complaint]:
        return self.repository.get_all(limit=limit, skip=skip)

    def update_complaint(self, complaint_id: str, data: ComplaintUpdate) -> Complaint:
        complaint = self.get_complaint(complaint_id)
        updated_complaint = self.repository.update(complaint, data)
        logger.info(f"ComplaintService: Successfully updated complaint {complaint_id}")
        return updated_complaint
