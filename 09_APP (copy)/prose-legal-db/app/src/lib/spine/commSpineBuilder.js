/**
 * Communication Spine Builder
 * 
 * Builds COMM_SPINE.csv from raw SMS/AppClose exports.
 * 
 * CRITICAL RULES:
 * - Keeps excerpts short (memory triggers)
 * - Taggable and source-linked
 * - Adds "exhibit_candidate" flags, but does NOT argue
 * - Preserves chronological order
 * - Never modifies original_text
 */

import { db } from '../db';
import { generateCommId } from '../ids';
import { normalizeDate, cleanText } from '../normalize';
import { calculateHash } from '../hash';

/**
 * Communication Spine Entry
 */
export type CommSpineEntry = {
  comm_id: string;
  timestamp: string;
  sender: string;
  recipient: string;
  content_original: string;
  content_neutral?: string;
  source_file: string;
  source_row_id: number;
  hash: string;
  exhibit_candidate?: boolean;
  created_at: string;
};

/**
 * Build communication spine from raw import data
 * 
 * @param {Array} rawEntries - Raw imported entries
 * @param {string} sourceFile - Source filename
 * @returns {Promise<CommSpineEntry[]>} Processed spine entries
 */
export async function buildCommSpine(
  rawEntries: Array<{
    timestamp: string;
    sender: string;
    recipient: string;
    message: string;
  }>,
  sourceFile: string
): Promise<CommSpineEntry[]> {
  const spineEntries: CommSpineEntry[] = [];
  const now = new Date().toISOString();
  
  for (let i = 0; i < rawEntries.length; i++) {
    const raw = rawEntries[i];
    
    // Generate ID
    const comm_id = generateCommId();
    
    // Clean and hash content
    const content_original = cleanText(raw.message || '');
    const hash = await calculateHash(content_original);
    
    // Normalize timestamp
    const timestamp = normalizeDate(raw.timestamp) || new Date().toISOString();
    
    // Determine if exhibit candidate (simple heuristics - can be overridden)
    const exhibit_candidate = detectExhibitCandidate(content_original);
    
    const entry: CommSpineEntry = {
      comm_id,
      timestamp,
      sender: raw.sender || '',
      recipient: raw.recipient || '',
      content_original,
      source_file: sourceFile,
      source_row_id: i + 1,
      hash,
      exhibit_candidate,
      created_at: now,
    };
    
    spineEntries.push(entry);
  }
  
  return spineEntries;
}

/**
 * Detect if entry is a candidate for exhibit promotion
 * 
 * Simple heuristics - does NOT make legal arguments.
 * Just flags potentially relevant entries.
 */
function detectExhibitCandidate(content: string): boolean {
  const lower = content.toLowerCase();
  
  // Patterns that might be relevant (not arguments, just flags)
  const patterns = [
    /access|visit|see.*kids|boys|children/i,
    /court|judge|lawyer|attorney|motion|filing/i,
    /denied|refused|blocked|prevented/i,
    /schedule|pickup|drop|exchange/i,
    /emergency|urgent|asap/i,
  ];
  
  return patterns.some(pattern => pattern.test(lower));
}

/**
 * Save comm spine entries to database
 */
export async function saveCommSpine(entries: CommSpineEntry[]): Promise<void> {
  await db.comms.bulkAdd(entries);
}

/**
 * Export comm spine to CSV format
 */
export function exportCommSpineToCSV(entries: CommSpineEntry[]): string {
  const headers = [
    'comm_id',
    'timestamp',
    'sender',
    'recipient',
    'content_original',
    'content_neutral',
    'source_file',
    'source_row_id',
    'exhibit_candidate',
  ];
  
  const rows = entries.map(entry => [
    entry.comm_id,
    entry.timestamp,
    escapeCSV(entry.sender),
    escapeCSV(entry.recipient),
    escapeCSV(entry.content_original),
    escapeCSV(entry.content_neutral || ''),
    escapeCSV(entry.source_file),
    entry.source_row_id,
    entry.exhibit_candidate ? 'true' : 'false',
  ]);
  
  const csvRows = [headers, ...rows].map(row => row.join(','));
  return csvRows.join('\n');
}

/**
 * Escape CSV field (handle quotes and commas)
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

