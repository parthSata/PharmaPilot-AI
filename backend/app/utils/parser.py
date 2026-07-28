import os
from pypdf import PdfReader
from app.core.logging import logger


def extract_text_from_file(file_path: str) -> str:
    """
    Extract raw text from PDF or text file.
    """
    if not os.path.exists(file_path):
        logger.error(f"File path not found: {file_path}")
        return ""

    ext = file_path.rsplit(".", 1)[-1].lower()

    if ext == "pdf":
        try:
            reader = PdfReader(file_path)
            extracted = []
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    extracted.append(text)
            return "\n".join(extracted)
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            return f"[PDF parsing fallback text for file: {os.path.basename(file_path)}]"

    elif ext in ["txt", "csv", "log"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {e}")
            return ""

    return f"[Uploaded file: {os.path.basename(file_path)}]"
