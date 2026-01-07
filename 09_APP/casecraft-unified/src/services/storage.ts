/**
 * LocalStorage Service
 * Provides type-safe access to browser LocalStorage for app state persistence
 */

import type { AppState, EvidenceItem, StickyNote, Deadline } from '../types';

const STORAGE_KEY = 'CASECRAFT_UNIFIED_V1';
const SCHEMA_VERSION = '1.0.0';

/**
 * Default app state
 */
const DEFAULT_STATE: AppState = {
    version: SCHEMA_VERSION,
    evidence: [],
    stickyNotes: [],
    deadlines: [],
    contradictions: [],
    files: [],
    settings: {
        theme: 'light',
        autoSave: true,
        offlineMode: false,
        apiKeyConfigured: false,
        defaultLane: 'CUSTODY',
        showVerifiedOnly: false,
        compactMode: false,
    },
    lastSync: new Date().toISOString(),
};

/**
 * Load app state from LocalStorage
 */
export function loadState(): AppState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return DEFAULT_STATE;
        }

        const parsed = JSON.parse(stored) as AppState;

        // Version migration logic (future-proofing)
        if (parsed.version !== SCHEMA_VERSION) {
            console.warn(`Schema version mismatch: ${parsed.version} vs ${SCHEMA_VERSION}`);
            // TODO: Add migration logic here when schema changes
        }

        return parsed;
    } catch (error) {
        console.error('Failed to load state from LocalStorage:', error);
        return DEFAULT_STATE;
    }
}

/**
 * Save app state to LocalStorage
 */
export function saveState(state: Partial<AppState>): boolean {
    try {
        const currentState = loadState();
        const newState: AppState = {
            ...currentState,
            ...state,
            lastSync: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return true;
    } catch (error) {
        console.error('Failed to save state to LocalStorage:', error);
        return false;
    }
}

/**
 * Save evidence items
 */
export function saveEvidence(evidence: EvidenceItem[]): boolean {
    return saveState({ evidence });
}

/**
 * Save sticky notes
 */
export function saveStickyNotes(stickyNotes: StickyNote[]): boolean {
    return saveState({ stickyNotes });
}

/**
 * Save deadlines
 */
export function saveDeadlines(deadlines: Deadline[]): boolean {
    return saveState({ deadlines });
}

/**
 * Clear all app data (useful for starting fresh)
 */
export function clearState(): boolean {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear state:', error);
        return false;
    }
}

/**
 * Export app state as JSON (for backup)
 */
export function exportStateAsJSON(): string {
    const state = loadState();
    return JSON.stringify(state, null, 2);
}

/**
 * Import app state from JSON (for restore)
 */
export function importStateFromJSON(json: string): boolean {
    try {
        const parsed = JSON.parse(json) as AppState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
    } catch (error) {
        console.error('Failed to import state:', error);
        return false;
    }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) || '';
        const usedBytes = new Blob([stored]).size;
        const availableBytes = 5 * 1024 * 1024; // 5MB typical LocalStorage limit

        return {
            used: usedBytes,
            available: availableBytes,
            percentage: (usedBytes / availableBytes) * 100,
        };
    } catch (error) {
        return { used: 0, available: 0, percentage: 0 };
    }
}
