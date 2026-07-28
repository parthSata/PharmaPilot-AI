from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.services.complaint_service import ComplaintService
from app.api.dependencies import get_complaint_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    data: ComplaintCreate,
    service: ComplaintService = Depends(get_complaint_service)
):
    """
    Create a new pharmaceutical complaint record.
    """
    return service.create_complaint(data)


@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    limit: int = 50,
    skip: int = 0,
    service: ComplaintService = Depends(get_complaint_service)
):
    """
    Retrieve all complaint records with pagination.
    """
    return service.get_all_complaints(limit=limit, skip=skip)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_by_id(
    complaint_id: str,
    service: ComplaintService = Depends(get_complaint_service)
):
    """
    Retrieve a specific complaint record by UUID.
    """
    return service.get_complaint(complaint_id)


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: str,
    data: ComplaintUpdate,
    service: ComplaintService = Depends(get_complaint_service)
):
    """
    Update details or risk assessment of an existing complaint.
    """
    return service.update_complaint(complaint_id, data)
