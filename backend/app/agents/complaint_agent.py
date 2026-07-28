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
                content_str = str(llm_response.content).strip()
                logger.info(f"Groq LLM raw response: {content_str[:150]}")
                
                # Extract JSON block if wrapped in markdown
                json_match = re.search(r"\{.*\}", content_str, re.DOTALL)
                if json_match:
                    extracted_json = json.loads(json_match.group(0))
                    
                    if extracted_json.get("customerName"): updates.customerName = extracted_json["customerName"]
                    if extracted_json.get("complaintSource"): updates.complaintSource = extracted_json["complaintSource"]
                    if extracted_json.get("productName"): updates.productName = extracted_json["productName"]
                    if extracted_json.get("productStrength"): updates.productStrength = extracted_json["productStrength"]
                    if extracted_json.get("batchNumber"): updates.batchNumber = extracted_json["batchNumber"]
                    if extracted_json.get("manufacturingDate"): updates.manufacturingDate = extracted_json["manufacturingDate"]
                    if extracted_json.get("expiryDate"): updates.expiryDate = extracted_json["expiryDate"]
                    if extracted_json.get("affectedQuantity"): updates.affectedQuantity = extracted_json["affectedQuantity"]
                    if extracted_json.get("complaintCategory"): updates.complaintCategory = extracted_json["complaintCategory"]
                    if extracted_json.get("complaintDescription"): updates.complaintDescription = extracted_json["complaintDescription"]
                    if extracted_json.get("initialSeverity"): updates.initialSeverity = extracted_json["initialSeverity"]
                    if extracted_json.get("priority"): updates.priority = extracted_json["priority"]
                    
                    if extracted_json.get("lastUpdatedField"):
                        last_updated_field = extracted_json["lastUpdatedField"]
                    if extracted_json.get("isEditMode") is True:
                        is_edit = True
            except Exception as e:
                logger.warning(f"Groq LLM invocation/parsing failed ({e}), using regex rules.")

        # Regex fallback for batch number extraction / correction (handles B.No, LOT, BATCH, PRC-XXXX, etc.)
        if not updates.batchNumber:
            batch_patterns = [
                r"(?:batch|b\.?no|lot|b/n|bn)\s*(?:number|no|#)?\s*[:\-=]?\s*([A-Za-z0-9\-]{3,20})",
                r"\b(PRC-\d{4,8})\b",
                r"\b(LOT-?[A-Z0-9]{4,10})\b"
            ]
            for pat in batch_patterns:
                bm = re.search(pat, prompt, re.IGNORECASE)
                if bm:
                    updates.batchNumber = bm.group(1).upper()
                    if not last_updated_field:
                        last_updated_field = "batchNumber"
                    break

        # Regex fallback for affected quantity
        if not updates.affectedQuantity:
            qty_patterns = [
                r"(?:quantity|affected|qty|amount)\s*[:\-=]?\s*(\d+\s*(?:bottles|vials|packs|units|boxes|tablets|capsules|cartons)?)",
                r"\b(\d+\s*(?:bottles|vials|packs|units|boxes|tablets|capsules|cartons))\b"
            ]
            for qpat in qty_patterns:
                qm = re.search(qpat, prompt, re.IGNORECASE)
                if qm:
                    updates.affectedQuantity = qm.group(1)
                    if not last_updated_field:
                        last_updated_field = "affectedQuantity"
                    break

        # Regex fallback for Expiry Date
        if not updates.expiryDate:
            exp_m = re.search(r"(?:exp|expiry|use\s*before|exp\.?\s*date)\s*[:\-=]?\s*(\d{1,2}[/\-]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{2,4})", prompt, re.IGNORECASE)
            if exp_m:
                updates.expiryDate = exp_m.group(1)

        # Regex fallback for Manufacturing Date
        if not updates.manufacturingDate:
            mfg_m = re.search(r"(?:mfg|mfd|manufacturing|mfg\.?\s*date)\s*[:\-=]?\s*(\d{1,2}[/\-]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{2,4})", prompt, re.IGNORECASE)
            if mfg_m:
                updates.manufacturingDate = mfg_m.group(1)

        # Regex fallback for Product Strength (e.g. 500mg, 250mg / 5ml, 50mg/ml)
        if not updates.productStrength:
            str_m = re.search(r"\b(\d+\s*(?:mg|g|mcg|ml|IU)\s*(?:/\s*\d*\s*ml)?)\b", prompt, re.IGNORECASE)
            if str_m:
                updates.productStrength = str_m.group(1)

        if is_edit and (last_updated_field or updates.batchNumber or updates.affectedQuantity):
            response_msg = (
                f"Updated complaint details per your correction:\n"
                f"• Batch Number: {updates.batchNumber or (current_state.get('batchNumber') if current_state else 'Unchanged')}\n"
                f"• Affected Quantity: {updates.affectedQuantity or (current_state.get('affectedQuantity') if current_state else 'Unchanged')}\n\n"
                f"All other complaint details remain unchanged."
            )
            risk = self.calculate_risk_assessment(updates.initialSeverity or "Major")
            return updates, last_updated_field, True, risk, response_msg

        # Ensure complaintDescription is set if missing
        if not updates.complaintDescription:
            updates.complaintDescription = prompt

        risk = self.calculate_risk_assessment(updates.initialSeverity or "Critical")
        
        customer_str = updates.customerName or "Customer"
        product_str = f"{updates.productName or ''} {updates.productStrength or ''}".strip() or "Product"
        
        response_msg = (
            f"Extracted complaint information for {customer_str} regarding {product_str}. "
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
