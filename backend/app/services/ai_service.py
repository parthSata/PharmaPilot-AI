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
        Parse document content and return auto-filled complaint fields + risk card using Groq AI.
        """
        prompt_text = f"Extract pharmaceutical complaint details from uploaded document file {filename}:\n{text}" if text.strip() else f"Process quality document attachment: {filename}"
        
        updates, _, _, risk, message = self.agent.process_natural_language_prompt(
            prompt=prompt_text
        )

        if not updates.complaintSource:
            updates.complaintSource = f"Quality Alert Attachment ({filename})"

        return AiDocumentExtractionResponse(
            filename=filename,
            extractedText=text[:500] if text else "Document content parsed.",
            autoFilledData=updates,
            riskAssessment=risk or self.agent.calculate_risk_assessment("Critical"),
            message=message or f"Successfully parsed document {filename} using Groq AI."
        )
