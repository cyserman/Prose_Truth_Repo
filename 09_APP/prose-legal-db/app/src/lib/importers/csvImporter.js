/**
 * CSV Importer
 * 
 * Parses SMS/exports CSV files into normalized records.
 * Handles RFC4180 CSV format with quoted fields.
 */

import { normalizeDate, cleanText } from '../normalize';

/**
 * Parse CSV text into rows
 * 
 * Minimal RFC4180-ish CSV parser:
 * - Handles quoted fields with commas/newlines inside
 * - Handles escaped quotes ("")
 * - Returns array of rows (array of strings)
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  
  const s = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    
    if (inQuotes) {
      if (ch === '"') {
        const next = s[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  
  row.push(field);
  rows.push(row);
  
  // Remove trailing empty row
  if (rows.length && rows[rows.length - 1].every(c => (c || '').trim() === '')) {
    rows.pop();
  }
  
  return rows;
}

/**
 * Convert header row to map (case-insensitive)
 */
export function toHeaderMap(headerRow: string[]): Map<string, number> {
  const map = new Map();
  headerRow.forEach((h, idx) => {
    map.set((h || '').trim().toLowerCase(), idx);
  });
  return map;
}

/**
 * Get cell value from row using header map
 */
export function getCell(
  row: string[],
  headerMap: Map<string, number>,
  key: string,
  fallback: string = ''
): string {
  const idx = headerMap.get(key.toLowerCase());
  if (idx === undefined) return fallback;
  return (row[idx] || fallback).toString();
}

/**
 * Import CSV file and return parsed rows
 */
export async function importCSV(file: File): Promise<{
  headers: string[];
  rows: string[][];
}> {
  const text = await file.text();
  const allRows = parseCSV(text);
  
  if (allRows.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  const headers = allRows[0];
  const rows = allRows.slice(1);
  
  return { headers, rows };
}

