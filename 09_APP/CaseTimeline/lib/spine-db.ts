/**
 * Spine Database Schema
 * 
 * Uses Dexie.js for indexed database queries on React Native.
 * 
 * Tables:
 * - sources: SourceFile records (imported CSV files)
 * - spine: SpineItem records (individual messages)
 * - timeline: TimelineEvent records (timeline events)
 * - stickyNotes: StickyNote records (private annotations)
 */

import Dexie, { Table } from 'dexie';
import { SourceFile, SpineItem, TimelineEvent, StickyNote } from '@/types/spine';

export class SpineDatabase extends Dexie {
  sources!: Table<SourceFile, string>;
  spine!: Table<SpineItem, string>;
  timeline!: Table<TimelineEvent, string>;
  stickyNotes!: Table<StickyNote, string>;

  constructor() {
    super('CaseTimelineDB');
    
    // Version 1: Initial schema
    this.version(1).stores({
      // Source files indexed by id, file_hash, and imported_at
      sources: 'id, file_hash, imported_at',
      
      // Spine items indexed by id, source_id, timestamp, counterpart, platform, category
      // Compound indexes for common queries
      spine: 'id, source_id, timestamp, counterpart, platform, category, [source_id+timestamp]',
      
      // Timeline events indexed by id, date, lane, status, created_at
      timeline: 'id, date, lane, status, created_at, [date+lane]',
      
      // Sticky notes indexed by id, target_type, target_id, created_at
      stickyNotes: 'id, target_type, target_id, created_at, [target_type+target_id]',
    });
  }
}

// Export singleton instance
export const db = new SpineDatabase();

/**
 * Database helper functions
 */

/**
 * Check if a source file already exists by hash
 */
export async function sourceFileExists(fileHash: string): Promise<boolean> {
  const count = await db.sources.where('file_hash').equals(fileHash).count();
  return count > 0;
}

/**
 * Get source file by hash
 */
export async function getSourceFileByHash(fileHash: string): Promise<SourceFile | undefined> {
  return await db.sources.where('file_hash').equals(fileHash).first();
}

/**
 * Bulk insert spine items with duplicate checking
 * 
 * Returns: { inserted: number, skipped: number }
 */
export async function bulkInsertSpineItems(
  items: SpineItem[],
  sourceId: string
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  
  // Check for existing items by source_id and timestamp
  const existingItems = await db.spine
    .where('source_id')
    .equals(sourceId)
    .toArray();
  
  const existingKeys = new Set(
    existingItems.map(item => `${item.source_id}:${item.timestamp}:${item.content_original.substring(0, 50)}`)
  );
  
  const itemsToInsert: SpineItem[] = [];
  
  for (const item of items) {
    const key = `${item.source_id}:${item.timestamp}:${item.content_original.substring(0, 50)}`;
    if (!existingKeys.has(key)) {
      itemsToInsert.push(item);
    } else {
      skipped++;
    }
  }
  
  if (itemsToInsert.length > 0) {
    await db.spine.bulkAdd(itemsToInsert);
    inserted = itemsToInsert.length;
  }
  
  return { inserted, skipped };
}

/**
 * Get spine items by counterpart
 */
export async function getSpineItemsByCounterpart(
  counterpart: string
): Promise<SpineItem[]> {
  return await db.spine
    .where('counterpart')
    .equals(counterpart)
    .sortBy('timestamp');
}

/**
 * Get spine items in date range
 */
export async function getSpineItemsByDateRange(
  startDate: string,
  endDate: string
): Promise<SpineItem[]> {
  return await db.spine
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .sortBy('timestamp');
}

/**
 * Search spine items by keyword
 */
export async function searchSpineItems(keyword: string): Promise<SpineItem[]> {
  const lowerKeyword = keyword.toLowerCase();
  const allItems = await db.spine.toArray();
  
  return allItems.filter(item => 
    item.content_original.toLowerCase().includes(lowerKeyword) ||
    item.sender.toLowerCase().includes(lowerKeyword) ||
    item.recipient.toLowerCase().includes(lowerKeyword) ||
    item.counterpart.toLowerCase().includes(lowerKeyword)
  ).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Get timeline events with spine references
 */
export async function getTimelineEventsWithSpineRefs(): Promise<TimelineEvent[]> {
  return await db.timeline
    .filter(event => event.spine_refs.length > 0)
    .toArray();
}

/**
 * Get sticky notes for a target
 */
export async function getStickyNotesForTarget(
  targetType: StickyNote['target_type'],
  targetId: string
): Promise<StickyNote[]> {
  return await db.stickyNotes
    .where('[target_type+target_id]')
    .equals([targetType, targetId])
    .toArray();
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  await db.sources.clear();
  await db.spine.clear();
  await db.timeline.clear();
  await db.stickyNotes.clear();
}

