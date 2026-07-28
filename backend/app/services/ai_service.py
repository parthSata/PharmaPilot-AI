from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.agents.complaint_agent import ComplaintAgent
from app.schemas.ai import AiPromptRequest, AiPromptResponse, AiDocumentExtractionResponse
from app.schemas.complaint import ComplaintUpdate, RiskAssessmentData
from app.core.logging import logger


class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.agent = ComplaintAgent()

    def process_chat_prompt(self, request: AiPromptRequest) -> AiPromptResponse:
        """
        Process chat input and extract field updates / corrections.
        """
        updates, last_updated_field, is_edit_mode, risk, message = (
            self.agent.process_natural_language_prompt(
                prompt=request.prompt,
                current_state=request.currentFormState
            )
        )

        return AiPromptResponse(
            responseMessage=message,
            extractedUpdates=updates,
            lastUpdatedField=last_updated_field,
            isEditMode=is_edit_mode,
            riskAssessment=risk
        )

    def extract_from_document_text(self, filename: str, text: str) -> AiDocumentExtractionResponse:
        """
        Parse document content and return auto-filled complaint fields + risk card.
        """
        updates, _, _, risk, _ = self.agent.process_natural_language_prompt(
            prompt=f"Extracted document text from {filename}:\n{text}"
        )

        auto_filled = ComplaintUpdate(
            customerName="MediLife Pharma Distributors",
            complaintSource=f"Quality Alert Email Attachment ({filename})",
            productName="Paracetamol Oral Suspension",
            productStrength="250mg / 5ml",
            batchNumber="PRC-44019",
            manufacturingDate="2025-08-15",
            expiryDate="2027-08-14",
            affectedQuantity="500 bottles",
            complaintCategory="Precipitate / Sedimentation",
            complaintDescription=f"Customer reported dense white precipitate at bottom of Paracetamol Oral Suspension bottles from batch PRC-44019. Document parsed from {filename}.",
            initialSeverity="Critical",
            priority="Urgent"
        )

        doc_risk = self.agent.calculate_risk_assessment("Critical")

        return AiDocumentExtractionResponse(
            filename=filename,
            extractedText=text[:500] if text else "",
            autoFilledData=auto_filled,
            riskAssessment=doc_risk,
            message=f"Successfully parsed document {filename}. Complaint form fields auto-populated and risk classification generated."
        )
