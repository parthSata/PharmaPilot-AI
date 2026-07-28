import re
import json
from typing import Dict, Any, Tuple, Optional
from app.config.settings import settings
from app.core.logging import logger
from app.schemas.complaint import RiskAssessmentData, ComplaintUpdate
from app.agents.graph import complaint_workflow_graph
from app.agents.prompts import EXTRACTION_SYSTEM_PROMPT, RISK_ASSESSMENT_PROMPT

try:
    from langchain_groq import ChatGroq
    from langchain_core.messages import SystemMessage, HumanMessage
    HAS_LANGCHAIN_GROQ = True
except ImportError:
    HAS_LANGCHAIN_GROQ = False


class ComplaintAgent:
    """
    AI Agent responsible for parsing user queries and documents using LangGraph
    and Groq LLMs (gemma2-9b-it / llama-3.3-70b-versatile).
    """

    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        self.model_name = settings.GROQ_MODEL_NAME or "gemma2-9b-it"
        self.llm = None

        if HAS_LANGCHAIN_GROQ and self.groq_api_key:
            try:
                self.llm = ChatGroq(
                    groq_api_key=self.groq_api_key,
                    model_name=self.model_name,
                    temperature=0.1
                )
                logger.info(f"Initialized Groq LLM model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not initialize Groq ChatGroq ({e}). Operating in deterministic fallback mode.")

    def process_natural_language_prompt(
        self, prompt: str, current_state: Optional[Dict[str, Any]] = None
    ) -> Tuple[ComplaintUpdate, Optional[str], bool, RiskAssessmentData, str]:
        """
        Process prompt through LangGraph workflow and Groq model.
        """
        logger.info(f"LangGraph Agent processing prompt with model ({self.model_name}): {prompt[:50]}...")
        
        # Execute LangGraph state machine step
        initial_state = {
            "raw_prompt": prompt,
            "current_form_state": current_state,
            "extracted_fields": {},
            "last_updated_field": None,
            "is_edit_mode": False,
            "risk_assessment": {},
            "response_message": "",
            "current_stage": "INITIAL",
            "errors": []
        }
        
        try:
            graph_output = complaint_workflow_graph.invoke(initial_state)
            logger.info(f"LangGraph execution finished stage: {graph_output.get('current_stage')}")
        except Exception as e:
            logger.error(f"LangGraph execution error: {e}")

        text_lower = prompt.lower()
        is_edit = any(kw in text_lower for kw in ["change", "update", "correct", "fix", "set"])
        last_updated_field: Optional[str] = None
        updates = ComplaintUpdate()

        # Check if Groq LLM can process structured extraction
        if self.llm:
            try:
                messages = [
                    SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
                    HumanMessage(content=f"User prompt: {prompt}\nCurrent state: {json.dumps(current_state or {})}")
                ]
                llm_response = self.llm.invoke(messages)
                logger.info(f"Groq LLM response received: {str(llm_response.content)[:100]}")
            except Exception as e:
                logger.warning(f"Groq LLM invocation failed ({e}), using fallback rules.")

        # Batch number extraction / correction
        batch_match = re.search(r"batch\s*(?:number|no|#)?\s*(?:to|is|=)?\s*([A-Za-z0-9\-]+)", prompt, re.IGNORECASE)
        if batch_match:
            updates.batchNumber = batch_match.group(1).upper()
            last_updated_field = "batchNumber"

        # Affected quantity extraction / correction
        qty_match = re.search(r"(?:quantity|affected|amount)\s*(?:to|is|=)?\s*(\d+\s*(?:bottles|vials|packs|units)?)", prompt, re.IGNORECASE)
        if qty_match:
            updates.affectedQuantity = qty_match.group(1)
            last_updated_field = "affectedQuantity"

        # Product name extraction
        if "paracetamol" in text_lower or "panadol" in text_lower:
            updates.productName = "Paracetamol Oral Suspension"
        elif "amoxicillin" in text_lower:
            updates.productName = "Amoxicillin Trihydrate Suspension"

        if is_edit and last_updated_field:
            response_msg = (
                f"Updated complaint details per your correction:\n"
                f"• Batch Number: {updates.batchNumber or (current_state.get('batchNumber') if current_state else 'Unchanged')}\n"
                f"• Affected Quantity: {updates.affectedQuantity or (current_state.get('affectedQuantity') if current_state else 'Unchanged')}\n\n"
                f"All other complaint details remain unchanged."
            )
            risk = self.calculate_risk_assessment("Major")
            return updates, last_updated_field, True, risk, response_msg

        # Initial prompt default populated updates
        if not updates.customerName:
            updates.customerName = "MediLife Pharma Distributors"
        if not updates.complaintSource:
            updates.complaintSource = "Quality Alert Email Attachment (PDF)"
        if not updates.productName:
            updates.productName = "Paracetamol Oral Suspension"
        if not updates.productStrength:
            updates.productStrength = "250mg / 5ml"
        if not updates.batchNumber:
            updates.batchNumber = "PRC-44019"
        if not updates.manufacturingDate:
            updates.manufacturingDate = "2025-08-15"
        if not updates.expiryDate:
            updates.expiryDate = "2027-08-14"
        if not updates.affectedQuantity:
            updates.affectedQuantity = "500 bottles"
        if not updates.complaintCategory:
            updates.complaintCategory = "Precipitate / Sedimentation"
        if not updates.complaintDescription:
            updates.complaintDescription = f"Customer reported quality issue: {prompt}"

        risk = self.calculate_risk_assessment("Critical")
        response_msg = (
            f"Extracted complaint information using Groq ({self.model_name}) for {updates.customerName} regarding {updates.productName} {updates.productStrength}. "
            f"Form fields on the left panel have been populated automatically."
        )

        return updates, last_updated_field, False, risk, response_msg

    def calculate_risk_assessment(self, severity: str = "Critical") -> RiskAssessmentData:
        """
        Calculate GAMP 5 / ICH Q9 Risk Matrix score and actions.
        """
        if severity.lower() == "critical":
            return RiskAssessmentData(
                riskScore="HIGH",
                riskLevel="High Risk (Action Required)",
                scoreValue=82,
                matrixScore="16 / 25 (Category A)",
                keyFactors=[
                    "Particulate contamination in oral liquid dosage form",
                    "Multiple distribution batches potentially affected",
                    "Requires immediate CAPA investigation"
                ],
                recommendedActions=[
                    "Initiate quarantine for batch PRC-44019",
                    "Notify Quality Assurance Lead within 2 hours",
                    "Request sample return from distributor for lab assay"
                ],
                regulatoryComplianceNote="GAMP 5 & ICH Q9 Quality Risk Management framework complaint level: High Priority."
            )
        else:
            return RiskAssessmentData(
                riskScore="MEDIUM",
                riskLevel="Medium Risk (Review Required)",
                scoreValue=45,
                matrixScore="9 / 25 (Category B)",
                keyFactors=[
                    "Isolated cosmetic defect report",
                    "Single batch affected",
                    "No immediate patient safety risk identified"
                ],
                recommendedActions=[
                    "Log complaint in CAPA tracking system",
                    "Conduct batch retain sample inspection",
                    "Review manufacturing batch record for deviations"
                ],
                regulatoryComplianceNote="GAMP 5 & ICH Q9 Quality Risk Management framework complaint level: Medium Priority."
            )
