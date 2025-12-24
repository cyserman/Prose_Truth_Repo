import Dexie from 'dexie';

// Version 2: Narrative-Aware Schema
class ProSeLegalDB extends Dexie {
  constructor() {
    super('ProSeLegalDB');
    
    // Version 2 Schema
    this.version(2).stores({
      timelineEvents: '++id, event_id, event_date, event_type, exhibit_code, legalRelevance, financialImpact',
      exhibits: '++id, exhibit_code, title, file_path, category, date_added',
      narratives: '++id, narrative_id, title, content, neutral_text, date_created, last_updated',
      commSpine: '++id, entry_id, timestamp, sender, recipient, content, neutral_text, linked_event_id',
      strategicNotes: '++id, note_id, category, content, date_created'
    });
  }
}

export const db = new ProSeLegalDB();

