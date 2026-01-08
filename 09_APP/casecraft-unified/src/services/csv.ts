/**
 * CSV Service
 * Handles CSV import/export for evidence data
 */

import Papa from 'papaparse';
import type { EvidenceItem } from '../types';
import { EvidenceType, VerificationStatus } from '../types';

/**
 * Generate SHA-256 hash for content
 */
async function generateHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Import evidence from CSV file
 */
export async function importCSV(file: File): Promise<EvidenceItem[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const evidence: EvidenceItem[] = [];

                    for (const row of results.data as any[]) {
                        // Generate hash for content
                        const hash = await generateHash(row.content || row.Content || '');

                        const item: EvidenceItem = {
                            id: row.id || row.ID || `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            type: (row.type || row.Type || EvidenceType.INCIDENT) as EvidenceType,
                            sender: row.sender || row.Sender || row.Source || 'Unknown',
                            content: row.content || row.Content || row.Description || '',
                            timestamp: row.timestamp || row.Timestamp || row.Date || new Date().toISOString(),
                            hash,
                            verified: row.verified === 'true' || row.Verified === 'true' || false,
                            verificationStatus: (row.verificationStatus || row.VerificationStatus || VerificationStatus.PENDING) as VerificationStatus,
                            isInTimeline: row.isInTimeline === 'true' || row.InTimeline === 'true' || false,
                            exhibitCode: row.exhibitCode || row.ExhibitCode || row.Exhibit || '',
                            lane: row.lane || row.Lane || row.Category || 'OTHER',
                            tags: row.tags ? row.tags.split(',').map((t: string) => t.trim().toUpperCase()) : [],
                            notes: row.notes || row.Notes || '',
                        };

                        evidence.push(item);
                    }

                    resolve(evidence);
                } catch (error) {
                    reject(error);
                }
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}

/**
 * Export evidence to CSV
 */
export function exportCSV(evidence: EvidenceItem[], filename: string = 'casecraft-export.csv'): void {
    const csvData = evidence.map(item => ({
        ID: item.id,
        Type: item.type,
        Sender: item.sender || '',
        Content: item.content,
        Timestamp: item.timestamp,
        Hash: item.hash,
        Verified: item.verified,
        VerificationStatus: item.verificationStatus,
        InTimeline: item.isInTimeline,
        ExhibitCode: item.exhibitCode || '',
        Lane: item.lane || '',
        Tags: item.tags?.join(', ') || '',
        Notes: item.notes || '',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Export state as JSON backup
 */
export function exportJSON(data: any, filename: string = 'casecraft-backup.json'): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Import state from JSON backup
 */
export async function importJSON(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
