from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import Complaint, AuditLog
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate


class ComplaintRepository:
    """
    Repository pattern encapsulating all SQLAlchemy database operations for Complaint entities.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: ComplaintCreate) -> Complaint:
        db_obj = Complaint(
            customer_name=data.customerName,
            complaint_source=data.complaintSource,
            product_name=data.productName,
            product_strength=data.productStrength,
            batch_number=data.batchNumber,
            manufacturing_date=data.manufacturingDate,
            expiry_date=data.expiryDate,
            affected_quantity=data.affectedQuantity,
            complaint_category=data.complaintCategory,
            complaint_description=data.complaintDescription,
            initial_severity=data.initialSeverity,
            priority=data.priority,
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        audit = AuditLog(complaint_id=db_obj.id, action="CREATED", details="Complaint record created.")
        self.db.add(audit)
        self.db.commit()
        return db_obj

    def get_by_id(self, complaint_id: str) -> Optional[Complaint]:
        return self.db.query(Complaint).filter(Complaint.id == complaint_id).first()

    def get_all(self, limit: int = 100, skip: int = 0) -> List[Complaint]:
        return self.db.query(Complaint).order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

    def update(self, complaint: Complaint, data: ComplaintUpdate) -> Complaint:
        update_dict = data.model_dump(exclude_unset=True, by_alias=False)
        for field, value in update_dict.items():
            if value is not None:
                if field == "riskAssessment":
                    setattr(complaint, "risk_assessment", value.model_dump() if hasattr(value, "model_dump") else value)
                elif hasattr(complaint, field):
                    setattr(complaint, field, value)

        self.db.commit()
        self.db.refresh(complaint)
        return complaint
