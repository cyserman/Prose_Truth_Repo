/**
 * Export Utilities
 * 
 * Export bundle includes:
 * - exhibits index
 * - master timeline
 * - comm spine
 * - JSON database dump
 * - optional "judge-ready PDF" build later
 */

import JSZip from 'jszip';
import { db } from './db';
import { exportCommSpineToCSV } from './spine/commSpineBuilder';
import { exportTimelineToCSV } from './spine/timelineBuilder';

/**
 * Download text file
 */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export exhibits index to CSV
 */
export async function exportExhibitsIndex(): Promise<string> {
  const exhibits = await db.exhibits.toArray();
  
  const headers = ['exhibit_code', 'title', 'category', 'file_path', 'date_added'];
  const rows = exhibits.map(ex => [
    ex.exhibit_code,
    escapeCSV(ex.title),
    escapeCSV(ex.category),
    escapeCSV(ex.file_path),
    ex.date_added,
  ]);
  
  const csvRows = [headers, ...rows].map(row => row.join(','));
  return csvRows.join('\n');
}

/**
 * Export comm spine to CSV
 */
export async function exportCommSpine(): Promise<string> {
  const comms = await db.comms.toArray();
  return exportCommSpineToCSV(comms);
}

/**
 * Export timeline to CSV
 */
export async function exportTimeline(): Promise<string> {
  const events = await db.timeline_events.toArray();
  return exportTimelineToCSV(events);
}

/**
 * Export full database as JSON
 */
export async function exportDatabaseJSON(): Promise<string> {
  const data = {
    scans: await db.scans.toArray(),
    comms: await db.comms.toArray(),
    timeline_events: await db.timeline_events.toArray(),
    exhibits: await db.exhibits.toArray(),
    mappings: await db.mappings.toArray(),
    exported_at: new Date().toISOString(),
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Export Truth Repo bundle (ZIP)
 * 
 * Includes all CSV exports + JSON dump
 */
export async function exportTruthRepoBundle(): Promise<Blob> {
  const zip = new JSZip();
  
  // Add CSV files
  zip.file('exhibits_index.csv', await exportExhibitsIndex());
  zip.file('comm_spine.csv', await exportCommSpine());
  zip.file('master_timeline.csv', await exportTimeline());
  
  // Add JSON dump
  zip.file('database_dump.json', await exportDatabaseJSON());
  
  // Add README
  const readme = `Truth Repo Export Bundle
Generated: ${new Date().toISOString()}

Files:
- exhibits_index.csv: Exhibit catalog
- comm_spine.csv: Communication spine (private, chronological)
- master_timeline.csv: Judge-facing timeline events
- database_dump.json: Full database export

This bundle contains all case data as of export date.
`;
  zip.file('README.txt', readme);
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download Truth Repo bundle
 */
export async function downloadTruthRepoBundle(): Promise<void> {
  const blob = await exportTruthRepoBundle();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `truth-repo-export-${new Date().toISOString().split('T')[0]}.zip`;
  a.click();
  URL.revokeObjectURL(url);
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

