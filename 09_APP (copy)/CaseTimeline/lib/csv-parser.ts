/**
 * CSV Parser for Text Spine Import
 * 
 * Parses AppClose conversation exports and other CSV formats
 * into SpineItem records.
 * 
 * Tested with: alltextsfvf-appclose%202025.csv (630 messages)
 */

import { SpineItem, SourceFile, MessageCategory, ImportResult } from '@/types/spine';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

/**
 * Calculate SHA-256 hash of content (web-compatible)
 */
export async function calculateHash(content: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Use Web Crypto API for web
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Use expo-crypto for native platforms
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      content
    );
  }
}

/**
 * Categorize message based on content
 */
function categorizeMessage(content: string): MessageCategory {
  const lower = content.toLowerCase();
  
  // Access denied patterns
  if (lower.match(/(can't|won't|refuse|deny|not letting|not allowing).*(see|visit|boys|kids|children)/i)) {
    return MessageCategory.ACCESS_DENIED;
  }
  
  // Financial strain patterns
  if (lower.match(/(money|pay|support|owe|bill|financial|can't afford)/i)) {
    return MessageCategory.FINANCIAL_STRAIN;
  }
  
  // Hot read reactive patterns
  if (lower.match(/(you're|you are|always|never|why did|how could)/i)) {
    return MessageCategory.HOT_READ_REACTIVE;
  }
  
  // Schedule change patterns
  if (lower.match(/(pickup|drop|exchange|time|schedule|change|reschedule)/i)) {
    return MessageCategory.SCHEDULE_CHANGE;
  }
  
  // Emergency patterns
  if (lower.match(/(emergency|urgent|asap|immediately|right now)/i)) {
    return MessageCategory.EMERGENCY;
  }
  
  // Legal threat patterns
  if (lower.match(/(lawyer|attorney|court|judge|file|motion|order)/i)) {
    return MessageCategory.LEGAL_THREAT;
  }
  
  // Document request patterns
  if (lower.match(/(need|want|send|give|provide).*(document|paper|record|copy)/i)) {
    return MessageCategory.DOCUMENT_REQUEST;
  }
  
  return MessageCategory.COMMUNICATION;
}

/**
 * Parse AppClose CSV format
 * 
 * Expected format:
 * Date,Time,Sender,Recipient,Message,Platform
 * 
 * Or with call logs:
 * Date,Time,Sender,Recipient,Message,Platform,Call Duration
 */
export function parseAppCloseCSV(csvContent: string): {
  messages: Omit<SpineItem, 'id' | 'source_id' | 'created_at'>[];
  calls: Omit<SpineItem, 'id' | 'source_id' | 'created_at'>[];
} {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { messages: [], calls: [] };
  }
  
  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dateIdx = header.indexOf('date');
  const timeIdx = header.indexOf('time');
  const senderIdx = header.indexOf('sender');
  const recipientIdx = header.indexOf('recipient');
  const messageIdx = header.indexOf('message');
  const platformIdx = header.indexOf('platform');
  const callDurationIdx = header.indexOf('call duration') !== -1 ? header.indexOf('call duration') : header.indexOf('duration');
  
  if (dateIdx === -1 || timeIdx === -1 || senderIdx === -1 || recipientIdx === -1 || messageIdx === -1) {
    throw new Error('Invalid CSV format: missing required columns');
  }
  
  const messages: Omit<SpineItem, 'id' | 'source_id' | 'created_at'>[] = [];
  const calls: Omit<SpineItem, 'id' | 'source_id' | 'created_at'>[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim());
    
    if (row.length < Math.max(dateIdx, timeIdx, senderIdx, recipientIdx, messageIdx) + 1) {
      continue; // Skip incomplete rows
    }
    
    const date = row[dateIdx];
    const time = row[timeIdx];
    const sender = row[senderIdx];
    const recipient = row[recipientIdx];
    const message = row[messageIdx] || '';
    const platform = platformIdx !== -1 ? row[platformIdx] : 'AppClose';
    const callDuration = callDurationIdx !== -1 ? parseInt(row[callDurationIdx] || '0', 10) : undefined;
    
    // Parse timestamp
    let timestamp: string;
    try {
      // Try to parse date/time
      const dateTimeStr = `${date} ${time}`;
      const dateObj = new Date(dateTimeStr);
      if (isNaN(dateObj.getTime())) {
        // Try ISO format
        timestamp = new Date(date).toISOString();
      } else {
        timestamp = dateObj.toISOString();
      }
    } catch {
      timestamp = new Date().toISOString(); // Fallback to now
    }
    
    // Determine direction (simplified - you may need to adjust based on your data)
    const direction = sender.toLowerCase().includes('you') || sender.toLowerCase().includes('me') 
      ? 'outbound' 
      : 'inbound';
    
    // Normalize counterpart (you may need to adjust based on your data)
    const counterpart = direction === 'inbound' ? sender : recipient;
    
    // Categorize message
    const category = categorizeMessage(message);
    
    const item: Omit<SpineItem, 'id' | 'source_id' | 'created_at'> = {
      timestamp,
      sender,
      recipient,
      counterpart,
      platform,
      category,
      content_original: message,
      direction: direction as 'inbound' | 'outbound',
      is_call: callDuration !== undefined && callDuration > 0,
      call_duration: callDuration,
    };
    
    if (item.is_call) {
      calls.push(item);
    } else {
      messages.push(item);
    }
  }
  
  return { messages, calls };
}

/**
 * Import AppClose CSV file
 * 
 * Main import function that:
 * 1. Calculates file hash
 * 2. Parses CSV content
 * 3. Creates SourceFile record
 * 4. Creates SpineItem records
 * 5. Returns ImportResult
 */
export async function importAppCloseCSV(
  csvContent: string,
  filename: string
): Promise<ImportResult> {
  // Calculate hash
  const file_hash = await calculateHash(csvContent);
  
  // Parse CSV
  const { messages, calls } = parseAppCloseCSV(csvContent);
  const allItems = [...messages, ...calls];
  
  if (allItems.length === 0) {
    return {
      source_file: {
        id: `SRC-${Date.now()}`,
        filename,
        file_hash,
        imported_at: new Date().toISOString(),
        message_count: 0,
      },
      spine_items: [],
      duplicates_skipped: 0,
      errors: ['No messages found in CSV'],
      success: false,
    };
  }
  
  // Find date range
  const timestamps = allItems.map(item => item.timestamp).sort();
  const date_range_start = timestamps[0];
  const date_range_end = timestamps[timestamps.length - 1];
  
  // Create SourceFile
  const source_file: SourceFile = {
    id: `SRC-${Date.now()}`,
    filename,
    file_hash,
    imported_at: new Date().toISOString(),
    message_count: allItems.length,
    date_range_start,
    date_range_end,
  };
  
  // Create SpineItems with IDs
  const now = new Date().toISOString();
  const spine_items: SpineItem[] = allItems.map((item, index) => ({
    ...item,
    id: `SPINE-${source_file.id}-${String(index + 1).padStart(6, '0')}`,
    source_id: source_file.id,
    created_at: now,
  }));
  
  return {
    source_file,
    spine_items,
    duplicates_skipped: 0, // Will be calculated during database insert
    errors: [],
    success: true,
  };
}

