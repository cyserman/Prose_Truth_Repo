/**
 * PDF Importer
 * 
 * Attaches PDFs + metadata to scans table.
 * 
 * Note: Full PDF text extraction requires additional libraries.
 * This is a basic metadata importer.
 */

import { db } from '../db';
import { generateScanId } from '../ids';
import { calculateFileHash } from '../hash';
import { normalizeDate } from '../normalize';

/**
 * PDF metadata
 */
export type PDFMetadata = {
  filename: string;
  file: File;
  date_range_start?: string;
  date_range_end?: string;
  notes?: string;
};

/**
 * Import PDF file as scan
 */
export async function importPDF(metadata: PDFMetadata): Promise<string> {
  const scan_id = generateScanId();
  const file_hash = await calculateFileHash(metadata.file);
  const now = new Date().toISOString();
  
  // Check for duplicate
  const existing = await db.scans.where('file_hash').equals(file_hash).first();
  if (existing) {
    throw new Error(`PDF already imported: ${existing.scan_id}`);
  }
  
  // Store file reference (in real app, might store blob or path)
  const scan = {
    scan_id,
    filename: metadata.filename,
    file_hash,
    date_range_start: metadata.date_range_start ? normalizeDate(metadata.date_range_start) : null,
    date_range_end: metadata.date_range_end ? normalizeDate(metadata.date_range_end) : null,
    imported_at: now,
    notes: metadata.notes || '',
  };
  
  await db.scans.add(scan);
  
  return scan_id;
}

/**
 * Extract text from PDF (placeholder - requires PDF.js or similar)
 * 
 * TODO: Implement actual PDF text extraction
 */
export async function extractPDFText(file: File): Promise<string> {
  // Placeholder - would use PDF.js or similar library
  throw new Error('PDF text extraction not yet implemented');
}

