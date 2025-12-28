# OCR Processor for ProSe Legal DB

**Two OCR Options Available:**

## 1. React App OCR (Browser-based)
- **Location:** Evidence Organizer → AI Analyze button
- **Uses:** Gemini Vision API
- **Best for:** Quick image OCR (JPG/PNG screenshots)
- **Limitation:** PDFs need to be converted to images first

## 2. Python OCR Processor (Standalone)
- **Location:** `09_APP/ocr_processor/standalone_ocr.py`
- **Uses:** Tesseract OCR + pdfplumber
- **Best for:** Bulk PDF processing, better accuracy
- **Features:**
  - Native PDF text extraction (fast, no OCR needed)
  - Tesseract OCR fallback for scanned PDFs
  - Batch folder processing
  - Saves to `06_SCANS/OCR_COMPLETE/`

---

## Quick Start

### Install Dependencies
```bash
cd 09_APP/ocr_processor
pip install -r requirements.txt

# System dependencies (Linux)
sudo apt-get install tesseract-ocr poppler-utils
```

### Process Files
```bash
# Process a single PDF
python standalone_ocr.py path/to/file.pdf

# Process entire INBOX folder
python standalone_ocr.py ../../06_SCANS/INBOX/

# Or just run (defaults to INBOX)
python standalone_ocr.py
```

### Output
- Extracted text: `06_SCANS/OCR_COMPLETE/{filename}_extracted.txt`
- Metadata: `06_SCANS/OCR_COMPLETE/{filename}_metadata.json`

---

## Integration with React App

After running Python OCR:
1. Extracted text files appear in `OCR_COMPLETE/`
2. You can manually copy text into Evidence Vault notes
3. Or import the text files as evidence

**Future Enhancement:** Could add API endpoint to call Python OCR from React app.

---

# Original OCR Agent Documentation

The OCR Agent specializes in optical character recognition and text extraction from various document formats, particularly PDFs and scanned images.

## Core Functions

### Text Extraction
- **Native PDF Processing**: Extracts text from searchable PDFs
- **OCR Processing**: Applies Tesseract OCR to scanned documents
- **Hybrid Processing**: Combines native text with OCR for mixed documents
- **Batch Operations**: Processes entire folders of documents

### Quality Assurance  
- **Confidence Scoring**: Provides OCR confidence metrics
- **Text Validation**: Validates extracted text quality
- **Error Handling**: Manages failed extractions gracefully
- **Provenance Tracking**: Maintains document processing history

### Integration Points
- **Evidence Processor**: Feeds extracted text to indexing system
- **Document Builder**: Provides content for legal document creation
- **Audit Agent**: Enables integrity checking of processed documents
- **Timeline Agent**: Supplies text content for chronological analysis

## Processing Workflow

1. **Document Intake**: Receives PDF files or document paths
2. **Format Detection**: Determines if document contains searchable text
3. **Text Extraction**: Applies appropriate extraction method (native/OCR)
4. **Quality Assessment**: Evaluates extraction confidence and completeness
5. **Metadata Generation**: Creates processing metadata and provenance
6. **Index Integration**: Passes structured data to Evidence Processor
7. **Chain of Custody**: Updates audit trail with processing details

The OCR Agent ensures reliable text extraction while maintaining document integrity and providing the foundation for all downstream text-based processing in the ProSe Agent system.