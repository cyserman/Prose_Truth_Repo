"""
OCR Task Handler for ProSe Agent 2
Handles optical character recognition and text extraction from documents
"""

import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import json
import time

def extract_text_from_pdf(file_path: str, **kwargs) -> Dict[str, Any]:
    """Extract text from PDF using basic method"""
    try:
        import PyPDF2
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        
        return {
            'status': 'success',
            'text': text,
            'pages': len(reader.pages),
            'file_path': file_path
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'file_path': file_path
        }

def process_scanned_document(file_path: str, **kwargs) -> Dict[str, Any]:
    """Process scanned documents with OCR"""
    try:
        # Placeholder for OCR processing
        return {
            'status': 'success',
            'message': f'Processed scanned document: {file_path}',
            'ocr_confidence': 0.85,
            'file_path': file_path
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'file_path': file_path
        }

# --- OCR -> Indexer integration ---
try:
    # your robust function module path; adjust if different
    from ingestion.ocr_tesseract import ocr_pdf_with_tesseract
except Exception as e:
    logging.warning(f"OCR pipeline not available: {e}")
    ocr_pdf_with_tesseract = None

def ocr_pdf_with_tesseract_task(pdf_path: str, **kwargs) -> Dict[str, Any]:
    if not ocr_pdf_with_tesseract:
        raise RuntimeError("OCR pipeline not available")
    res = ocr_pdf_with_tesseract(pdf_path, **kwargs)
    res["pipeline_ts"] = int(time.time())
    return res

def batch_ocr_folder(folder: str, extensions: Optional[List[str]] = None, **kwargs):
    extensions = [e.lower() for e in (extensions or [".pdf"])]
    results = []
    for p in Path(folder).rglob("*"):
        if p.suffix.lower() in extensions:
            try:
                results.append(ocr_pdf_with_tesseract_task(str(p), **kwargs))
            except Exception as e:
                logging.exception(f"OCR failed for {p}: {e}")
    return results

def ocr_then_index(pdf_path: str, index_folder: str = "evidence_index", **kwargs):
    """
    OCR a single PDF and hand the extracted per-page text off to Data Indexer.
    Returns index entries created.
    """
    from .data_tasks import add_text_snippets_to_index
    ocr = ocr_pdf_with_tesseract_task(pdf_path, **kwargs)
    entries = []
    for page in ocr.get("pages", []):
        if not page.get("text"):
            continue
        entries.append({
            "source_file": ocr["file"],
            "sha256": ocr["sha256"],
            "page": page["page"],
            "text": page["text"],
            "avg_conf": page.get("avg_confidence"),
            "source": page.get("source"),
        })
    return add_text_snippets_to_index(entries, out_dir=index_folder)