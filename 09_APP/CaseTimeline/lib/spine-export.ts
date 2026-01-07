/**
 * Spine-based Timeline Export
 * 
 * Exports timeline events from database with optional sticky notes.
 * 
 * CRITICAL INVARIANT:
 * - Private notes (is_private: true) are EXCLUDED by default
 * - User must explicitly opt-in to include private notes
 * - A warning is shown when including private notes
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { db } from './spine-db';
import { TimelineEvent, StickyNote, SpineItem, SourceFile } from '@/types/spine';

export interface TimelineExport {
  timeline_events: TimelineEvent[];
  sticky_notes?: StickyNote[];
  exported_at: string;
  include_private_notes: boolean;
}

export interface FullExport {
  source_files: SourceFile[];
  spine_items: SpineItem[];
  timeline_events: TimelineEvent[];
  sticky_notes: StickyNote[];
  exported_at: string;
  include_private_notes: boolean;
}

/**
 * Export timeline events with optional sticky notes
 */
export async function exportTimelineEvents(includePrivateNotes: boolean = false): Promise<void> {
  try {
    // Get all timeline events
    const events = await db.timeline.orderBy('date').toArray();

    // Get sticky notes (filter by privacy if needed)
    let stickyNotes: StickyNote[] = [];
    if (includePrivateNotes) {
      stickyNotes = await db.stickyNotes.toArray();
    } else {
      stickyNotes = await db.stickyNotes.filter(note => !note.is_private).toArray();
    }

    const exportData: TimelineExport = {
      timeline_events: events,
      sticky_notes: stickyNotes,
      exported_at: new Date().toISOString(),
      include_private_notes: includePrivateNotes,
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const fileName = `timeline-export-${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Timeline Data',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Success', `Data exported to ${fileName}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export timeline data');
  }
}

/**
 * Export spine items (for backup/recovery)
 */
export async function exportSpineItems(): Promise<void> {
  try {
    const spineItems = await db.spine.orderBy('timestamp').toArray();
    const sourceFiles = await db.sources.toArray();

    const exportData = {
      spine_items: spineItems,
      source_files: sourceFiles,
      exported_at: new Date().toISOString(),
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const fileName = `spine-backup-${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Spine Backup',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Success', `Spine backup exported to ${fileName}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export spine backup');
  }
}

/**
 * Prompt user about including private notes before export
 * Returns a promise that resolves to the user's choice
 */
export function promptIncludePrivateNotes(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Include Private Notes?',
      'Private notes are personal annotations not intended for sharing.\n\n' +
      '⚠️ If you include them, they will be visible in the exported file.',
      [
        {
          text: 'Exclude Private Notes',
          style: 'default',
          onPress: () => resolve(false),
        },
        {
          text: 'Include Private Notes',
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: false }
    );
  });
}

/**
 * Export full database with user prompt for private notes
 */
export async function exportFullDatabase(): Promise<void> {
  try {
    // Prompt user about private notes
    const includePrivateNotes = await promptIncludePrivateNotes();
    
    // Get all data
    const sourceFiles = await db.sources.toArray();
    const spineItems = await db.spine.orderBy('timestamp').toArray();
    const timelineEvents = await db.timeline.orderBy('date').toArray();
    
    // Get sticky notes (filter by privacy if needed)
    let stickyNotes: StickyNote[];
    if (includePrivateNotes) {
      stickyNotes = await db.stickyNotes.toArray();
    } else {
      stickyNotes = await db.stickyNotes.filter(note => !note.is_private).toArray();
    }

    const exportData: FullExport = {
      source_files: sourceFiles,
      spine_items: spineItems,
      timeline_events: timelineEvents,
      sticky_notes: stickyNotes,
      exported_at: new Date().toISOString(),
      include_private_notes: includePrivateNotes,
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const fileName = `casetimeline-full-export-${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export CaseTimeline Data',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Success', `Data exported to ${fileName}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export database');
  }
}

/**
 * Get export summary for preview
 */
export async function getExportSummary(): Promise<{
  spineCount: number;
  timelineCount: number;
  privateNotesCount: number;
  publicNotesCount: number;
  sourceFilesCount: number;
}> {
  const spineCount = await db.spine.count();
  const timelineCount = await db.timeline.count();
  const allNotes = await db.stickyNotes.toArray();
  const privateNotesCount = allNotes.filter(n => n.is_private).length;
  const publicNotesCount = allNotes.filter(n => !n.is_private).length;
  const sourceFilesCount = await db.sources.count();

  return {
    spineCount,
    timelineCount,
    privateNotesCount,
    publicNotesCount,
    sourceFilesCount,
  };
}
