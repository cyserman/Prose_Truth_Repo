"""
Phase 2 OCR Agent
Listens for dedupe events → extracts text from PDFs → emits text.ready events
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any
import hashlib
import json

# Try pytesseract + pdf2image; fall back to basic extraction
try:
    import pytesseract
    from pdf2image import convert_from_path
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    logging.warning("pytesseract/pdf2image not installed; OCR will use fallback text extraction")

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

from core.bus import publish, consume
from core.store import append_jsonl, now


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OCRAgent")


def extract_text_native(pdf_path: str) -> str:
    """Try pdfplumber for native text extraction (faster, no OCR)."""
    if not HAS_PDFPLUMBER:
        return ""
    
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.warning(f"Native extraction failed for {pdf_path}: {e}")
        return ""


def extract_text_ocr(pdf_path: str) -> str:
    """Fall back to pytesseract OCR."""
    if not HAS_OCR:
        return ""
    
    try:
        images = convert_from_path(pdf_path)
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img)
        return text
    except Exception as e:
        logger.error(f"OCR failed for {pdf_path}: {e}")
        return ""


def extract_text(pdf_path: str) -> Dict[str, Any]:
    """Extract text from PDF: try native first, then OCR, then fail gracefully."""
    result = {
        "text": "",
        "used_native": False,
        "used_ocr": False,
    }

    if not pdf_path.lower().endswith('.pdf'):
        # Non-PDF files: try to read as text
        try:
            with open(pdf_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
                result.update({"text": text, "used_native": True})
                return result
        except Exception as e:
            logger.error(f"Failed to read {pdf_path}: {e}")
            return result
    
    # For PDFs: native extraction first
    native_text = extract_text_native(pdf_path)
    if native_text.strip():
        logger.info(f"Native extraction got {len(native_text)} chars from {Path(pdf_path).name}")
        result.update({"text": native_text, "used_native": True})
        return result
    
    # Fall back to OCR
    ocr_text = extract_text_ocr(pdf_path)
    if ocr_text.strip():
        logger.info(f"OCR got {len(ocr_text)} chars from {Path(pdf_path).name}")
        result.update({"text": ocr_text, "used_ocr": True})
        return result
    
    logger.warning(f"No text extracted from {pdf_path}")
    return result


def handle_dedupe_event(event: Dict[str, Any]) -> None:
    """Process dedupe event: extract text from file."""
    file_relpath = event.get("file_relpath", "")
    repo_root = Path(__file__).resolve().parent.parent.parent
    evidence_root = repo_root / "06_SCANS" / "INBOX"
    file_abs_path = evidence_root / file_relpath
    
    if not os.path.exists(file_abs_path):
        logger.warning(f"File not found: {file_abs_path}")
        return
    
    logger.info(f"[OCR] Processing {file_relpath}")

    extraction = extract_text(file_abs_path)
    text = extraction.get("text", "")

    text_ready_event = {
        "type": "text.ready",
        "id": hashlib.sha256(f"{file_relpath}:text.ready:{now()}".encode()).hexdigest()[:16],
        "ts": now(),
        "kind": "text.ready",
        "file_relpath": file_relpath,
        "title": f"Text extracted: {Path(file_relpath).name}",
        "details": {
            "char_count": len(text),
            "word_count": len(text.split()),
            "source": "native" if extraction.get("used_native") else "ocr" if extraction.get("used_ocr") else "none",
        }
    }

    # Store extracted text for summarizer
    text_store_path = f"evidence_index/text/{Path(file_relpath).stem}.txt"
    os.makedirs(os.path.dirname(text_store_path), exist_ok=True)
    with open(text_store_path, 'w', encoding='utf-8') as f:
        f.write(text)

    # Publish downstream for summarizer (after text saved)
    publish(text_ready_event)

    # Record to timeline
    append_jsonl("timeline.jsonl", {
        "id": text_ready_event["id"],
        "ts": text_ready_event["ts"],
        "kind": text_ready_event["kind"],
        "file_relpath": text_ready_event["file_relpath"],
        "title": text_ready_event["title"],
        "details": text_ready_event["details"],
    })

    logger.info(f"[OCR] ✅ {file_relpath} → {text_ready_event['details']['char_count']} chars ({text_ready_event['details']['source']})")


def run() -> None:
    """Main OCR agent loop: listen for dedupe events."""
    logger.info("[OCR Agent] Starting (listening for dedupe events)")
    
    try:
        for event in consume():
            try:
                if event.get("type") != "dedupe":
                    continue

                status = event.get("details", {}).get("status")
                if status not in {"accepted", "superseded"}:
                    # Ignore duplicates but mark them in timeline via dedupe
                    continue

                handle_dedupe_event(event)
            except Exception as loop_err:
                logger.error(f"[OCR Agent] Failed to handle event {event}: {loop_err}", exc_info=True)
    except KeyboardInterrupt:
        logger.info("[OCR Agent] Shutting down")
    except Exception as e:
        logger.error(f"[OCR Agent] Error: {e}", exc_info=True)


if __name__ == "__main__":
    run()
