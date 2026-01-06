/**
 * AppClose Importer
 * 
 * AppClose format adapter for CSV exports.
 * Handles AppClose-specific column names and formats.
 */

import { importCSV, toHeaderMap, getCell } from './csvImporter';
import { normalizeDate } from '../normalize';

/**
 * AppClose message entry
 */
export type AppCloseEntry = {
  timestamp: string;
  sender: string;
  recipient: string;
  message: string;
  platform: string;
};

/**
 * Import AppClose CSV file
 * 
 * Expected columns:
 * - Date, Time, Sender, Recipient, Message, Platform (optional)
 */
export async function importAppCloseCSV(file: File): Promise<AppCloseEntry[]> {
  const { headers, rows } = await importCSV(file);
  const headerMap = toHeaderMap(headers);
  
  const entries: AppCloseEntry[] = [];
  
  for (const row of rows) {
    const date = getCell(row, headerMap, 'date', '');
    const time = getCell(row, headerMap, 'time', '');
    const sender = getCell(row, headerMap, 'sender', '');
    const recipient = getCell(row, headerMap, 'recipient', '');
    const message = getCell(row, headerMap, 'message', '');
    const platform = getCell(row, headerMap, 'platform', 'AppClose');
    
    // Skip empty rows
    if (!date || !time || !message) continue;
    
    // Combine date and time
    const timestamp = normalizeDate(`${date}T${time}`) || new Date().toISOString();
    
    entries.push({
      timestamp,
      sender: sender.trim(),
      recipient: recipient.trim(),
      message: message.trim(),
      platform: platform.trim() || 'AppClose',
    });
  }
  
  return entries;
}

