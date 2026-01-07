/**
 * Hook for accessing timeline events from the Spine database
 * 
 * This hook bridges the spine-based TimelineEvent (from Dexie) with the 
 * existing timeline context. It provides access to events that were 
 * created from spine items via manual promotion.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/spine-db';
import { TimelineEvent, SpineItem } from '@/types/spine';

/**
 * Get all timeline events from the spine database
 */
export function useSpineTimelineEvents() {
  return useLiveQuery(
    () => db.timeline.orderBy('date').toArray(),
    [],
    []
  );
}

/**
 * Get timeline events for a specific date range
 */
export function useSpineTimelineEventsByDateRange(startDate: string, endDate: string) {
  return useLiveQuery(
    () => db.timeline
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray(),
    [startDate, endDate],
    []
  );
}

/**
 * Get timeline events for a specific lane
 */
export function useSpineTimelineEventsByLane(lane: string) {
  return useLiveQuery(
    () => db.timeline
      .where('lane')
      .equals(lane)
      .toArray(),
    [lane],
    []
  );
}

/**
 * Get a single timeline event with its linked spine items
 */
export function useTimelineEventWithSpineItems(eventId: string) {
  return useLiveQuery(
    async () => {
      const event = await db.timeline.get(eventId);
      if (!event) return null;
      
      const spineItems: SpineItem[] = [];
      if (event.spine_refs && event.spine_refs.length > 0) {
        for (const ref of event.spine_refs) {
          const item = await db.spine.get(ref);
          if (item) spineItems.push(item);
        }
      }
      
      return { event, spineItems };
    },
    [eventId],
    null
  );
}

/**
 * Get spine items for a timeline event
 */
export function useSpineItemsForEvent(spineRefs: string[] | undefined) {
  return useLiveQuery(
    async () => {
      if (!spineRefs || spineRefs.length === 0) return [];
      
      const items: SpineItem[] = [];
      for (const ref of spineRefs) {
        const item = await db.spine.get(ref);
        if (item) items.push(item);
      }
      return items;
    },
    [spineRefs?.join(',')],
    []
  );
}

/**
 * Get timeline events that have spine references (promoted from spine)
 */
export function useTimelineEventsWithSpineRefs() {
  return useLiveQuery(
    () => db.timeline
      .filter(event => event.spine_refs && event.spine_refs.length > 0)
      .toArray(),
    [],
    []
  );
}

/**
 * Get database statistics
 */
export function useSpineDatabaseStats() {
  return useLiveQuery(
    async () => {
      const spineCount = await db.spine.count();
      const timelineCount = await db.timeline.count();
      const stickyNotesCount = await db.stickyNotes.count();
      const sourceFilesCount = await db.sources.count();
      
      return {
        spineCount,
        timelineCount,
        stickyNotesCount,
        sourceFilesCount,
      };
    },
    [],
    { spineCount: 0, timelineCount: 0, stickyNotesCount: 0, sourceFilesCount: 0 }
  );
}
