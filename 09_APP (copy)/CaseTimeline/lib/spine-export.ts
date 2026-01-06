/**
 * Spine-based Timeline Export
 * 
 * Exports timeline events from database with optional sticky notes.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { db } from './spine-db';
import { TimelineEvent, StickyNote } from '@/types/spine';

export interface TimelineExport {
  timeline_events: TimelineEvent[];
  sticky_notes?: StickyNote[];
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

