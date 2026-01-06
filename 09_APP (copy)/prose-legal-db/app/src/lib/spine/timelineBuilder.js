/**
 * Timeline Builder
 * 
 * Builds master_timeline.csv from events linked to scans + comm spine anchors.
 * 
 * CRITICAL RULES:
 * - Judge-facing text stays neutral
 * - Exhibit references always use codes (CL-###, SCAN-###, EX-###, etc.)
 * - Events reference spine, don't duplicate
 * - Status lifecycle: asserted, denied, withdrawn, pending, resolved, fact
 */

import { db } from '../db';
import { generateEventId } from '../ids';
import { normalizeDate } from '../normalize';

/**
 * Timeline Event
 */
export type TimelineEvent = {
  event_id: string;
  date: string;
  lane: string;
  title: string;
  description: string;
  status: 'asserted' | 'denied' | 'withdrawn' | 'pending' | 'resolved' | 'fact';
  spine_refs: string[];      // Array of comm_id references
  exhibit_refs: string[];    // Array of exhibit codes
  created_at: string;
  updated_at: string;
};

/**
 * Build timeline event from data
 */
export function buildTimelineEvent(data: {
  date: string;
  lane: string;
  title: string;
  description: string;
  status?: TimelineEvent['status'];
  spine_refs?: string[];
  exhibit_refs?: string[];
}): TimelineEvent {
  return {
    event_id: generateEventId(),
    date: normalizeDate(data.date),
    lane: data.lane,
    title: data.title.trim(),
    description: data.description.trim(),
    status: data.status || 'asserted',
    spine_refs: data.spine_refs || [],
    exhibit_refs: data.exhibit_refs || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Save timeline event to database
 */
export async function saveTimelineEvent(event: TimelineEvent): Promise<void> {
  await db.timeline_events.add(event);
}

/**
 * Update timeline event
 */
export async function updateTimelineEvent(event: TimelineEvent): Promise<void> {
  event.updated_at = new Date().toISOString();
  await db.timeline_events.update(event.event_id, event);
}

/**
 * Get timeline events with spine references
 */
export async function getTimelineEventsWithSpineRefs(): Promise<TimelineEvent[]> {
  return await db.timeline_events
    .filter(event => event.spine_refs.length > 0)
    .toArray();
}

/**
 * Export timeline to CSV format
 */
export function exportTimelineToCSV(events: TimelineEvent[]): string {
  const headers = [
    'event_id',
    'date',
    'lane',
    'title',
    'description',
    'status',
    'spine_refs',
    'exhibit_refs',
  ];
  
  const rows = events.map(event => [
    event.event_id,
    event.date,
    escapeCSV(event.lane),
    escapeCSV(event.title),
    escapeCSV(event.description),
    event.status,
    event.spine_refs.join(';'),
    event.exhibit_refs.join(';'),
  ]);
  
  const csvRows = [headers, ...rows].map(row => row.join(','));
  return csvRows.join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Link timeline event to comm spine entries
 */
export async function linkEventToSpine(
  eventId: string,
  commIds: string[]
): Promise<void> {
  const event = await db.timeline_events.get(eventId);
  if (!event) throw new Error(`Event ${eventId} not found`);
  
  event.spine_refs = [...new Set([...event.spine_refs, ...commIds])];
  event.updated_at = new Date().toISOString();
  
  await db.timeline_events.update(eventId, event);
}

