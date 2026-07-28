from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.core.logging import logger


class ComplaintState(TypedDict):
    """
    TypedDict representing the state object in LangGraph for complaint workflows.
    """
    raw_prompt: str
    current_form_state: Optional[Dict[str, Any]]
    extracted_fields: Dict[str, Any]
    last_updated_field: Optional[str]
    is_edit_mode: bool
    risk_assessment: Dict[str, Any]
    response_message: str
    current_stage: str
    errors: List[str]


def parse_node(state: ComplaintState) -> Dict[str, Any]:
    """
    LangGraph Node 1: Parse input prompt and detect edit mode vs initial extraction.
    """
    logger.info("LangGraph Node: Executing parse_node...")
    prompt = state.get("raw_prompt", "")
    text_lower = prompt.lower()
    is_edit = any(kw in text_lower for kw in ["change", "update", "correct", "fix", "set"])
    return {
        "is_edit_mode": is_edit,
        "current_stage": "PARSED"
    }


def extract_node(state: ComplaintState) -> Dict[str, Any]:
    """
    LangGraph Node 2: Extract structured pharmaceutical complaint fields.
    """
    logger.info("LangGraph Node: Executing extract_node...")
    return {
        "current_stage": "EXTRACTED"
    }


def risk_assessment_node(state: ComplaintState) -> Dict[str, Any]:
    """
    LangGraph Node 3: Calculate ICH Q9 Quality Risk Assessment score and actions.
    """
    logger.info("LangGraph Node: Executing risk_assessment_node...")
    return {
        "current_stage": "ASSESSED"
    }


def build_complaint_graph() -> Any:
    """
    Build and compile a LangGraph StateGraph workflow for pharmaceutical complaint processing.
    """
    workflow = StateGraph(ComplaintState)

    workflow.add_node("parse", parse_node)
    workflow.add_node("extract", extract_node)
    workflow.add_node("risk_assessment", risk_assessment_node)

    workflow.set_entry_point("parse")
    workflow.add_edge("parse", "extract")
    workflow.add_edge("extract", "risk_assessment")
    workflow.add_edge("risk_assessment", END)

    app = workflow.compile()
    logger.info("Successfully compiled LangGraph Complaint Workflow StateGraph.")
    return app


# Singleton compiled graph instance
complaint_workflow_graph = build_complaint_graph()
