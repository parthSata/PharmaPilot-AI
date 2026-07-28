import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_name = Column(String(255), nullable=False, default="MediLife Pharma Distributors")
    complaint_source = Column(String(255), nullable=False, default="Quality Alert Email Attachment (PDF)")
    product_name = Column(String(255), nullable=False, default="Paracetamol Oral Suspension")
    product_strength = Column(String(100), nullable=False, default="250mg / 5ml")
    batch_number = Column(String(100), nullable=False, default="PRC-44019")
    manufacturing_date = Column(String(50), nullable=True, default="2025-08-15")
    expiry_date = Column(String(50), nullable=True, default="2027-08-14")
    affected_quantity = Column(String(100), nullable=True, default="500 bottles")
    complaint_category = Column(String(150), nullable=False, default="Precipitate / Sedimentation")
    complaint_description = Column(Text, nullable=True)
    initial_severity = Column(String(50), nullable=False, default="Critical")
    priority = Column(String(50), nullable=False, default="Urgent")
    status = Column(String(50), nullable=False, default="Open")
    
    risk_assessment = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    attachments = relationship("DocumentAttachment", back_populates="complaint", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")


class DocumentAttachment(Base):
    __tablename__ = "document_attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    mime_type = Column(String(100), nullable=False)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="attachments")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="audit_logs")
