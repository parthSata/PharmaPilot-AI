import re
from typing import List
from app.config.settings import settings
from app.core.exceptions import ValidationException


def validate_batch_number(batch_number: str) -> bool:
    """
    Validate pharmaceutical batch number format (e.g. PRC-44019 or alphanumeric string).
    """
    if not batch_number or len(batch_number.strip()) < 3:
        return False
    return bool(re.match(r"^[A-Za-z0-9\-_]{3,30}$", batch_number.strip()))


def validate_file_extension(filename: str, allowed_extensions: List[str] = None) -> str:
    """
    Validate and return the file extension if allowed.
    """
    allowed = allowed_extensions or settings.ALLOWED_EXTENSIONS
    if "." not in filename:
        raise ValidationException(detail=f"Filename '{filename}' has no extension.")
    
    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in allowed:
        raise ValidationException(
            detail=f"File extension '.{ext}' is not supported. Allowed extensions: {allowed}"
        )
    return ext
