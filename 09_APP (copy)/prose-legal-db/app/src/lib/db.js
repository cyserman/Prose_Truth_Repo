/**
 * Database Schema
 * 
 * Truth Repo Database - Local-first evidence machine
 * 
 * CRITICAL INVARIANTS:
 * - original_text is NEVER modified (immutable)
 * - neutral_text is stored separately (derived, editable)
 * - source pointer tracks raw file + row id
 * - hash optional for integrity verification
 */

import Dexie from 'dexie';

class ProSeLegalDB extends Dexie {
  constructor() {
    super('ProSeLegalDB');
    
    // Version 3: Truth Repo Schema
    this.version(3).stores({
      // Scans: Documents from 06_SCANS/INBOX
      scans: '++id, scan_id, filename, file_hash, date_range_start, date_range_end, imported_at, [scan_id+imported_at]',
      
      // Comms: Communication spine entries (SMS, AppClose, etc.)
      comms: '++id, comm_id, timestamp, sender, recipient, content_original, content_neutral, source_file, source_row_id, hash, created_at, [timestamp+comm_id]',
      
      // Timeline Events: Judge-facing events
      timeline_events: '++id, event_id, date, lane, title, description, status, spine_refs, exhibit_refs, created_at, updated_at, [date+lane]',
      
      // Exhibits: Promoted evidence
      exhibits: '++id, exhibit_code, title, file_path, category, date_added, source_scan_id, source_comm_id, created_at',
      
      // Mappings: Links between entities
      mappings: '++id, from_type, from_id, to_type, to_id, created_at, [from_type+from_id]',
    });
  }
}

export const db = new ProSeLegalDB();

/**
 * Database helper functions
 */

/**
 * Get all scans ordered by import date
 */
export async function getAllScans() {
  return await db.scans.orderBy('imported_at').reverse().toArray();
}

/**
 * Get comm spine entries in date range
 */
export async function getCommsByDateRange(startDate: string, endDate: string) {
  return await db.comms
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .sortBy('timestamp');
}

/**
 * Get timeline events by date range
 */
export async function getTimelineEventsByDateRange(startDate: string, endDate: string) {
  return await db.timeline_events
    .where('date')
    .between(startDate, endDate, true, true)
    .sortBy('date');
}

/**
 * Get exhibits by category
 */
export async function getExhibitsByCategory(category: string) {
  return await db.exhibits.where('category').equals(category).toArray();
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData() {
  await db.scans.clear();
  await db.comms.clear();
  await db.timeline_events.clear();
  await db.exhibits.clear();
  await db.mappings.clear();
}

