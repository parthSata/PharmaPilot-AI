from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class RiskAssessmentData(BaseModel):
    riskScore: str = "HIGH"
    riskLevel: str = "High Risk (Action Required)"
    scoreValue: int = 82
    matrixScore: str = "16 / 25 (Category A)"
    keyFactors: List[str] = Field(
        default_factory=lambda: [
            "Particulate contamination in oral dosage form",
            "Multiple distribution batches potentially affected",
            "Requires immediate CAPA investigation"
        ]
    )
    recommendedActions: List[str] = Field(
        default_factory=lambda: [
            "Initiate quarantine for batch PRC-44019",
            "Notify Quality Assurance Lead within 2 hours",
            "Request sample return from distributor for lab assay"
        ]
    )
    regulatoryComplianceNote: str = "GAMP 5 & ICH Q9 Quality Risk Management framework complaint level: High Priority."


class ComplaintBase(BaseModel):
    customerName: str = Field(..., alias="customer_name")
    complaintSource: str = Field(..., alias="complaint_source")
    productName: str = Field(..., alias="product_name")
    productStrength: str = Field(..., alias="product_strength")
    batchNumber: str = Field(..., alias="batch_number")
    manufacturingDate: Optional[str] = Field(None, alias="manufacturing_date")
    expiryDate: Optional[str] = Field(None, alias="expiry_date")
    affectedQuantity: Optional[str] = Field(None, alias="affected_quantity")
    complaintCategory: str = Field(..., alias="complaint_category")
    complaintDescription: Optional[str] = Field(None, alias="complaint_description")
    initialSeverity: str = Field("Critical", alias="initial_severity")
    priority: str = Field("Urgent")

    class Config:
        populate_by_name = True
        from_attributes = True


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintUpdate(BaseModel):
    customerName: Optional[str] = Field(None, alias="customer_name")
    complaintSource: Optional[str] = Field(None, alias="complaint_source")
    productName: Optional[str] = Field(None, alias="product_name")
    productStrength: Optional[str] = Field(None, alias="product_strength")
    batchNumber: Optional[str] = Field(None, alias="batch_number")
    manufacturingDate: Optional[str] = Field(None, alias="manufacturing_date")
    expiryDate: Optional[str] = Field(None, alias="expiry_date")
    affectedQuantity: Optional[str] = Field(None, alias="affected_quantity")
    complaintCategory: Optional[str] = Field(None, alias="complaint_category")
    complaintDescription: Optional[str] = Field(None, alias="complaint_description")
    initialSeverity: Optional[str] = Field(None, alias="initial_severity")
    priority: Optional[str] = Field(None)
    status: Optional[str] = Field(None)
    riskAssessment: Optional[RiskAssessmentData] = Field(None, alias="risk_assessment")

    class Config:
        populate_by_name = True
        from_attributes = True


class ComplaintResponse(ComplaintBase):
    id: str
    status: str = "Open"
    riskAssessment: Optional[RiskAssessmentData] = Field(None, alias="risk_assessment")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")

    class Config:
        populate_by_name = True
        from_attributes = True
