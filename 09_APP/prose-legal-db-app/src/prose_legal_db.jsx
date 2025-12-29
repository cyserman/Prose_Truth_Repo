import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, 
  Calendar, 
  Package, 
  Download, 
  Upload, 
  Printer, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock,
  AlertCircle,
  ChevronRight,
  Database,
  Sparkles,
  BrainCircuit,
  Type,
  Loader2,
  Scale,
  Plus,
  StickyNote,
  ScanLine,
  MoreVertical,
  CheckCircle2,
  Trash2,
  FileImage,
  FileAudio,
  Eye,
  Camera,
  History,
  Copy,
  GitBranch,
  Mic,
  Square,
  FileJson
} from 'lucide-react';
import SmartSticky from './components/SmartSticky';
import { useStickyNotes } from './lib/useStickyNotes';
import SwimlaneTimeline from './components/SwimlaneTimeline';
import FloatingNoteConsole from './components/FloatingNoteConsole';

// --- Constants & Types ---
const LS_KEY = "PROSE_LEGAL_DB_V3";

const EVENT_TYPES = [
  'PFA', 'Custody_Exchange', 'Communication', 'Court_Filing', 
  'Court_Order', 'Financial', 'Housing', 'Vehicle', 
  'Employment', 'Third_Party', 'Other'
];

const TYPE_COLORS = {
  PFA: 'bg-red-100 text-red-800 border-red-200',
  Custody_Exchange: 'bg-blue-100 text-blue-800 border-blue-200',
  Court_Order: 'bg-purple-100 text-purple-800 border-purple-200',
  Vehicle: 'bg-orange-100 text-orange-800 border-orange-200',
  Communication: 'bg-green-100 text-green-800 border-green-200',
  Financial: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Housing: 'bg-amber-100 text-amber-800 border-amber-200',
  Other: 'bg-slate-100 text-slate-800 border-slate-200'
};

const INITIAL_EVENTS = [
  {
    event_id: 'EVT-001',
    event_date: '2025-12-10',
    event_type: 'Vehicle',
    short_title: 'F-250 Mechanical Failure',
    description: 'The truck completely died right when I was supposed to pick up the kids. I felt like I was being set up because I had no way to get there and the other party knew it.',
    description_original: '',
    source: 'Repair Estimate / Photos',
    exhibit_code: 'VEH-001',
    reliability: 'High'
  },
  {
    event_id: 'EVT-002',
    event_date: '2025-12-11',
    event_type: 'Communication',
    short_title: 'Exchange Interference',
    description: 'Tried to call 10 times to explain the truck issue. Every call was ignored and the AppClose app was showing as blocked. Pure parental alienation.',
    description_original: '',
    source: 'AppClose Screenshots',
    exhibit_code: 'CL-018',
    reliability: 'High'
  },
  // Imported from sticky_index.json (real case data)
  {
    event_id: 'sticky-2024-03-10',
    event_date: '2024-03-10',
    event_type: 'Communication',
    short_title: 'Wife blocked Sunday call',
    description: 'Scheduled Sunday call with children was blocked. Pattern of contact interference documented.',
    description_original: 'Wife blocked Sunday call',
    source: 'Call logs',
    exhibit_code: 'CUST-002, CUST-004',
    reliability: 'High'
  },
  {
    event_id: 'sticky-2024-06-01',
    event_date: '2024-06-01',
    event_type: 'Other',
    short_title: 'Kids mention baby sister',
    description: 'Children referenced baby sister during visit. Statement recorded with neutral tone.',
    description_original: 'Kids mention baby sister',
    source: 'Direct observation',
    exhibit_code: 'KIDS-001',
    reliability: 'High'
  },
  {
    event_id: 'sticky-2024-05-05',
    event_date: '2024-05-05',
    event_type: 'Vehicle',
    short_title: 'Ricky vehicle overnight at marital home',
    description: 'Third-party vehicle observed at marital residence overnight. One data point toward cohabitation pattern.',
    description_original: 'Ricky vehicle overnight at marital home',
    source: 'Photographic evidence',
    exhibit_code: 'SAFE-002',
    reliability: 'High'
  }
];

// --- Utilities ---

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const s = (text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  row.push(field);
  rows.push(row);
  return rows.filter(r => r.length > 1 || (r[0] && r[0].trim()));
}

// --- Gemini API Utilities ---
const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY || ""; 

const getMasterStrategyPrompt = (description, timeline) => `
You are an expert Pennsylvania Family Law paralegal and strategic legal consultant assisting a Pro Se father in a custody case. Your job has two parts:  
  
1) Neutralize emotional event descriptions  
2) Analyze the full timeline for strategy  
  
When given an event description and a timeline, follow these instructions carefully:  
  
**A. Neutralize the event description** - Rewrite the event description into a neutral, objective, “judge‑ready” factual statement.  
- Remove emotional language, speculation, and accusations.  
- Keep only concrete, observable facts, dates, times, and actions.  
- Write in clear, concise, professional prose (no bullet points).  
- Do not add new facts that are not in the original description.  
  
Event description to neutralize:  
"""  
${description}  
"""  
  
**B. Analyze the full timeline and propose strategy** The case timeline is formatted as:  
\`[YYYY-MM-DD] EVENT_TYPE: SHORT_TITLE – DESCRIPTION\`  
  
Timeline:  
"""  
${timeline}  
"""  
  
Your tasks:  
1. Identify concrete patterns of:  
    - Communication interference (e.g., blocked calls, ignored messages, app issues).  
    - Mechanical or logistical failures that impacted custody exchanges.  
    - Any “manufactured imbalance” or “manufactured status quo” in parenting time.  
2. Briefly explain how these patterns could be framed in a motion to restore structured custody and correct the imbalance, using cautious, court‑appropriate language.  
3. Propose exactly 3 concrete “Clean Moves” the father can take in the next filing or hearing (for example, targeted relief requests, narrowly tailored remedies, or specific documentation steps).  
  
**Output format:** 1. A short section titled \`Neutralized Description:\` followed by the rewritten version as a single paragraph.  
2. A short narrative analysis (2–5 paragraphs) of the timeline patterns.  
3. A numbered list labeled \`Clean Move 1\`, \`Clean Move 2\`, and \`Clean Move 3\`, each with 2–3 sentences.
`;

