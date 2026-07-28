import os
import email
import shutil
from email import policy
from pypdf import PdfReader
from app.core.logging import logger

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    import pytesseract
    # Auto-detect Tesseract executable path on Windows if not already in PATH
    if not shutil.which("tesseract"):
        win_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for p in win_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                break
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False

try:
    import easyocr
    HAS_EASYOCR = True
except ImportError:
    HAS_EASYOCR = False

# Global lazy-initialized EasyOCR reader instance
_EASYOCR_READER = None


def _get_easyocr_reader():
    global _EASYOCR_READER
    if HAS_EASYOCR and _EASYOCR_READER is None:
        try:
            logger.info("Initializing EasyOCR reader instance...")
            _EASYOCR_READER = easyocr.Reader(["en"], gpu=False, verbose=False)
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR reader: {e}")
            _EASYOCR_READER = False
    return _EASYOCR_READER if _EASYOCR_READER else None


def preprocess_image_for_ocr(file_path: str):
    """
    Enhance photo contrast, sharpness, and scaling for optimal OCR text recognition.
    """
    if not HAS_PIL:
        return None

    try:
        img = Image.open(file_path)
        img = ImageOps.exif_transpose(img)

        # Upscale low-resolution images for better text line recognition
        width, height = img.size
        if width < 1200 or height < 1200:
            scale = max(1200 / width, 1200 / height)
            new_size = (int(width * scale), int(height * scale))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Convert to grayscale
        gray = img.convert("L")

        # Contrast enhancement
        enhancer = ImageEnhance.Contrast(gray)
        enhanced = enhancer.enhance(2.0)

        # Sharpness enhancement
        sharpener = ImageEnhance.Sharpness(enhanced)
        sharpened = sharpener.enhance(1.8)

        return sharpened
    except Exception as e:
        logger.warning(f"Image preprocessing failed for {file_path}: {e}")
        try:
            return Image.open(file_path)
        except Exception:
            return None


def extract_text_from_file(file_path: str) -> str:
    """
    Extract raw text from PDF, DOCX, EML (Email), Image (PNG/JPG/JPEG/WEBP), or Plain Text files.
    """
    if not os.path.exists(file_path):
        logger.error(f"File path not found: {file_path}")
        return ""

    ext = file_path.rsplit(".", 1)[-1].lower()
    filename = os.path.basename(file_path)

    # 1. PDF Documents
    if ext == "pdf":
        try:
            reader = PdfReader(file_path)
            extracted = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted.append(text)
            return "\n".join(extracted)
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            return f"[PDF parsing fallback text for file: {filename}]"

    # 2. DOCX Documents
    elif ext == "docx":
        if HAS_DOCX:
            try:
                doc = docx.Document(file_path)
                full_text = [p.text for p in doc.paragraphs if p.text]
                return "\n".join(full_text)
            except Exception as e:
                logger.error(f"Error reading DOCX {file_path}: {e}")
                return ""
        else:
            logger.warning("python-docx not installed.")
            return ""

    # 3. Email Files (.eml)
    elif ext == "eml":
        try:
            with open(file_path, "rb") as f:
                msg = email.message_from_binary_file(f, policy=policy.default)
            
            headers = []
            if msg["subject"]:
                headers.append(f"Subject: {msg['subject']}")
            if msg["from"]:
                headers.append(f"From: {msg['from']}")
            if msg["date"]:
                headers.append(f"Date: {msg['date']}")

            body_parts = []
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body_parts.append(payload.decode(part.get_content_charset("utf-8") or "utf-8", errors="ignore"))
            else:
                payload = msg.get_payload(decode=True)
                if payload:
                    body_parts.append(payload.decode(msg.get_content_charset("utf-8") or "utf-8", errors="ignore"))

            header_str = "\n".join(headers)
            body_str = "\n".join([b for b in body_parts if b.strip()])
            return f"--- EMAIL HEADERS ---\n{header_str}\n\n--- EMAIL BODY ---\n{body_str}"
        except Exception as e:
            logger.error(f"Error parsing EML file {file_path}: {e}")
            return f"[Email Quality Complaint File: {filename}]"

    # 4. Images (.png, .jpg, .jpeg, .webp, .bmp)
    elif ext in ["png", "jpg", "jpeg", "webp", "bmp"]:
        extracted_text_lines = []

        # Attempt 1: EasyOCR (PyTorch-based OCR engine)
        reader = _get_easyocr_reader()
        if reader:
            try:
                results = reader.readtext(file_path, detail=0)
                if results:
                    cleaned_easyocr = [res.strip() for res in results if res and len(res.strip()) > 1]
                    if cleaned_easyocr:
                        extracted_text_lines.extend(cleaned_easyocr)
                        logger.info(f"EasyOCR successfully extracted {len(cleaned_easyocr)} text lines from {filename}")
            except Exception as e:
                logger.warning(f"EasyOCR extraction failed for {filename}: {e}")

        # Attempt 2: PyTesseract OCR Engine
        if not extracted_text_lines and HAS_PYTESSERACT:
            try:
                processed_img = preprocess_image_for_ocr(file_path)
                if processed_img:
                    tesseract_text = pytesseract.image_to_string(processed_img)
                    if tesseract_text.strip():
                        lines = [line.strip() for line in tesseract_text.splitlines() if line.strip()]
                        extracted_text_lines.extend(lines)
                        logger.info(f"PyTesseract successfully extracted {len(lines)} lines from {filename}")
            except Exception as e:
                logger.warning(f"PyTesseract OCR extraction failed for {filename}: {e}")

        if extracted_text_lines:
            return "\n".join(extracted_text_lines)

        # Fallback metadata if no text could be recognized
        try:
            img = Image.open(file_path)
            res_str = f"{img.size[0]}x{img.size[1]}px"
        except Exception:
            res_str = "Unknown resolution"

        return (
            f"Uploaded Quality Defect Photo Image: {filename}.\n"
            f"Image Resolution: {res_str}.\n"
            f"Note: Visual inspection photo uploaded for pharmaceutical batch label, packaging, or product quality complaint."
        )

    # 5. Plain Text / Log / CSV Files
    elif ext in ["txt", "csv", "log"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {e}")
            return ""

    return f"[Uploaded file: {filename}]"

