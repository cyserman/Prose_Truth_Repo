/**
 * ID Generators
 * 
 * Generates unique IDs for different entity types following Truth Repo conventions.
 * 
 * Format: PREFIX-####
 * - SCAN-#### for scanned documents
 * - COMM-#### for communication entries
 * - EVT-#### for timeline events
 * - EX-#### for exhibits
 */

let scanCounter = 0;
let commCounter = 0;
let evtCounter = 0;
let exCounter = 0;

/**
 * Generate SCAN-#### ID for scanned documents
 */
export function generateScanId(): string {
  scanCounter++;
  return `SCAN-${String(scanCounter).padStart(4, '0')}`;
}

/**
 * Generate COMM-#### ID for communication entries
 */
export function generateCommId(): string {
  commCounter++;
  return `COMM-${String(commCounter).padStart(4, '0')}`;
}

/**
 * Generate EVT-#### ID for timeline events
 */
export function generateEventId(): string {
  evtCounter++;
  return `EVT-${String(evtCounter).padStart(4, '0')}`;
}

/**
 * Generate EX-#### ID for exhibits
 */
export function generateExhibitId(): string {
  exCounter++;
  return `EX-${String(exCounter).padStart(4, '0')}`;
}

/**
 * Reset all counters (for testing)
 */
export function resetCounters(): void {
  scanCounter = 0;
  commCounter = 0;
  evtCounter = 0;
  exCounter = 0;
}

/**
 * Parse ID to get prefix and number
 */
export function parseId(id: string): { prefix: string; number: number } | null {
  const match = id.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseInt(match[2], 10),
  };
}

