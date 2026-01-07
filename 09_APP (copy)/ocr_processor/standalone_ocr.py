#!/usr/bin/env python3
"""
Standalone OCR Processor for ProSe Legal DB
Processes PDFs from 06_SCANS/INBOX and outputs text to OCR_COMPLETE

Usage:
    python standalone_ocr.py [path_to_pdf_or_folder]
"""

import os
import sys
from pathlib import Path
import logging
from typing import Dict, Any

# Try to import OCR libraries
try:
    import pytesseract
    from pdf2image import convert_from_path
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("⚠️  pytesseract/pdf2image not installed. Install with:")
    print("   pip install pytesseract pdf2image")
    print("   sudo apt-get install tesseract-ocr poppler-utils")

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("⚠️  pdfplumber not installed. Install with: pip install pdfplumber")

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


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
        logger.warning(f"Native extraction failed: {e}")
        return ""


def extract_text_ocr(pdf_path: str) -> str:
    """Fall back to pytesseract OCR."""
    if not HAS_OCR:
        return ""
    
    try:
        images = convert_from_path(pdf_path)
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img) + "\n"
        return text
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        return ""


def extract_text(pdf_path: str) -> Dict[str, Any]:
    """Extract text from PDF: try native first, then OCR."""
    result = {
        "text": "",
        "used_native": False,
        "used_ocr": False,
        "char_count": 0,
        "word_count": 0
    }

    if not pdf_path.lower().endswith('.pdf'):
        # Non-PDF files: try to read as text
        try:
            with open(pdf_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
                result.update({
                    "text": text,
                    "used_native": True,
                    "char_count": len(text),
                    "word_count": len(text.split())
                })
                return result
        except Exception as e:
            logger.error(f"Failed to read {pdf_path}: {e}")
            return result
    
    # For PDFs: native extraction first
    native_text = extract_text_native(pdf_path)
    if native_text.strip():
        result.update({
            "text": native_text,
            "used_native": True,
            "char_count": len(native_text),
            "word_count": len(native_text.split())
        })
        logger.info(f"✅ Native extraction: {len(native_text)} chars")
        return result
    
    # Fall back to OCR
    ocr_text = extract_text_ocr(pdf_path)
    if ocr_text.strip():
        result.update({
            "text": ocr_text,
            "used_ocr": True,
            "char_count": len(ocr_text),
            "word_count": len(ocr_text.split())
        })
        logger.info(f"✅ OCR extraction: {len(ocr_text)} chars")
        return result
    
    logger.warning(f"⚠️  No text extracted from {pdf_path}")
    return result


def process_file(input_path: str, output_dir: str = None) -> Dict[str, Any]:
    """Process a single file and save extracted text."""
    input_path = Path(input_path)
    
    if not input_path.exists():
        logger.error(f"File not found: {input_path}")
        return {"status": "error", "message": "File not found"}
    
    # Determine output directory
    if output_dir is None:
        # Default: OCR_COMPLETE in same directory structure
        repo_root = Path(__file__).parent.parent.parent
        output_dir = repo_root / "06_SCANS" / "OCR_COMPLETE"
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Extract text
    extraction = extract_text(str(input_path))
    
    if not extraction.get("text"):
        return {
            "status": "error",
            "message": "No text extracted",
            "file": str(input_path)
        }
    
    # Save extracted text
    output_file = output_dir / f"{input_path.stem}_extracted.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(extraction["text"])
    
    # Save metadata
    metadata_file = output_dir / f"{input_path.stem}_metadata.json"
    import json
    metadata = {
        "source_file": str(input_path),
        "output_file": str(output_file),
        "extraction_method": "native" if extraction.get("used_native") else "ocr" if extraction.get("used_ocr") else "none",
        "char_count": extraction.get("char_count", 0),
        "word_count": extraction.get("word_count", 0),
        "timestamp": str(Path(__file__).stat().st_mtime)
    }
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"✅ Processed: {input_path.name} → {output_file.name}")
    logger.info(f"   Method: {metadata['extraction_method']}, Chars: {metadata['char_count']}")
    
    return {
        "status": "success",
        "file": str(input_path),
        "output": str(output_file),
        "metadata": metadata
    }


def process_folder(folder_path: str, output_dir: str = None) -> list:
    """Process all PDFs in a folder."""
    folder = Path(folder_path)
    results = []
    
    for pdf_file in folder.rglob("*.pdf"):
        try:
            result = process_file(pdf_file, output_dir)
            results.append(result)
        except Exception as e:
            logger.error(f"Failed to process {pdf_file}: {e}")
            results.append({"status": "error", "file": str(pdf_file), "error": str(e)})
    
    return results


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        # Default: process INBOX
        repo_root = Path(__file__).parent.parent.parent
        inbox_path = repo_root / "06_SCANS" / "INBOX"
        if inbox_path.exists():
            logger.info(f"Processing INBOX: {inbox_path}")
            results = process_folder(str(inbox_path))
        else:
            print("Usage: python standalone_ocr.py <pdf_file_or_folder>")
            print("   or place PDFs in 06_SCANS/INBOX/")
            sys.exit(1)
    else:
        input_path = Path(sys.argv[1])
        if input_path.is_file():
            results = [process_file(str(input_path))]
        elif input_path.is_dir():
            results = process_folder(str(input_path))
        else:
            logger.error(f"Path not found: {input_path}")
            sys.exit(1)
    
    # Summary
    success = sum(1 for r in results if r.get("status") == "success")
    total = len(results)
    logger.info(f"\n📊 Summary: {success}/{total} files processed successfully")


if __name__ == "__main__":
    main()

