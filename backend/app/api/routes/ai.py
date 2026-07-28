from fastapi import APIRouter, Depends
from app.schemas.ai import AiPromptRequest, AiPromptResponse
from app.schemas.complaint import RiskAssessmentData
from app.services.ai_service import AIService
from app.api.dependencies import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI Agent"])


@router.post("/process-prompt", response_model=AiPromptResponse)
def process_ai_prompt(
    request: AiPromptRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Process natural language instructions to auto-fill or update complaint fields.
    """
    return ai_service.process_chat_prompt(request)


@router.get("/risk-assessment", response_model=RiskAssessmentData)
def get_risk_assessment(
    severity: str = "Critical",
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Calculate and retrieve dynamic ICH Q9 Quality Risk Assessment matrix.
    """
    return ai_service.agent.calculate_risk_assessment(severity)
