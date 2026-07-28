from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.schemas.complaint import RiskAssessmentData, ComplaintUpdate


class ChatMessage(BaseModel):
    id: str
    sender: str  # 'user' | 'assistant' | 'system'
    text: str
    timestamp: str
    fileAttachment: Optional[Dict[str, str]] = None
    riskAssessment: Optional[RiskAssessmentData] = None


class AiPromptRequest(BaseModel):
    prompt: str
    currentFormState: Optional[Dict[str, Any]] = None


class AiPromptResponse(BaseModel):
    responseMessage: str
    extractedUpdates: ComplaintUpdate
    lastUpdatedField: Optional[str] = None
    isEditMode: bool = False
    riskAssessment: Optional[RiskAssessmentData] = None


class AiDocumentExtractionResponse(BaseModel):
    filename: str
    extractedText: str
    autoFilledData: ComplaintUpdate
    riskAssessment: RiskAssessmentData
    message: str
