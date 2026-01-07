/**
 * Anchor Constants
 * 
 * UI reminders of anchor rules (no hallucination, preserve originals).
 * These constants remind developers and AI agents of the Truth Repo constitution.
 */

export const ANCHOR_RULES = {
  NEVER_OVERWRITE_ORIGINALS: 'original_text is NEVER modified (immutable)',
  STORE_NEUTRAL_SEPARATELY: 'neutral_text is stored as a SEPARATE field',
  AI_IS_OPTIONAL: 'AI is OPTIONAL - app must work without it',
  LOCAL_FIRST: 'All data stays local unless user explicitly exports',
  PRESERVE_CHRONOLOGY: 'Chronological order is sacred - never reorder',
  NO_ARGUMENTS: 'System presents facts, does not argue',
  EXHIBIT_CODES_REQUIRED: 'All exhibits must have codes (CL-###, SCAN-###, EX-###)',
  SOURCE_TRACKING: 'Every entry tracks source file + row ID',
};

export const ANCHOR_REMINDERS = [
  'Read 00_ANCHORS/ first before making changes',
  'Do not hallucinate - use only files present in repo',
  'Preserve exhibit codes - maintain evidence linkage',
  'Neutralize emotional input - convert to court-ready language',
  'Flag inconsistencies - timeline gaps, date conflicts',
  'The record speaks - litigant speaks less',
];

export const CASE_INFO = {
  name: 'Firey v. Firey',
  jurisdiction: 'Montgomery County, PA',
  matter: 'Divorce & Custody',
  status: 'Litigation Mode',
};

export const TRUTH_REPO_PRINCIPLES = {
  PURPOSE: 'Single, authoritative source of truth for pro se legal case management',
  DESIGN: 'Designed to survive device failure and counsel changes',
  STRATEGY: 'Timeline-first strategy with exhibit linkage',
  SAFETY: 'Local-only storage, no cloud sync, no telemetry',
};

