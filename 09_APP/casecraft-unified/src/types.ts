/**
 * CaseCraft Unified - Type Definitions
 * Combines types from both casecraft-pro and prose-legal-db-app
 */

// ============================================================================
// Evidence & Event Types
// ============================================================================

export enum EvidenceType {
    INCIDENT = 'INCIDENT',
    DOCUMENT = 'DOCUMENT',
    MESSAGE = 'MESSAGE',
    COMMUNICATION = 'COMMUNICATION',
    PHOTO = 'PHOTO',
    AUDIO = 'AUDIO',
    VIDEO = 'VIDEO',
    OTHER = 'OTHER',
}

export enum EventType {
    PFA = 'PFA',
    CUSTODY_EXCHANGE = 'Custody_Exchange',
    COMMUNICATION = 'Communication',
    COURT_FILING = 'Court_Filing',
    COURT_ORDER = 'Court_Order',
    FINANCIAL = 'Financial',
    HOUSING = 'Housing',
    VEHICLE = 'Vehicle',
    EMPLOYMENT = 'Employment',
    THIRD_PARTY = 'Third_Party',
    OTHER = 'Other',
}

export enum VerificationStatus {
    VERIFIED = 'VERIFIED',
    PENDING = 'PENDING',
    DISPUTED = 'DISPUTED',
    UNVERIFIED = 'UNVERIFIED',
}

export enum Reliability {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

// ============================================================================
// Swimlane Types
// ============================================================================

export type SwimLane =
    | 'CUSTODY'
    | 'FINANCIAL'
    | 'PROCEDURAL'
    | 'SAFETY'
    | 'COMMUNICATION'
    | 'HOUSING'
    | 'EMPLOYMENT'
    | 'OTHER';

// ============================================================================
// Main Evidence Item (Unified Schema)
// ============================================================================

export interface EvidenceItem {
    // Core identification
    id: string;
    eventId?: string;                    // Ex-A-01, CUST-002, etc.

    // Categorization
    type: EvidenceType;
    eventType?: EventType;

    // Content
    shortTitle?: string;
    content: string;
    description?: string;                // Neutralized description
    descriptionOriginal?: string;        // Raw emotional text

    // Metadata
    sender?: string;
    source?: string;
    timestamp: string;                   // ISO 8601
    eventDate?: string;

    // Verification
    hash: string;                        // SHA-256
    verified: boolean;
    verificationStatus: VerificationStatus;
    reliability?: Reliability;

    // Organization
    exhibitCode?: string;
    lane?: SwimLane;
    tags: string[];
    isInTimeline: boolean;

    // Additional data
    notes?: string;                      // Private work-product notes
    contentNeutral?: string;             // AI-neutralized content
    attachments?: Attachment[];

    // Audit trail
    createdAt?: string;
    updatedAt?: string;
}

// ============================================================================
// Attachments
// ============================================================================

export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    filePath: string;                    // Relative to Truth Repo
    fileSize: number;
    uploadedAt: string;
    hash?: string;                       // SHA-256 of file
}

// ============================================================================
// Navigation & UI
// ============================================================================

export enum ActiveLayer {
    DASHBOARD = 'DASHBOARD',
    SPINE = 'SPINE',
    TIMELINE = 'TIMELINE',
    SWIMLANE = 'SWIMLANE',
    NOTES = 'NOTES',
    AI = 'AI',
    LIVE = 'LIVE',
    KNOWLEDGE = 'KNOWLEDGE',
    MOTIONS = 'MOTIONS',
    DEADLINES = 'DEADLINES',
    ORGANIZER = 'ORGANIZER',
}

// ============================================================================
// Sticky Notes
// ============================================================================

export interface StickyNote {
    id: string;
    text: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    color?: string;
    createdAt?: string;
    linkedEvidenceId?: string;           // Link to evidence item
}

// ============================================================================
// Deadlines
// ============================================================================

export interface Deadline {
    id: string;
    title: string;
    dueDate: string;                     // ISO 8601
    description?: string;
    completed: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'COURT' | 'FILING' | 'DISCOVERY' | 'OTHER';
    linkedEvidenceIds?: string[];
}

// ============================================================================
// Contradiction Detection
// ============================================================================

export interface Contradiction {
    id: string;
    statement1: string;
    statement2: string;
    evidenceId1: string;
    evidenceId2: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    explanation: string;
    detectedAt: string;
}

// ============================================================================
// File Organization
// ============================================================================

export interface FileData {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    category?: string;
    status: 'NEW' | 'REVIEWED' | 'PROCESSED' | 'ARCHIVED';
    notes?: string;
    uploadedAt: string;
    flags?: string[];
    analysisResult?: string;             // AI analysis from Gemini
    transcription?: string;              // Audio transcription
}

// ============================================================================
// App State (LocalStorage)
// ============================================================================

export interface AppState {
    version: string;                     // Schema version for migrations
    evidence: EvidenceItem[];
    stickyNotes: StickyNote[];
    deadlines: Deadline[];
    contradictions?: Contradiction[];
    files?: FileData[];
    settings: AppSettings;
    lastSync: string;
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'auto';
    autoSave: boolean;
    offlineMode: boolean;
    apiKeyConfigured: boolean;           // Boolean flag only
    defaultLane: SwimLane;
    showVerifiedOnly: boolean;
    compactMode: boolean;
}

// ============================================================================
// AI / Gemini Integration
// ============================================================================

export interface AIAnalysisRequest {
    evidenceItems: EvidenceItem[];
    analysisType: 'STRATEGY' | 'CONTRADICTION' | 'NEUTRALIZE' | 'VISION';
    prompt?: string;
}

export interface AIAnalysisResponse {
    success: boolean;
    result: string;
    confidence?: number;
    timestamp: string;
    error?: string;
}

// ============================================================================
// Truth Repo Integration
// ============================================================================

export interface TruthRepoConfig {
    rootPath: string;                    // /home/cyserman/Projects/Prose_Truth_Repo
    anchorsPath: string;                 // 00_ANCHORS/
    timelinesPath: string;               // 02_TIMELINES/
    exhibitsPath: string;                // 03_EXHIBITS/
    scansPath: string;                   // 06_SCANS/
    legalResearchPath: string;           // 07_LEGAL_RESEARCH/
}

// ============================================================================
// CSV Import/Export
// ============================================================================

export interface CSVRow {
    [key: string]: string;
}

export interface CSVImportResult {
    success: boolean;
    itemsImported: number;
    items: EvidenceItem[];
    errors: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
    eventTypes?: EventType[];
    verificationStatus?: VerificationStatus[];
    lanes?: SwimLane[];
    dateRange?: { start: string; end: string };
    searchQuery?: string;
    tags?: string[];
}

export interface SortOptions {
    field: keyof EvidenceItem;
    order: SortOrder;
}
