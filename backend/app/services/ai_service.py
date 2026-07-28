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
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        
        if text.strip():
            prompt_text = (
                f"The following text was extracted via OCR scan/parsing from uploaded document/image file '{filename}':\n\n"
                f"{text}\n\n"
                f"Extract all pharmaceutical complaint details including customer name, complaint source, product name, "
                f"product strength, batch number, manufacturing date, expiry date, affected quantity, complaint category, "
                f"complaint description, and initial severity."
            )
        else:
            prompt_text = f"Process quality document attachment: {filename}"

        updates, _, _, risk, message = self.agent.process_natural_language_prompt(
            prompt=prompt_text
        )

        # Set sensible complaint source and description defaults if LLM did not extract them
        if ext in ["png", "jpg", "jpeg", "webp", "bmp"]:
            if not updates.complaintSource:
                updates.complaintSource = f"Quality Defect Image ({filename})"
            if not updates.complaintDescription:
                cleaned_ocr_snippet = text.strip()[:300] if text.strip() else "Photo evidence attached."
                updates.complaintDescription = f"Quality complaint image uploaded '{filename}'. OCR scan: {cleaned_ocr_snippet}"
            if not updates.initialSeverity:
                updates.initialSeverity = "Major"
            if not updates.priority:
                updates.priority = "High"

        elif ext == "eml":
            if not updates.complaintSource:
                updates.complaintSource = f"Email Attachment ({filename})"
            if not updates.complaintCategory:
                updates.complaintCategory = "Customer Quality Inquiry"

        else:
            if not updates.complaintSource:
                updates.complaintSource = f"Quality Alert Attachment ({filename})"

        # Generate summary message highlighting extracted fields
        extracted_summary_items = []
        if updates.batchNumber: extracted_summary_items.append(f"Batch #{updates.batchNumber}")
        if updates.productName: extracted_summary_items.append(f"Product: {updates.productName}")
        if updates.customerName: extracted_summary_items.append(f"Customer: {updates.customerName}")
        
        if extracted_summary_items:
            final_message = f"Successfully parsed **{filename}**. Extracted: {', '.join(extracted_summary_items)}."
        else:
            final_message = message or f"Successfully parsed document **{filename}**."

        return AiDocumentExtractionResponse(
            filename=filename,
            extractedText=text[:500] if text else "Document content parsed.",
            autoFilledData=updates,
            riskAssessment=risk or self.agent.calculate_risk_assessment(updates.initialSeverity or "Major"),
            message=final_message
        )

