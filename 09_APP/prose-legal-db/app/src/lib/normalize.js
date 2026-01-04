/**
 * Text Normalization Utilities
 * 
 * Text cleanup utilities (no semantic rewriting).
 * These are deterministic transformations for consistency.
 * 
 * CRITICAL: These do NOT change meaning, only format.
 */

/**
 * Normalize whitespace (collapse multiple spaces, trim)
 */
export function normalizeWhitespace(text: string): string {
  return (text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize line breaks (standardize to \n)
 */
export function normalizeLineBreaks(text: string): string {
  return (text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Normalize exhibit codes (parse comma/semicolon separated, deduplicate)
 * 
 * @param {string} codesStr - Comma/semicolon/newline separated codes
 * @returns {string[]} Array of normalized codes
 */
export function normalizeCodes(codesStr: string): string[] {
  const parts = (codesStr || '')
    .split(/[,;\n]+/g)
    .map(s => s.trim())
    .filter(Boolean);
  
  const seen = new Set();
  const out = [];
  
  for (const part of parts) {
    const key = part.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(part);
    }
  }
  
  return out;
}

/**
 * Normalize date string to YYYY-MM-DD format
 */
export function normalizeDate(dateStr: string | Date): string {
  if (!dateStr) return '';
  
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Clean text for display (remove extra whitespace, normalize line breaks)
 */
export function cleanText(text: string): string {
  return normalizeLineBreaks(normalizeWhitespace(text));
}

/**
 * Extract first sentence (for previews)
 */
export function extractFirstSentence(text: string, maxLength: number = 100): string {
  const cleaned = cleanText(text);
  const firstSentence = cleaned.split(/[.!?]\s/)[0];
  if (firstSentence.length <= maxLength) return firstSentence;
  return firstSentence.substring(0, maxLength - 3) + '...';
}

