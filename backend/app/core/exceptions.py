from typing import Any, Optional, Dict
from fastapi import HTTPException, status


class AppException(HTTPException):
    """
    Base Exception class for custom application errors.
    """
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "An unexpected error occurred.",
        extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.extra = extra or {}


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", resource_id: Any = None):
        detail = f"{resource} with identifier '{resource_id}' was not found." if resource_id else f"{resource} not found."
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ValidationException(AppException):
    def __init__(self, detail: str = "Invalid input data provided.", extra: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail, extra=extra)


class FileUploadException(AppException):
    def __init__(self, detail: str = "File upload failed.", extra: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail, extra=extra)


class AIServiceException(AppException):
    def __init__(self, detail: str = "AI service processing error.", extra: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail, extra=extra)