const getVisionAnalysisPrompt = () => `
You are a legal evidence analyst. Analyze this document image. 
1. Perform OCR to extract the main visible text (summarize if lengthy).
2. Identify the document type (e.g., Receipt, Screenshot, Letter, Court Order).
3. Assess its potential relevance to a custody or vehicle maintenance timeline.

Format the output exactly as follows for a sticky note:
TYPE: [Document Type]
DATE DETECTED: [Date if visible, else N/A]
SUMMARY: [1-2 sentence summary]
RELEVANCE: [Low/Medium/High - Reason]
`;

async function callGemini(prompt, imageBase64 = null, mimeType = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const parts = [{ text: prompt }];
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { mimeType: mimeType, data: imageBase64 } });
  }
  const payload = { contents: [{ parts: parts }] };
  const fetchWithRetry = async (retries = 0) => {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      if (retries < 5) {
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetry(retries + 1);
      }
      throw err;
    }
  };
  return fetchWithRetry();
}

// --- Components ---

const Badge = ({ children, className }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const DragDropZone = ({ onFileSelect, title, sub, icon: Icon, accept = "*", multiple = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onFileSelect(e.dataTransfer.files);
  };
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) onFileSelect(e.target.files);
  };
  return (
    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      className={`relative border-4 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center group cursor-pointer min-h-[200px] ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50'}`}>
      <input ref={fileInputRef} type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleChange} />
      <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-600'}`}><Icon className="w-10 h-10" /></div>
      <h4 className="font-bold text-lg text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-600 mb-4">{sub}</p>
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        Choose File
      </button>
      <p className="text-xs text-slate-500 mt-3">or drag & drop here</p>
    </div>
  );
};

const FILE_CATEGORIES = ['Incident', 'Communication', 'Evidence', 'Court Filing', 'Note', 'Other'];

const getFlagDescription = (flag) => {
  const descriptions = {
    'needs_evidence': 'This incident needs supporting evidence documents',
    'unlinked_evidence': 'This evidence should be linked to an incident',
    'link_required': 'Needs to be linked to an existing timeline event',
    'needs_source': 'Source or origin needs to be specified',
    'needs_verification': 'Requires verification before filing'
  };
  return descriptions[flag] || flag;
};

const getProcessingInfo = (fileName, fileType) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const info = {
    canProcess: false,
    handler: null,
    destination: null,
    action: null,
    reason: null,
    eta: null
  };

  if (ext === 'csv') {
    info.canProcess = true;
    info.handler = 'master_case_db_builder';
    info.destination = 'Database/Master_CaseDB.csv';
    info.action = 'merge';
    info.eta = '<instant>';
    info.reason = 'CSV will be merged into master timeline';
  } else if (['pdf', 'jpg', 'jpeg', 'png', 'tif', 'tiff'].includes(ext)) {
    info.canProcess = true;
    info.handler = 'standalone_ocr';
    info.destination = 'Database (after OCR)';
    info.action = 'extract_text';
    info.eta = '~30 seconds';
    info.reason = 'Will extract text via OCR';
  } else if (['docx', 'txt'].includes(ext)) {
    info.canProcess = true;
    info.handler = 'text_processor';
    info.destination = 'Database';
    info.action = 'index';
    info.eta = '<instant>';
    info.reason = 'Text file will be indexed';
  } else {
    info.canProcess = false;
    info.reason = `Unsupported format: .${ext}`;
    info.destination = 'Generated (manual processing)';
  }

  return info;
};

const FileOrganizerCard = ({ fileData, onUpdateNote, onDelete, onStatusChange, onAnalyze, onClassify, categories = [], flags = [], onPredictCategory, onStartTranscription, isTranscribing, transcriptionText, isPendingClassification = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isClassifying, setIsClassifying] = useState(isPendingClassification);
  const [logicWarnings, setLogicWarnings] = useState([]);
  
  const getIcon = (type) => {
    if (type.includes('image')) return FileImage;
    if (type.includes('audio')) return FileAudio;
    return FileText;
  };
  const FileIcon = getIcon(fileData.type);

  const handleAnalyzeClick = async () => {
    setIsMenuOpen(false); setIsAnalyzing(true);
    await onAnalyze(fileData.id);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending OCR': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'OCR Complete': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Filed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group">
      <div className="p-4 flex items-start gap-3 border-b border-slate-100">
        <div className="p-2 bg-slate-50 rounded-lg shrink-0"><FileIcon className="w-6 h-6 text-slate-500" /></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-slate-900 truncate" title={fileData.name}>{fileData.name}</h4>
          <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5 flex items-center gap-1">
            {fileData.isVersionUpdate && <GitBranch className="w-3 h-3 text-blue-500" />}
            {fileData.size}
          </p>
        </div>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
          {isMenuOpen && (
            <div className="absolute right-0 top-6 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
              <button onClick={handleAnalyzeClick} className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-indigo-700 flex items-center gap-2 border-b border-slate-100"><Sparkles className="w-3 h-3" /> ✨ AI Analyze / OCR</button>
              <button onClick={() => { onStatusChange(fileData.id, 'OCR Complete'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"><ScanLine className="w-3 h-3" /> Mark OCR Complete</button>
              <button onClick={() => { onStatusChange(fileData.id, 'Filed'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Mark as Filed</button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button onClick={() => { onDelete(fileData.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
            </div>
          )}
          {isMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />}
        </div>
      </div>
      <div className="p-4 flex-1">
        <div className="flex gap-2 mb-3 flex-wrap">
          <Badge className={getStatusColor(fileData.status)}>{fileData.status}</Badge>
          {categories.length > 0 && categories.map(cat => (
            <Badge key={cat} className="bg-indigo-100 text-indigo-700 border-indigo-200">{cat}</Badge>
          ))}
          {flags.length > 0 && flags.map(flag => (
            <Badge key={flag} className="bg-amber-100 text-amber-700 border-amber-200" title={getFlagDescription(flag)}>
              ⚠️ {flag.replace('_', ' ')}
            </Badge>
          ))}
        </div>
        {isPendingClassification && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-800">
            🆕 New file detected — Please classify to add to timeline
          </div>
        )}
        {/* Processing Info Display */}
        {(() => {
          const procInfo = getProcessingInfo(fileData.name, fileData.type);
          return (
            <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded text-[10px]">
              <div className="font-bold text-slate-700 mb-1">⚙️ Processing Info:</div>
              {procInfo.canProcess ? (
                <div className="space-y-0.5 text-slate-600">
                  <div>📍 <span className="font-semibold">Destination:</span> {procInfo.destination}</div>
                  <div>🔧 <span className="font-semibold">Handler:</span> {procInfo.handler}</div>
                  <div>⚡ <span className="font-semibold">Action:</span> {procInfo.action}</div>
                  <div>🕓 <span className="font-semibold">ETA:</span> {procInfo.eta}</div>
                </div>
              ) : (
                <div className="text-amber-700">
                  <div>⚠️ <span className="font-semibold">Cannot process:</span> {procInfo.reason}</div>
                  <div className="mt-1">💡 <span className="font-semibold">Suggestion:</span> Convert to supported format or process manually</div>
                </div>
              )}
            </div>
          );
        })()}
        {isClassifying ? (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="text-xs font-bold text-indigo-900 mb-2">Classify File:</div>
            {logicWarnings.length > 0 && (
              <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800">
                {logicWarnings.map((w, i) => <div key={i}>{w}</div>)}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {FILE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    if (onClassify) {
                      const warnings = onClassify(fileData.id, cat);
                      setLogicWarnings(warnings || []);
                    }
                    setIsClassifying(false);
                  }}
                  className="px-2 py-1 text-[10px] bg-white border border-indigo-300 rounded hover:bg-indigo-100 transition"
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsClassifying(false)} className="text-[10px] text-indigo-600 hover:underline">Cancel</button>
              {onPredictCategory && (
                <button 
                  onClick={() => {
                    onPredictCategory(fileData.id);
                    setIsClassifying(false);
                  }}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> AI Suggest
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setIsClassifying(true)}
              className="flex-1 px-2 py-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 transition flex items-center justify-center gap-1"
            >
              <Package className="w-3 h-3" /> {categories.length > 0 ? 'Edit Classification' : 'Classify File'}
            </button>
            {onPredictCategory && (
              <button
                onClick={() => onPredictCategory(fileData.id)}
                className="px-2 py-1 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition"
                title="AI category prediction"
              >
                <Sparkles className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <div className="text-xs text-slate-500 mb-1 font-bold">System Usage:</div>
        <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mb-4 min-h-[2.5em]">{fileData.usage || "Unassigned - Pending Indexing"}</div>
        <div className="relative group/note">
          <div className="absolute -top-2 left-2 bg-yellow-200 text-yellow-800 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10">
            <StickyNote className="w-3 h-3" /> STICKY NOTE
            {onStartTranscription && (
              <button
                onClick={() => onStartTranscription('file', fileData.id)}
                className="ml-1 p-0.5 hover:bg-yellow-300 rounded"
                title="Voice transcription"
              >
                <Mic className={`w-2.5 h-2.5 ${isTranscribing ? 'text-red-600 animate-pulse' : ''}`} />
              </button>
            )}
          </div>
          {isAnalyzing ? (
            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg h-24 flex flex-col items-center justify-center text-xs text-yellow-800 animate-pulse"><Loader2 className="w-4 h-4 mb-1 animate-spin" />Scanning Doc...</div>
          ) : (
            <>
              <textarea 
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 pt-4 text-xs text-slate-700 leading-relaxed resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none shadow-sm h-24 placeholder-yellow-800/30 font-mono"
                placeholder="Add instructions, context, or AI directives here..." 
                value={fileData.note} 
                onChange={(e) => onUpdateNote(fileData.id, e.target.value)} 
              />
              {isTranscribing && (
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <div className="bg-red-100 text-red-700 text-[9px] px-2 py-1 rounded flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    Listening...
                  </div>
                  <button
                    onClick={() => {
                      if (onStartTranscription) {
                        const currentNote = fileData.note || '';
                        onUpdateNote(fileData.id, currentNote + (currentNote ? '\n\n' : '') + transcriptionText);
                        onStartTranscription(null, null);
                      }
                    }}
                    className="bg-red-600 text-white text-[9px] px-2 py-1 rounded hover:bg-red-700"
                  >
                    Stop & Save
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProSeLegalDB() {
  const [view, setView] = useState('timeline');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [exhibits, setExhibits] = useState([]);
  const [files, setFiles] = useState([]); 
  const [notification, setNotification] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [neutralizingId, setNeutralizingId] = useState(null);
  const [csvPaste, setCsvPaste] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'textured'
  
  // Classification state for files
  const [classifyingFileId, setClassifyingFileId] = useState(null);
  const [fileCategories, setFileCategories] = useState({});
  const [fileFlags, setFileFlags] = useState({}); // needs_evidence, unlinked_evidence, link_required, needs_source, needs_verification
  const [pendingClassification, setPendingClassification] = useState(null); // {fileId, fileName} for auto-prompt
  
  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  
  // Voice transcription state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const recognitionRef = useRef(null);
  const [transcriptionTarget, setTranscriptionTarget] = useState(null); // {type: 'file'|'event', id: string}

  // Sticky notes
  const { notes, addNote, updateNote, deleteNote } = useStickyNotes();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.exhibits) setExhibits(parsed.exhibits);
        if (parsed.files) setFiles(parsed.files.map(f => ({...f, fileObj: null}))); 
        if (parsed.fileCategories) setFileCategories(parsed.fileCategories);
        if (parsed.fileFlags) setFileFlags(parsed.fileFlags);
        if (parsed.theme) setTheme(parsed.theme);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
  }, []);

  useEffect(() => {
    const payload = { 
      events, 
      exhibits, 
      files: files.map(f => ({...f, fileObj: null})),
      fileCategories,
      fileFlags,
      theme
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [events, exhibits, files, fileCategories, fileFlags, theme]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const timelineSummary = useMemo(() => 
    events.map(e => `[${e.event_date}] ${e.event_type}: ${e.short_title} - ${e.description}`).join('\n')
  , [events]);

  // --- SMART VERSIONING UPLOAD ---
  const handleRawFileUpload = (uploadedFiles) => {
    setFiles(prev => {
      const newFiles = [];
      let skippedCount = 0;
      let versionedCount = 0;
      
      Array.from(uploadedFiles).forEach(f => {
        const fileSize = (f.size / 1024).toFixed(2) + ' KB';
        
        // Check for Name collision
        const existingFile = prev.find(p => p.name === f.name);
        
        if (existingFile) {
          // Name Match Exists
          if (existingFile.size === fileSize) {
            // 1. Exact Duplicate (Name + Size) -> BLOCK
            skippedCount++;
          } else {
            // 2. Version Update (Name Match + Size Diff) -> VERSION
            const ver = new Date().toLocaleTimeString().replace(/:/g, ''); // Simple unique string
            const extIndex = f.name.lastIndexOf('.');
            const baseName = f.name.substring(0, extIndex);
            const ext = f.name.substring(extIndex);
            
            newFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              name: `${baseName} (v${ver})${ext}`, // Rename automatically
              size: fileSize,
              type: f.type,
              status: 'Pending OCR',
              usage: '',
              note: 'Auto-Ingest: Detected version update based on file size change.',
              addedAt: new Date().toLocaleDateString(),
              fileObj: f,
              isVersionUpdate: true
            });
            versionedCount++;
          }
        } else {
          // 3. New File -> ADD
          newFiles.push({
            id: Math.random().toString(36).substr(2, 9),
            name: f.name,
            size: fileSize,
            type: f.type,
            status: 'Pending OCR',
            usage: '',
            note: 'Auto-Ingest: Verify date and legibility.',
            addedAt: new Date().toLocaleDateString(),
            fileObj: f
          });
        }
      });
      
      if (skippedCount > 0) showNotification(`⚠️ Skipped ${skippedCount} exact duplicates.`);
      if (versionedCount > 0) showNotification(`🔄 Created ${versionedCount} new versions.`);
      
      // REFLEXIVE INTAKE: Auto-prompt for classification of new files
      if (newFiles.length > 0) {
        const firstNewFile = newFiles[0];
        setTimeout(() => {
          setPendingClassification({ fileId: firstNewFile.id, fileName: firstNewFile.name });
          setClassifyingFileId(firstNewFile.id);
        }, 500);
      }
      
      return [...prev, ...newFiles];
    });
  };

  const updateFileNote = (id, text) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, note: text } : f));
  };

  const updateFileStatus = (id, status) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };
  
  const deleteFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- MICROPHONE RECORDING ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const audioFile = new File([audioBlob], `voice_note_${timestamp}.webm`, { type: 'audio/webm' });
        
        // Add to files as if uploaded
        handleRawFileUpload([audioFile]);
        showNotification('🎤 Voice recording saved to Evidence Vault');
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      showNotification('❌ Microphone access denied. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // --- VOICE TRANSCRIPTION (Web Speech API) ---
  const startTranscription = (targetType, targetId) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showNotification('❌ Speech recognition not supported. Try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    setTranscriptionTarget({ type: targetType, id: targetId });
    setIsTranscribing(true);
    setTranscriptionText('');

    recognition.onstart = () => {
      showNotification('🎤 Listening... Speak now');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscriptionText(prev => prev + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        showNotification('⚠️ No speech detected. Try again.');
      } else {
        showNotification('❌ Transcription error: ' + event.error);
      }
      stopTranscription();
    };

    recognition.onend = () => {
      stopTranscription();
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsTranscribing(false);
    
    if (transcriptionTarget && transcriptionText.trim()) {
      if (transcriptionTarget.type === 'file' && transcriptionTarget.id) {
        const currentNote = files.find(f => f.id === transcriptionTarget.id)?.note || '';
        updateFileNote(transcriptionTarget.id, currentNote + (currentNote ? '\n\n' : '') + transcriptionText.trim());
        showNotification('✅ Transcription added to file note');
      } else if (transcriptionTarget.type === 'event') {
        // Could add to event description or note
        showNotification('✅ Transcription ready');
      }
    }
    
    setTranscriptionTarget(null);
    setTranscriptionText('');
  };

  // --- AI CATEGORY PREDICTION ---
  const predictFileCategory = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file || !file.note) {
      showNotification('⚠️ File needs a note or description for AI prediction');
      return;
    }

    try {
      const prompt = `Analyze this legal file description and suggest the most appropriate category(s) from this list: Incident, Communication, Evidence, Court Filing, Note, Other.

File description: "${file.note}"

Respond with ONLY the category name(s) separated by commas. If multiple apply, list them all. Example: "Evidence, Incident"`;

      const result = await callGemini(prompt);
      const suggested = result.split(',').map(c => c.trim()).filter(c => FILE_CATEGORIES.includes(c));
      
      if (suggested.length > 0) {
        setFileCategories(prev => ({
          ...prev,
          [fileId]: [...new Set([...(prev[fileId] || []), ...suggested])]
        }));
        showNotification(`🤖 AI suggests: ${suggested.join(', ')}`);
      } else {
        showNotification('🤖 AI could not determine category');
      }
    } catch (error) {
      console.error('Category prediction error:', error);
      showNotification('❌ AI prediction failed');
    }
  };

  // --- REFLEXIVE INTAKE AGENT: LOGIC CHECKS & FLAGGING ---
  const validateClassification = (fileId, newCategory) => {
    const currentCats = fileCategories[fileId] || [];
    const willHaveIncident = currentCats.includes('Incident') || newCategory === 'Incident';
    const willHaveEvidence = currentCats.includes('Evidence') || newCategory === 'Evidence';
    
    const warnings = [];
    const flags = [];
    
    if (willHaveIncident && !willHaveEvidence) {
      warnings.push('⚠️ Incident without Evidence? Consider adding supporting documents.');
      flags.push('needs_evidence');
    }
    
    if (willHaveEvidence && !willHaveIncident) {
      warnings.push('⚠️ Evidence without linked Incident? Consider linking to an event.');
      flags.push('unlinked_evidence');
    }
    
    // Update flags
    if (flags.length > 0) {
      setFileFlags(prev => ({
        ...prev,
        [fileId]: [...new Set([...(prev[fileId] || []), ...flags])]
      }));
    } else {
      // Clear flags if logic is satisfied
      setFileFlags(prev => {
        const updated = {...prev};
        if (updated[fileId]) {
          updated[fileId] = updated[fileId].filter(f => !['needs_evidence', 'unlinked_evidence'].includes(f));
          if (updated[fileId].length === 0) delete updated[fileId];
        }
        return updated;
      });
    }
    
    return warnings;
  };

  // --- GUARANTEED TIMELINE ENTRY FROM FILE ---
  const createTimelineEntryFromFile = (fileId, categories, note, flags) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const eventId = `FILE-${fileId.substring(0, 6).toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];
    
    const newEvent = {
      event_id: eventId,
      event_date: today,
      event_type: categories[0] || 'Other',
      short_title: `File: ${file.name}`,
      description: note || `File uploaded: ${file.name}. ${flags.length > 0 ? `Flags: ${flags.join(', ')}` : ''}`,
      description_original: note || '',
      description_neutral: '',
      source: 'File Upload',
      exhibit_code: '',
      reliability: flags.length > 0 ? 'Needs Review' : 'High'
    };

    setEvents(prev => [...prev, newEvent]);
    showNotification(`✅ File logged to timeline as ${eventId}`);
  };

  // --- MASTER NARRATIVE IMPORT ---
  const handleMasterNarrativeImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        let importedCount = 0;

        // Handle different JSON structures
        if (jsonData.case_database) {
          // Structure: { case_database: [...] }
          jsonData.case_database.forEach(item => {
            const event = {
              event_id: 'EVT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
              event_date: item.date || new Date().toISOString().split('T')[0],
              event_type: item.category?.replace(/_/g, ' ') || 'Other',
              short_title: item.entity || item.event_category || 'Imported Event',
              description: item.details || item.description || '',
              description_original: '',
              source: item.evidence || item.raw_evidence_source || 'Master Narrative Import',
              exhibit_code: '',
              reliability: 'High'
            };
            setEvents(prev => [...prev, event]);
            importedCount++;
          });
        } else if (Array.isArray(jsonData)) {
          // Structure: [{...}, {...}]
          jsonData.forEach(item => {
            const event = {
              event_id: 'EVT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
              event_date: item.date || new Date().toISOString().split('T')[0],
              event_type: item.event_category?.replace(/_/g, ' ') || item.category?.replace(/_/g, ' ') || 'Other',
              short_title: item.entity || item.event_category || 'Imported Event',
              description: item.description || item.details || '',
              description_original: '',
              source: item.evidence || item.raw_evidence_source || 'Master Narrative Import',
              exhibit_code: '',
              reliability: 'High'
            };
            setEvents(prev => [...prev, event]);
            importedCount++;
          });
        } else if (jsonData.case_timeline_entry) {
          // Single entry structure
          const item = jsonData.case_timeline_entry;
          const event = {
            event_id: 'EVT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            event_date: item.date || new Date().toISOString().split('T')[0],
            event_type: item.event_category?.type || item.event_category || 'Other',
            short_title: 'Imported Event',
            description: item.description || '',
            description_original: '',
            source: item.raw_evidence_source || 'Master Narrative Import',
            exhibit_code: '',
            reliability: 'High'
          };
          setEvents(prev => [...prev, event]);
          importedCount++;
        }

        showNotification(`✅ Imported ${importedCount} events from Master Narrative`);
        if (view === 'import') setView('timeline');
      } catch (error) {
        console.error('Import error:', error);
        showNotification('❌ Failed to import. Check JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyzeFile = async (fileId) => {
    const fileData = files.find(f => f.id === fileId);
    if (!fileData || !fileData.fileObj) {
      alert("No active file object found (files lost on refresh). Please re-upload for analysis.");
      return;
    }
    const toBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
    try {
      const base64Str = await toBase64(fileData.fileObj);
      const base64Data = base64Str.split(',')[1]; 
      const mimeType = fileData.type;
      if (!mimeType.startsWith('image/')) {
        updateFileNote(fileId, "AI Note: Automated OCR currently only supports Image files (JPG/PNG). Please manually transcribe.");
        return;
      }
      const analysis = await callGemini(getVisionAnalysisPrompt(), base64Data, mimeType);
      if (analysis) {
        updateFileNote(fileId, analysis);
        updateFileStatus(fileId, 'OCR Complete');
      }
    } catch (e) {
      console.error("Analysis Failed", e);
      updateFileNote(fileId, "AI Analysis Failed. Please check API Key or File Type.");
    }
  };

  const handleCSVUpload = (file, type) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = parseCSV(text); 
      if (rows.length < 2) return;
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => obj[header.replace(/ /g, '_')] = row[i]?.trim());
        if(!obj.event_id) obj.event_id = 'EVT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        return obj;
      });
      if (type === 'events') setEvents(data);
      if (type === 'exhibits') setExhibits(data);
      if (type === 'events' && view === 'import') setView('timeline');
    };
    reader.readAsText(file);
  };

  const handleNeutralize = async (eventId, currentDescription) => {
    setNeutralizingId(eventId);
    try {
      const prompt = getMasterStrategyPrompt(currentDescription, timelineSummary);
      const result = await callGemini(prompt);
      if (result) {
        const match = result.match(/Neutralized Description:\s*([\s\S]*?)(?=\n\d\.|\n\*\*|$)/i);
        const neutralized = match ? match[1].trim() : result;
        // CORRECT PATTERN: Preserve original in description, store AI output in description_neutral
        setEvents(prev => prev.map(e => {
          if (e.event_id === eventId) {
            return { 
              ...e, 
              description_neutral: neutralized,
              // Preserve original description if not already set
              description_original: e.description_original || currentDescription
            };
          }
          return e;
        }));
        setAnalysisResult(result);
        showNotification('✅ Neutral draft saved (original preserved)');
      }
    } catch (error) {
      console.error("Gemini Neutralize Error:", error);
      showNotification('❌ Neutralize failed: ' + (error?.message || 'Unknown error'));
    } finally {
      setNeutralizingId(null);
    }
  };

  const runStrategicAnalysis = async () => {
    setIsAnalyzing(true);
    setView('strategy');
    try {
      const focusDescription = events.length > 0 ? events[events.length - 1].description : "No specific event selected.";
      const prompt = getMasterStrategyPrompt(focusDescription, timelineSummary);
      const result = await callGemini(prompt);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("Error performing analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => filterType === 'All' || e.event_type === filterType)
      .filter(e => 
        e.short_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.exhibit_code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events, searchTerm, filterType]);

  const exportBackup = () => {
    const data = JSON.stringify({ events, exhibits, files: files.map(f => ({...f, fileObj: null})) }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prose_truth_repo_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const exportMarkdown = () => {
    let md = `# ProSe Legal Case Timeline\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    md += `---\n\n`;
    
    filteredEvents.forEach(event => {
      md += `## ${event.event_date} - ${event.short_title}\n\n`;
      md += `**Type:** ${event.event_type}\n\n`;
      md += `**Description:**\n${event.description}\n\n`;
      if (event.description_neutral) {
        md += `**Neutral Draft:**\n${event.description_neutral}\n\n`;
      }
      if (event.exhibit_code) {
        md += `**Exhibit:** ${event.exhibit_code}\n\n`;
      }
      md += `---\n\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timeline_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    showNotification('✅ Markdown exported');
  };

  const exportPDF = () => {
    setView('print');
    setTimeout(() => {
      window.print();
      setTimeout(() => setView('timeline'), 500);
    }, 100);
  };

  const clearStorage = () => {
    if(confirm("Are you sure? This will wipe all local data.")) {
        localStorage.removeItem(LS_KEY);
        setEvents(INITIAL_EVENTS);
        setExhibits([]);
        setFiles([]);
    }
  };

  // --- PASTE IMPORT (fallback when file chooser is fussy) ---
  const handlePasteImport = () => {
    if (!csvPaste.trim()) {
      showNotification("Paste area is empty");
      return;
    }
    setIsImporting(true);
    try {
      const rows = parseCSV(csvPaste);
      if (!rows.length) {
        showNotification("No rows found in pasted CSV");
        setIsImporting(false);
        return;
      }
      const headers = rows[0].map((h) => (h ?? '').toLowerCase().trim());
      const idxDate = headers.indexOf('date');
      const idxTitle = headers.indexOf('title');
      const idxDesc = headers.indexOf('description');
      const idxDescNeutral = headers.indexOf('description_neutral');
      const idxExhibits = headers.indexOf('exhibitrefs');
      const idxSource = headers.indexOf('source');

      const imported = [];
      rows.slice(1).forEach((r) => {
        const date = idxDate >= 0 ? r[idxDate]?.trim() : '';
        const title = idxTitle >= 0 ? r[idxTitle]?.trim() : '';
        const description = idxDesc >= 0 ? r[idxDesc]?.trim() : '';
        const description_neutral = idxDescNeutral >= 0 ? r[idxDescNeutral]?.trim() : '';
        const exhibitRefs = idxExhibits >= 0 ? r[idxExhibits]?.trim() : '';
        const source = idxSource >= 0 ? (r[idxSource]?.trim() || 'import') : 'import';

        if (!date && !title && !description && !exhibitRefs && !description_neutral) return;

        imported.push({
          id: `EVT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          event_date: date,
          event_type: 'Communication',
          short_title: title || '(untitled)',
          description, // Original description
          description_neutral: description_neutral || '', // AI-neutralized version
          description_original: description, // Preserve original
          source,
          exhibit_code: exhibitRefs,
          reliability: 'High',
        });
      });

      if (!imported.length) {
        showNotification("Nothing importable found in pasted CSV");
        setIsImporting(false);
        return;
      }

      setEvents((prev) => [...prev, ...imported]);
      showNotification(`Imported ${imported.length} event(s) from paste`);
      setCsvPaste('');
    } catch (err) {
      console.error(err);
      showNotification("Paste import failed. Check format.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- SEED IMPORT (pull from public/seed_timeline.csv for reliability) ---
  const handleSeedImport = async () => {
    setIsLoadingSeed(true);
    try {
      const res = await fetch('/seed_timeline.csv', { cache: 'no-store' });
      if (!res.ok) {
        showNotification('Seed file not found (seed_timeline.csv)');
        setIsLoadingSeed(false);
        return;
      }
      const text = await res.text();
      const rows = parseCSV(text);
      if (!rows.length) {
        showNotification('Seed CSV is empty');
        setIsLoadingSeed(false);
        return;
      }
      const headers = rows[0].map((h) => (h ?? '').toLowerCase().trim());
      const idxDate = headers.indexOf('date');
      const idxTitle = headers.indexOf('title');
      const idxDesc = headers.indexOf('description');
      const idxDescNeutral = headers.indexOf('description_neutral');
      const idxExhibits = headers.indexOf('exhibitrefs');
      const idxSource = headers.indexOf('source');

      const imported = [];
      rows.slice(1).forEach((r) => {
        const date = idxDate >= 0 ? r[idxDate]?.trim() : '';
        const title = idxTitle >= 0 ? r[idxTitle]?.trim() : '';
        const description = idxDesc >= 0 ? r[idxDesc]?.trim() : '';
        const description_neutral = idxDescNeutral >= 0 ? r[idxDescNeutral]?.trim() : '';
        const exhibitRefs = idxExhibits >= 0 ? r[idxExhibits]?.trim() : '';
        const source = idxSource >= 0 ? (r[idxSource]?.trim() || 'import') : 'import';

        if (!date && !title && !description && !exhibitRefs && !description_neutral) return;

        imported.push({
          event_id: `EVT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          event_date: date,
          event_type: 'Communication',
          short_title: title || '(untitled)',
          description, // Original description
          description_neutral: description_neutral || '', // AI-neutralized version
          description_original: description, // Preserve original
          source,
          exhibit_code: exhibitRefs,
          reliability: 'High',
        });
      });

      if (!imported.length) {
        showNotification('Seed CSV had no usable rows');
        setIsLoadingSeed(false);
        return;
      }

      setEvents((prev) => [...prev, ...imported]);
      showNotification(`Imported ${imported.length} event(s) from seed`);
      // move to timeline to show results
      setView('timeline');
    } catch (err) {
      console.error(err);
      showNotification('Seed import failed');
    } finally {
      setIsLoadingSeed(false);
    }
  };

  if (view === 'print') {
    return (
      <div className="bg-white p-12 min-h-screen text-slate-900 font-serif max-w-4xl mx-auto">
        <button onClick={() => setView('timeline')} className="print:hidden fixed top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <ChevronRight className="rotate-180 w-4 h-4" /> Exit Print Mode
        </button>
        <header className="border-b-2 border-slate-900 pb-4 mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight">Timeline of Material Events</h1>
          <p className="text-sm text-slate-600 italic">Exhibit A to Motion for Restored Parenting Time</p>
        </header>
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div key={event.event_id} className="border-b border-slate-100 pb-4 flex gap-6 page-break-inside-avoid">
              <div className="w-32 shrink-0 font-bold text-slate-700">{event.event_date}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg">{event.short_title}</h3>
                  <span className="text-xs font-mono font-bold border border-slate-300 px-2 py-0.5">{event.exhibit_code || '---'}</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-sm">{event.description}</p>
                {event.description_original && (
                   <div className="mt-2 text-[10px] text-slate-400 italic border-l-2 border-slate-200 pl-2">
                     Original Note: {event.description_original.substring(0, 50)}...
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Theme background classes
  const getThemeClass = () => {
    switch(theme) {
      case 'textured': return 'bg-textured-blue';
      case 'dark': return 'bg-textured-dark';
      default: return 'bg-textured-light';
    }
  };

  return (
    <div className={`flex h-screen ${getThemeClass()} text-slate-900 font-sans overflow-hidden`}>
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-in fade-in slide-in-from-bottom-2">
          {notification}
        </div>
      )}

      <aside className="w-72 glass-dark text-white flex flex-col shrink-0 border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col items-center justify-center gap-2 mb-1">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20 animate-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-center">ProSe Legal DB</h1>
          </div>
          <p className="text-[10px] text-orange-400/70 uppercase tracking-[0.2em] font-bold text-center">Cathedral Framework</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <button onClick={() => setView('timeline')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${view === 'timeline' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <Calendar className="w-4 h-4" /> Timeline
          </button>
          <button onClick={() => setView('swimlane')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${view === 'swimlane' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <History className="w-4 h-4" /> Swimlane View
          </button>
          <button onClick={() => setView('organizer')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${view === 'organizer' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <ScanLine className="w-4 h-4" /> Evidence Organizer
            <span className="ml-auto bg-slate-800/50 text-[10px] px-1.5 py-0.5 rounded-full border border-white/10">{files.length}</span>
          </button>
          
          <button onClick={() => setView('exhibits')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${view === 'exhibits' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <Package className="w-4 h-4" /> Exhibit Index
          </button>
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-orange-400/50 uppercase tracking-widest text-center">✨ Gemini Analysis</div>
          <button onClick={runStrategicAnalysis} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${view === 'strategy' ? 'btn-ember text-white font-bold' : 'text-blue-300 hover:bg-blue-950/30 hover:text-blue-200'}`}>
            <BrainCircuit className="w-4 h-4" /> Strategic Analyzer
          </button>

          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-orange-400/50 uppercase tracking-widest text-center">Utilities</div>
          <button onClick={() => setView('import')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${view === 'import' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={exportBackup} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition text-sm">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button onClick={exportMarkdown} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition text-sm">
            <FileText className="w-4 h-4" /> Export Markdown
          </button>
          <button onClick={exportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition text-sm">
            <Printer className="w-4 h-4" /> Export PDF
          </button>
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-orange-400/50 uppercase tracking-widest text-center">Theme</div>
          <div className="px-4 space-y-1">
            <button onClick={() => setTheme('light')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${theme === 'light' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              ☀️ Light
            </button>
            <button onClick={() => setTheme('dark')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${theme === 'dark' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              🌙 Dark
            </button>
            <button onClick={() => setTheme('textured')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${theme === 'textured' ? 'btn-ember text-white font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              🎨 Textured Blue
            </button>
          </div>
        </nav>
        
        <div className="p-4 card-cozy m-4 rounded-xl">
           <div className="flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-glow"></div>
               <span className="text-[10px] font-bold text-slate-300 uppercase">Auto-Save On</span>
             </div>
             <button onClick={clearStorage} className="text-[10px] text-red-400 hover:text-red-300 hover:underline">Clear Data</button>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold capitalize flex items-center gap-2">
              {view === 'strategy' && <Sparkles className="w-5 h-5 text-blue-500" />}
              {view === 'organizer' && <ScanLine className="w-5 h-5 text-blue-500" />}
              {view.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setView('print')} 
              disabled={filteredEvents.length === 0}
              className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition shadow-lg ${
                filteredEvents.length === 0 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'btn-ember'
              }`}
            >
              <Printer className="w-4 h-4" /> Print Judge-Ready PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          
          {view === 'organizer' && (
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-lg text-slate-900">Evidence Vault (Raw)</h3>
                   <p className="text-sm text-slate-500">Ingest raw files here before linking them to the master timeline.</p>
                </div>
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" /> Mandatory OCR
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DragDropZone 
                  onFileSelect={handleRawFileUpload} 
                  title="Drop Raw Evidence Files Here" 
                  sub="Supports PDF, JPG, PNG, Audio Recordings. Multiple files allowed."
                  icon={Upload}
                  multiple={true}
                />
                
                <div className="border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center bg-white hover:border-blue-400 hover:bg-slate-50">
                  <div className={`p-4 rounded-full mb-4 transition-colors ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-500'}`}>
                    {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    {isRecording ? `Recording... ${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, '0')}` : 'Record Voice Note'}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Click to start/stop recording</p>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
                      isRecording 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
              </div>

              {files.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-sm font-medium">No files in the vault. Drag and drop above to ingest evidence.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {files.map(file => (
                    <FileOrganizerCard 
                      key={file.id} 
                      fileData={file}
                      onUpdateNote={updateFileNote}
                      onStatusChange={updateFileStatus}
                      onDelete={deleteFile}
                      onAnalyze={handleAnalyzeFile}
                      onClassify={(id, category) => {
                        const warnings = validateClassification(id, category);
                        const newCats = fileCategories[id] 
                          ? [...fileCategories[id], category].filter((v, i, a) => a.indexOf(v) === i)
                          : [category];
                        
                        setFileCategories(prev => ({
                          ...prev,
                          [id]: newCats
                        }));
                        
                        // REFLEXIVE INTAKE: Auto-create timeline entry when classified
                        const file = files.find(f => f.id === id);
                        if (file && newCats.length > 0) {
                          const flags = fileFlags[id] || [];
                          createTimelineEntryFromFile(id, newCats, file.note, flags);
                        }
                        
                        showNotification(`✅ Classified as ${category}`);
                        return warnings;
                      }}
                      categories={fileCategories[file.id] || []}
                      flags={fileFlags[file.id] || []}
                      isPendingClassification={pendingClassification?.fileId === file.id}
                      onPredictCategory={predictFileCategory}
                      onStartTranscription={startTranscription}
                      isTranscribing={isTranscribing && transcriptionTarget?.id === file.id}
                      transcriptionText={transcriptionTarget?.id === file.id ? transcriptionText : ''}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'timeline' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search master timeline..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="All">All Categories</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-[0.1em] font-black text-slate-500 border-b border-slate-200">
                        <th className="px-6 py-4 w-32">Date</th>
                        <th className="px-6 py-4 w-40">Classification</th>
                        <th className="px-6 py-4">Event Description & Action</th>
                        <th className="px-6 py-4 w-32 text-center">Exhibit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEvents.map((event) => (
                        <tr key={event.event_id} className="hover:bg-slate-50/50 transition group items-start">
                          <td className="px-6 py-5 align-top">
                            <div className="font-bold text-slate-800 text-sm">{event.event_date}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1">{event.event_id}</div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <Badge className={TYPE_COLORS[event.event_type] || TYPE_COLORS.Other}>{event.event_type?.replace('_', ' ')}</Badge>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="font-bold text-slate-950 mb-1 leading-tight">{event.short_title}</div>
                                <div className="text-sm text-slate-600 leading-relaxed mb-3">{event.description}</div>
                                {event.description_neutral && (
                                  <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs">
                                    <div className="font-semibold text-indigo-900 mb-1">Neutral Draft (AI):</div>
                                    <div className="text-indigo-700">{event.description_neutral}</div>
                                  </div>
                                )}
                                {event.description_original && event.description_original !== event.description && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                                    <History className="w-3 h-3" /> 
                                    <span className="italic">Original version preserved in history.</span>
                                  </div>
                                )}
                                <button
                                  onClick={() => addNote({ text: '', targetFile: event.short_title || event.event_id, x: 200, y: 200 })}
                                  className="mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200 transition flex items-center gap-1"
                                >
                                  <StickyNote className="w-3 h-3" /> Add Note
                                </button>
                              </div>
                              <button onClick={() => handleNeutralize(event.event_id, event.description)} disabled={neutralizingId === event.event_id}
                                className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition disabled:opacity-50">
                                {neutralizingId === event.event_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                ✨ NEUTRALIZE
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 italic">Source: {event.source}</div>
                          </td>
                          <td className="px-6 py-5 align-top text-center">
                            {event.exhibit_code ? (
                              <div className="inline-flex items-center gap-1.5 text-blue-700 font-mono text-[11px] font-bold bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200"><FileText className="w-3.5 h-3.5" /> {event.exhibit_code}</div>
                            ) : <span className="text-slate-300 italic text-[10px]">Unlinked</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {view === 'strategy' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit className="w-32 h-32" /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4"><Sparkles className="w-6 h-6 text-blue-400" /><h3 className="text-2xl font-bold tracking-tight">✨ Strategic Analyzer Output</h3></div>
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4"><Loader2 className="w-10 h-10 text-blue-400 animate-spin" /><p className="text-slate-400 font-medium animate-pulse">Consulting the framework and scanning timeline for patterns...</p></div>
                  ) : (
                    <div className="prose prose-invert max-w-none"><div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-serif text-lg">{analysisResult || "Load your timeline and click Analyze to generate strategic insights based on the master prompt."}</div></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'import' && (
            <div className="max-w-2xl mx-auto space-y-8 pt-12">
              <div className="text-center mb-12">
                <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Import System Data</h2>
                <p className="text-slate-500">Import structured CSVs, paste CSV text, or load the bundled seed.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <DragDropZone onFileSelect={(f) => handleCSVUpload(f[0], 'events')} title="Master Timeline" sub="NORMALIZED_TIMELINE.csv (Quote Aware)" icon={Calendar} accept=".csv" />
                 <DragDropZone onFileSelect={(f) => handleCSVUpload(f[0], 'exhibits')} title="Exhibit Index" sub="EXHIBIT_INDEX.csv" icon={Package} accept=".csv" />
                 <div className="border-2 border-dashed rounded-2xl p-4 bg-white space-y-2">
                   <div className="font-bold text-slate-900">Fallbacks</div>
                   <div className="text-xs text-slate-600">
                     <div className="mb-2">
                       <span className="font-semibold">Paste CSV:</span> If the file picker won't open, paste CSV text here. Expected headers: date,title,description,description_neutral,exhibitRefs,source.
                     </div>
                    <textarea
                      className="w-full border rounded-lg p-2 text-xs font-mono h-24"
                      value={csvPaste}
                      onChange={(e) => setCsvPaste(e.target.value)}
                      placeholder={"date,title,description,description_neutral,exhibitRefs,source\\n2024-11-03,SMS - Paige Wife,Good morning,, ,SMS Backup"}
                    />
                     <button
                       onClick={handlePasteImport}
                       disabled={isImporting}
                       className="mt-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 w-full"
                     >
                       {isImporting ? "Importing..." : "Import from Paste"}
                     </button>
                   </div>
                   <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                     <div className="font-semibold mb-1 text-base">⚡ QUICK LOAD</div>
                     <p className="mb-2">Click below to instantly load 5 critical events (Gas Incident, PFA Filing, Camper Incident, AppClose blocking).</p>
                     <button
                       onClick={handleSeedImport}
                       disabled={isLoadingSeed}
                       className="px-4 py-3 rounded-lg bg-emerald-600 text-white text-base font-bold hover:bg-emerald-700 disabled:opacity-60 w-full shadow-lg"
                     >
                       {isLoadingSeed ? "⏳ Loading..." : "✅ Load seed timeline (5 events)"}
                     </button>
                     <p className="mt-2 text-xs text-slate-500">File: /public/seed_timeline.csv</p>
                   </div>
                 </div>
              </div>
            </div>
          )}



           {view === 'exhibits' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 items-start"><AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" /><div><h4 className="font-bold text-blue-900 text-sm">Exhibit Integrity</h4><p className="text-blue-700 text-xs">Ensure all files in your Evidence Vault are linked here.</p></div></div>
              <Card><div className="p-12 text-center text-slate-500"><Package className="w-12 h-12 mx-auto mb-4 text-slate-300"/><h3 className="font-bold">Exhibit Index</h3><p className="text-sm">Populated via Import CSV.</p></div></Card>
            </div>
          )}

        </div>
      </main>

      {/* Render floating sticky notes */}
      {notes.map((note) => (
        <SmartSticky
          key={note.id}
          {...note}
          onSave={updateNote}
          onClose={(id) => deleteNote(id)}
        />
      ))}
    </div>
  );
}