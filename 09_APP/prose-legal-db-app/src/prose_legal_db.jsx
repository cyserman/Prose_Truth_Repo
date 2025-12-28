import React, { useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------- local storage ----------------------------- */

const LS_KEY = "PROSE_LEGAL_DB_V2";

function safeJsonParse(str, fallback) {
  try {
    const v = JSON.parse(str);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/* ------------------------------ CSV parsing ------------------------------ */
/**
 * Minimal RFC4180-ish CSV parser:
 * - Handles quoted fields with commas/newlines inside
 * - Handles escaped quotes ("")
 * - Returns array of rows (array of strings)
 */
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
        const next = s[i + 1];
        if (next === '"') {
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

  if (rows.length && rows[rows.length - 1].every((c) => (c ?? "").trim() === "")) {
    rows.pop();
  }

  return rows;
}

function toHeaderMap(headerRow) {
  const map = new Map();
  headerRow.forEach((h, idx) => map.set((h ?? "").trim().toLowerCase(), idx));
  return map;
}

function getCell(row, headerMap, key, fallback = "") {
  const idx = headerMap.get(key.toLowerCase());
  if (idx === undefined) return fallback;
  return (row[idx] ?? fallback).toString();
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* ------------------------------ formatting ------------------------------ */

function formatDateInput(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function sortByDateAsc(a, b) {
  const da = new Date(a.date || 0).getTime();
  const db = new Date(b.date || 0).getTime();
  return da - db;
}

function normalizeCodes(str) {
  const parts = (str ?? "")
    .split(/[,;\n]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const p of parts) {
    const key = p.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------- Gemini helpers ---------------------------- */

const DEFAULT_MODEL = "gemini-2.0-flash";
// Environment variable approach with fallback
let GEMINI_KEY = "";
let GEMINI_MODEL = DEFAULT_MODEL;
try {
  GEMINI_KEY = import.meta.env?.VITE_GEMINI_API_KEY || "";
  GEMINI_MODEL = import.meta.env?.VITE_GEMINI_MODEL || DEFAULT_MODEL;
} catch (e) {
  // Environment variable loading failed
}
// Fallback for local development
if (!GEMINI_KEY) {
  GEMINI_KEY = "AIzaSyDAJ0UJeZOjTQHRRMkbmWv1wg93wBebiOo";
}

async function geminiGenerateText({ prompt, system, temperature = 0.3 }) {
  if (!GEMINI_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add it to .env and restart the dev server.");
  }
  const model = GEMINI_MODEL || DEFAULT_MODEL;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          ...(system ? [{ text: `SYSTEM:\n${system}\n\n` }] : []),
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 650,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini error ${res.status}: ${t}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") || "";
  return text.trim();
}

/* ----------------------------- UI components ----------------------------- */

function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.2)",
        background: "rgba(0,0,0,0.04)",
        marginLeft: 8,
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, children, right }) {
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        <div>{right}</div>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 4, showMic = false, onMicResult }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        const newValue = value ? value + ' ' + finalTranscript : finalTranscript;
        onChange(newValue);
        if (onMicResult) onMicResult(newValue);
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={true}
        style={{
          width: "100%",
          borderRadius: 10,
          border: isListening ? "2px solid #ef4444" : "1px solid rgba(0,0,0,0.2)",
          padding: 10,
          paddingRight: showMic ? 44 : 10,
          fontFamily: "inherit",
          fontSize: 14,
          resize: "vertical",
          background: isListening ? "rgba(239, 68, 68, 0.05)" : "white",
        }}
      />
      {showMic && (
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          title={isListening ? "Stop listening (click to stop)" : "Start voice input (click to speak)"}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: isListening ? "#ef4444" : "rgba(0,0,0,0.08)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            transition: "all 0.2s",
            animation: isListening ? "pulse 1.5s infinite" : "none",
          }}
        >
          {isListening ? "⏹️" : "🎤"}
        </button>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", list }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      list={list}
      style={{
        width: "100%",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.2)",
        padding: 10,
        fontFamily: "inherit",
        fontSize: 14,
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.2)",
        padding: "8px 10px",
        fontFamily: "inherit",
        fontSize: 14,
        background: "white",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Button({ children, onClick, disabled, variant = "primary", title }) {
  const bg =
    variant === "danger" ? "rgba(255,0,0,0.08)" : variant === "ghost" ? "transparent" : "rgba(0,0,0,0.06)";
  const border = variant === "ghost" ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(0,0,0,0.12)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        border,
        background: bg,
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 14,
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

function Hr() {
  return <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "12px 0" }} />;
}

/* ------------------------------- main app -------------------------------- */

export default function ProSeLegalDB() {
  const [printMode, setPrintMode] = useState(false);
  const [printPolicy, setPrintPolicy] = useState("original");

  const [caseName, setCaseName] = useState("Firey v. Firey");
  const [court, setCourt] = useState("Montgomery County, Pennsylvania");
  const [matter, setMatter] = useState("Divorce & Custody");

  const [events, setEvents] = useState([]);
  const [exhibits, setExhibits] = useState([]);

  const [newEventDate, setNewEventDate] = useState(formatDateInput(new Date()));
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventExhibits, setNewEventExhibits] = useState("");

  const [newExCode, setNewExCode] = useState("");
  const [newExTitle, setNewExTitle] = useState("");
  const [newExPath, setNewExPath] = useState("");
  const [newExNotes, setNewExNotes] = useState("");

  const [filter, setFilter] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [busyId, setBusyId] = useState(null);
  const fileInputRef = useRef(null);

  // Language Normalizer state
  const [normalizerInput, setNormalizerInput] = useState("");
  const [normalizerOutput, setNormalizerOutput] = useState("");
  const [normalizerDate, setNormalizerDate] = useState(formatDateInput(new Date()));
  const [normalizerTitle, setNormalizerTitle] = useState("");
  const [isNormalizing, setIsNormalizing] = useState(false);

  useEffect(() => {
    const saved = safeJsonParse(localStorage.getItem(LS_KEY), null);
    if (saved) {
      setCaseName(saved.caseName ?? "Firey v. Firey");
      setCourt(saved.court ?? "Montgomery County, Pennsylvania");
      setMatter(saved.matter ?? "Divorce & Custody");
      setEvents(Array.isArray(saved.events) ? saved.events : []);
      setExhibits(Array.isArray(saved.exhibits) ? saved.exhibits : []);
      setPrintPolicy(saved.printPolicy ?? "original");
    } else {
      setEvents([
        {
          id: uid("evt"),
          date: formatDateInput(new Date()),
          title: "Start here",
          description: "Add verified facts only. Keep interpretations separate.",
          description_neutral: "",
          exhibitRefs: "CL-001",
          source: "manual",
        },
      ]);
      setExhibits([
        {
          id: uid("ex"),
          code: "CL-001",
          title: "Example Exhibit",
          path: "/ProSe_FileOrganizer/DivorceFiles/Exhibits/CL-001.pdf",
          notes: "Replace with actual exhibit metadata.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    const payload = { caseName, court, matter, events, exhibits, printPolicy };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [caseName, court, matter, events, exhibits, printPolicy]);

  function toast(msg) {
    setStatusMsg(msg);
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => setStatusMsg(""), 2600);
  }

  function addEvent() {
    if (!newEventDate || !newEventTitle.trim()) {
      toast("Event needs a date and title.");
      return;
    }
    const evt = {
      id: uid("evt"),
      date: newEventDate,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      description_neutral: "",
      exhibitRefs: newEventExhibits.trim(),
      source: "manual",
    };
    setEvents((prev) => [...prev, evt]);
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventExhibits("");
    toast("Event added.");
  }

  function deleteEvent(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast("Event removed.");
  }

  function updateEvent(id, patch) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function addExhibit() {
    if (!newExCode.trim() || !newExTitle.trim()) {
      toast("Exhibit needs a code and title.");
      return;
    }
    const ex = {
      id: uid("ex"),
      code: newExCode.trim(),
      title: newExTitle.trim(),
      path: newExPath.trim(),
      notes: newExNotes.trim(),
    };
    setExhibits((prev) => [...prev, ex]);
    setNewExCode("");
    setNewExTitle("");
    setNewExPath("");
    setNewExNotes("");
    toast("Exhibit added.");
  }

  function deleteExhibit(id) {
    setExhibits((prev) => prev.filter((x) => x.id !== id));
    toast("Exhibit removed.");
  }

  const exhibitCodes = useMemo(() => {
    return [...exhibits]
      .map((x) => (x.code || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [exhibits]);

  const filteredEvents = useMemo(() => {
    const q = (filter ?? "").trim().toLowerCase();
    const list = [...events].sort(sortByDateAsc);
    if (!q) return list;
    return list.filter((e) => {
      const hay = `${e.date} ${e.title} ${e.description} ${e.description_neutral} ${e.exhibitRefs} ${e.source}`.toLowerCase();
      return hay.includes(q);
    });
  }, [events, filter]);

  const filteredExhibits = useMemo(() => {
    const q = (filter ?? "").trim().toLowerCase();
    const list = [...exhibits].sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    if (!q) return list;
    return list.filter((x) => `${x.code} ${x.title} ${x.path} ${x.notes}`.toLowerCase().includes(q));
  }, [exhibits, filter]);

  const audit = useMemo(() => {
    const exhibitSet = new Set(exhibitCodes.map((c) => c.toUpperCase()));
    const referenced = new Set();
    const missingExhibitRefs = [];
    for (const e of events) {
      const codes = normalizeCodes(e.exhibitRefs);
      if (!codes.length && e.source !== "ai") {
        missingExhibitRefs.push(e);
      }
      for (const c of codes) referenced.add(c.toUpperCase());
    }
    const unreferencedExhibits = exhibits.filter((x) => {
      const code = (x.code || "").toUpperCase();
      return code && exhibitSet.has(code) && !referenced.has(code);
    });
    return { missingExhibitRefs, unreferencedExhibits };
  }, [events, exhibits, exhibitCodes]);

  /* ----------------------------- Agent Persona Context ---------------------------- */

  const AGENT_SYSTEM_CONTEXT = `You are "Pro Se Case Manager (Truth Repo Edition)" — a legal project assistant for a self-represented litigant in Montgomery County, Pennsylvania.

CASE CONTEXT:
- Case: ${caseName}
- Court: ${court}
- Matter: ${matter}
- Core Legal Theory: This case centers on a "manufactured imbalance" — a pattern of removal, denial of tools, delay, and status quo hardening. Relief sought is CORRECTIVE, not PUNITIVE.

YOUR PRIME DIRECTIVES:
1. NEUTRALIZE emotional input — remove accusations, harsh words, emotional language
2. OUTPUT court-ready language — professional, factual, suitable for judicial review
3. PRESERVE facts — do not add, infer, or speculate; keep dates/names/exhibits unchanged
4. FOCUS on "what happened" not "who is bad"
5. Frame events as observations, not judgments

WHAT WINNING LOOKS LIKE (for context):
- Winning is correction and trajectory, not domination
- Goal: Judge understands case in <10 minutes
- Winning is NOT: public scolding, moral vindication, or instant 50/50

LANGUAGE TRANSFORMATION RULES:
- "She refused" → "The request was declined"
- "He was denied" → "Access was not provided"
- "She blocked" → "Communication was unavailable"
- "Deliberately withheld" → "Was not made available"
- "Cruel" / "vindictive" / "manipulative" → REMOVE entirely, state facts only
- Keep the SUBSTANCE, remove the STING
- Output should read like a court filing, not a diary entry`;

  /* ----------------------------- Language Normalizer ---------------------------- */

  async function runNormalizer() {
    if (!normalizerInput.trim()) {
      toast("Enter your raw experience first.");
      return;
    }
    setIsNormalizing(true);
    setNormalizerOutput("");
    try {
      const system = AGENT_SYSTEM_CONTEXT + `

SPECIFIC TASK: Language Normalizer
You are transforming the user's emotional, raw description of an event into neutral, court-appropriate language.

TRANSFORMATION RULES:
- Remove ALL accusations, blame, harsh words, and emotional characterizations
- Convert active blame ("she did X to hurt me") → passive observation ("X occurred")
- "She refused" → "The request was declined"
- "He was denied" → "Access was not provided"  
- "She blocked" → "Communication was unavailable"
- "Deliberately withheld" → "Was not made available"
- Remove: "Cruel" / "vindictive" / "manipulative" / "heartbreaking" / "snatched"
- Preserve dates, times, durations, names, and factual details EXACTLY
- Output ONLY the rewritten text — no explanations, no headings
- The result should be suitable for inclusion in a court motion or affidavit
- Keep the SUBSTANCE, remove the STING`;

      const prompt = `RAW INPUT FROM USER:\n${normalizerInput}\n\nTransform this into neutral, court-ready language. Remove all emotional content while preserving the facts.`;
      const out = await geminiGenerateText({ prompt, system, temperature: 0.15 });
      setNormalizerOutput(out);
      toast("✓ Language normalized successfully.");
    } catch (err) {
      toast(err?.message || "Normalization failed.");
    } finally {
      setIsNormalizing(false);
    }
  }

  function addNormalizedToTimeline() {
    if (!normalizerOutput.trim()) {
      toast("Nothing to add. Run the normalizer first.");
      return;
    }
    const evt = {
      id: uid("evt"),
      date: normalizerDate || formatDateInput(new Date()),
      title: normalizerTitle.trim() || "Event (from Normalizer)",
      description: normalizerInput.trim(),
      description_neutral: normalizerOutput.trim(),
      exhibitRefs: "",
      source: "normalizer",
    };
    setEvents((prev) => [...prev, evt]);
    setNormalizerInput("");
    setNormalizerOutput("");
    setNormalizerTitle("");
    toast("✓ Added to timeline with both original and normalized versions.");
  }

  /* ----------------------------- Gemini actions ---------------------------- */

  async function neutralizeEvent(id) {
    const evt = events.find((e) => e.id === id);
    if (!evt) return;

    setBusyId(id);
    try {
      const system = AGENT_SYSTEM_CONTEXT + `

SPECIFIC TASK: Language Normalizer
Transform the user's emotional description into neutral, court-appropriate language.
- Remove ALL accusations, blame, harsh words, and emotional characterizations
- Convert active blame ("she did X to hurt me") to passive observation ("X occurred")
- Preserve dates, times, durations, and factual details exactly
- Output ONLY the rewritten paragraph — no headings, no explanations
- The result should be suitable for inclusion in a court motion or affidavit`;

      const prompt =
        `Original event title: ${evt.title}\n` +
        `Original description:\n${evt.description || "(none)"}\n\n` +
        `Exhibit refs: ${evt.exhibitRefs || "(none)"}\n\n` +
        `Transform this into neutral, court-ready language. Remove all emotional content while preserving the facts.`;
      const out = await geminiGenerateText({ prompt, system, temperature: 0.15 });
      updateEvent(id, { description_neutral: out });
      toast("✓ Language normalized (original preserved).");
    } catch (err) {
      toast(err?.message || "Language normalization failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function strategicAnalysis() {
    setBusyId("analysis");
    try {
      const system = AGENT_SYSTEM_CONTEXT + `

SPECIFIC TASK: Strategic Case Analysis
Analyze the timeline and provide tactical guidance.
- Identify defensible themes based ONLY on documented facts
- Identify evidence gaps (what would a judge want to see?)
- Suggest next actions for organizing exhibits and filings
- Provide devil's-advocate counterpoints (what opposing counsel might argue)
- DO NOT invent facts or speculate
- Frame everything in terms of "manufactured imbalance" theory where applicable`;

      const timeline = [...events].sort(sortByDateAsc).map((e) => {
        const neutralTag = e.description_neutral ? " (has neutral draft)" : "";
        return `- ${e.date || ""}: ${e.title}${neutralTag}\n  Original: ${e.description || ""}\n  Exhibits: ${e.exhibitRefs || ""}`;
      });
      const prompt =
        `TIMELINE:\n${timeline.join("\n")}\n\n` +
        `ANALYSIS REQUESTED:\n` +
        `1) Identify 3–6 defensible themes based on documented facts\n` +
        `2) List evidence gaps — what would a judge want to see?\n` +
        `3) Recommend next 5 actions for exhibits and filings\n` +
        `4) Devil's advocate: what might opposing counsel argue?\n` +
        `5) How does this timeline support or challenge the "manufactured imbalance" theory?`;
      const out = await geminiGenerateText({ prompt, system, temperature: 0.25 });

      const analysisEvt = {
        id: uid("evt"),
        date: formatDateInput(new Date()),
        title: "ANALYSIS (AI draft, non-factual)",
        description: out,
        description_neutral: "",
        exhibitRefs: "",
        source: "ai",
      };
      setEvents((prev) => [...prev, analysisEvt]);
      toast("Analysis added as a separate AI draft entry.");
    } catch (err) {
      toast(err?.message || "Analysis failed.");
    } finally {
      setBusyId(null);
    }
  }

  /* ---------------------------- Export/Import ---------------------------- */

  function clearAll() {
    if (!confirm("Clear all events and exhibits? This cannot be undone.")) return;
    setEvents([]);
    setExhibits([]);
    toast("Cleared.");
  }

  function exportJSON() {
    const payload = { caseName, court, matter, events, exhibits, printPolicy, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ProSeLegalDB_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const headers = ["date", "title", "description", "description_neutral", "exhibitRefs", "source"];
    const escape = (v) => {
      const s = (v ?? "").toString();
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(",")].concat(
      [...events].sort(sortByDateAsc).map((e) => headers.map((h) => escape(e[h] ?? "")).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Timeline_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCourtPacketTXT() {
    const now = new Date();
    const stamp = now.toLocaleString();
    const policyLabel =
      printPolicy === "original" ? "Original Only" : printPolicy === "neutral" ? "Neutral Drafts Only" : "Original + Neutral";

    const lines = [];
    lines.push(`${caseName}`);
    lines.push(`${court}`);
    lines.push(`${matter}`);
    lines.push(`Generated: ${stamp}`);
    lines.push(`Print Policy: ${policyLabel}`);
    lines.push("");
    lines.push("DISCLAIMER:");
    lines.push("- Original entries are user-recorded factual notes.");
    lines.push("- AI-generated drafts are clearly labeled and must be verified before any filing.");
    lines.push("");

    lines.push("TIMELINE:");
    const sorted = [...events].sort(sortByDateAsc);
    for (const e of sorted) {
      const isAI = e.source === "ai";
      lines.push(`- ${e.date || "(no date)"} | ${e.title}${isAI ? " [AI DRAFT]" : ""}`);
      if (printPolicy === "original" || printPolicy === "both") {
        if (e.description?.trim()) lines.push(`  Original: ${e.description.trim()}`);
      }
      if (printPolicy === "neutral" || printPolicy === "both") {
        if (e.description_neutral?.trim()) lines.push(`  Neutral (AI-assisted): ${e.description_neutral.trim()}`);
      }
      if ((e.exhibitRefs ?? "").trim()) lines.push(`  Exhibits: ${e.exhibitRefs.trim()}`);
      lines.push("");
    }

    lines.push("EXHIBIT INDEX:");
    const exSorted = [...exhibits].sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    for (const x of exSorted) {
      lines.push(`- ${x.code} | ${x.title}`);
      if (x.path?.trim()) lines.push(`  Path: ${x.path.trim()}`);
      if (x.notes?.trim()) lines.push(`  Notes: ${x.notes.trim()}`);
    }

    downloadText(`CourtPacket_${now.toISOString().slice(0, 10)}.txt`, lines.join("\n"));
  }

  async function handleCSVImport(file) {
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) {
        toast("CSV appears empty.");
        return;
      }
      const headerMap = toHeaderMap(rows[0]);
      const dataRows = rows.slice(1);

      const imported = [];
      for (const r of dataRows) {
        const date = getCell(r, headerMap, "date", "").trim();
        const title = getCell(r, headerMap, "title", "").trim();
        const description = getCell(r, headerMap, "description", "").trim();
        const description_neutral = getCell(r, headerMap, "description_neutral", "").trim();
        const exhibitRefs =
          getCell(r, headerMap, "exhibitreffs", getCell(r, headerMap, "exhibitrefs", "")).trim();
        const source = getCell(r, headerMap, "source", "import").trim() || "import";

        if (!date && !title && !description && !exhibitRefs && !description_neutral) continue;

        imported.push({
          id: uid("evt"),
          date: date || "",
          title: title || "(untitled)",
          description,
          description_neutral,
          exhibitRefs,
          source,
        });
      }

      if (!imported.length) {
        toast("No importable rows found.");
        return;
      }

      setEvents((prev) => [...prev, ...imported]);
      toast(`Imported ${imported.length} event(s).`);
    } catch (err) {
      toast(err?.message || "CSV import failed.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* ------------------------------ Print view ------------------------------ */

  function printPage() {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 50);
  }

  const header = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Button onClick={printPage} title="Print a clean view">
          Print
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Print policy:</span>
          <Select
            value={printPolicy}
            onChange={setPrintPolicy}
            options={[
              { value: "original", label: "Original only" },
              { value: "neutral", label: "Neutral drafts only" },
              { value: "both", label: "Original + Neutral" },
            ]}
          />
        </div>

        <Button onClick={exportCourtPacketTXT} variant="ghost" title="Export a court packet text file">
          Export Court Packet (TXT)
        </Button>

        <Button onClick={exportJSON} variant="ghost" title="Export your full database as JSON">
          Export JSON
        </Button>
        <Button onClick={exportCSV} variant="ghost" title="Export timeline as CSV">
          Export CSV
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          title="Import timeline CSV (quote-aware)"
        >
          Import CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCSVImport(f);
          }}
        />
        <Button onClick={strategicAnalysis} disabled={busyId === "analysis"} title="Add AI draft analysis as separate entry">
          {busyId === "analysis" ? "Analyzing..." : "Strategic analysis"}
        </Button>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Input value={filter} onChange={setFilter} placeholder="Search (date/title/text/exhibit)" />
        <Button onClick={clearAll} variant="danger" title="Clear all data (local only)">
          Clear
        </Button>
      </div>
    </div>
  );

  const printableHeader = (
    <div>
      <h1 style={{ margin: "0 0 6px 0" }}>{caseName}</h1>
      <div style={{ opacity: 0.85 }}>{court}</div>
      <div style={{ opacity: 0.85 }}>{matter}</div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        Generated: {new Date().toLocaleString()} | Print policy:{" "}
        {printPolicy === "original" ? "Original only" : printPolicy === "neutral" ? "Neutral drafts only" : "Original + Neutral"}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
        AI drafts are labeled and must be verified before any filing.
      </div>
      <Hr />
    </div>
  );

  /* ------------------------------ render rows ----------------------------- */

  function renderEventText(e) {
    const parts = [];
    const isAI = e.source === "ai";
    const title = `${e.date || "(no date)"}: ${e.title}${isAI ? " [AI DRAFT]" : ""}`;
    parts.push(<div key="t" style={{ fontWeight: 600 }}>{title}</div>);

    if (printPolicy === "original" || printPolicy === "both") {
      if (e.description?.trim()) parts.push(<div key="o" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{e.description.trim()}</div>);
    }
    if (printPolicy === "neutral" || printPolicy === "both") {
      if (e.description_neutral?.trim())
        parts.push(
          <div key="n" style={{ marginTop: 6, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
            Neutral (AI-assisted): {e.description_neutral.trim()}
          </div>
        );
    }
    if ((e.exhibitRefs ?? "").trim()) {
      parts.push(<div key="x" style={{ marginTop: 6, opacity: 0.85 }}>Exhibits: {e.exhibitRefs.trim()}</div>);
    }
    return parts;
  }

  return (
    <div style={{ padding: 18, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <div className="no-print">
        <h1 style={{ margin: "0 0 10px 0" }}>ProSe Legal DB</h1>
        {header}
        {statusMsg ? (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.05)" }}>
            {statusMsg}
          </div>
        ) : null}
        <Hr />
      </div>

      {printMode ? printableHeader : null}

      <Section
        title="Case Details"
        right={
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Storage: local only (localStorage)
          </div>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Case name</div>
            <Input value={caseName} onChange={setCaseName} placeholder="Case name" />
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Court</div>
            <Input value={court} onChange={setCourt} placeholder="Court" />
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Matter</div>
            <Input value={matter} onChange={setMatter} placeholder="Matter" />
          </div>
        </div>

        {!GEMINI_KEY ? (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 12, border: "1px solid rgba(255,0,0,0.25)", background: "rgba(255,0,0,0.05)" }}>
            <b>Gemini not configured.</b> Copy <code>.env.example</code> to <code>.env</code>, add <code>VITE_GEMINI_API_KEY</code>, then restart <code>npm run dev</code>.
          </div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            ✓ AI Features Enabled — Model: <code>{GEMINI_MODEL || DEFAULT_MODEL}</code>
          </div>
        )}
      </Section>

      {/* ===== LANGUAGE NORMALIZER - The star feature! ===== */}
      <Section
        title="⚖️ Language Normalizer"
        right={
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Transform emotional → court-ready
          </div>
        }
      >
        <div style={{ 
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: 12, 
          padding: 16,
          marginBottom: 12
        }}>
          <div style={{ fontSize: 13, marginBottom: 12, opacity: 0.85 }}>
            <b>How it works:</b> Enter your raw experience below — emotional language, frustrations, accusations — 
            and the AI will transform it into neutral, court-appropriate language while preserving all facts.
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* LEFT: Raw Input */}
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6, fontWeight: 600 }}>
                📝 Your Raw Experience
              </div>
              <TextArea
                value={normalizerInput}
                onChange={setNormalizerInput}
                placeholder="Enter your raw experience here (or click 🎤 to speak)... 

Example: 'My parents drove 4 hours from Virginia. She only allowed me 18 minutes with my boys. It was cruel and heartbreaking. She deliberately ruined Christmas to hurt me and my family.'"
                rows={8}
                showMic={true}
              />
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>Date (optional)</div>
                  <Input value={normalizerDate} onChange={setNormalizerDate} type="date" />
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>Event Title (optional)</div>
                  <Input value={normalizerTitle} onChange={setNormalizerTitle} placeholder="e.g., Christmas parenting time" />
                </div>
              </div>
            </div>

            {/* RIGHT: Normalized Output */}
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6, fontWeight: 600 }}>
                ⚖️ Court-Ready Output
              </div>
              <TextArea
                value={normalizerOutput}
                onChange={setNormalizerOutput}
                placeholder="Normalized text will appear here after you click 'Normalize'..."
                rows={8}
              />
              <div style={{ marginTop: 10, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button
                  onClick={addNormalizedToTimeline}
                  disabled={!normalizerOutput.trim()}
                  variant="ghost"
                  title="Add both original and normalized versions to the timeline"
                >
                  Add to Timeline →
                </Button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <Button
              onClick={runNormalizer}
              disabled={isNormalizing || !normalizerInput.trim()}
              title="Transform to court-ready language"
            >
              {isNormalizing ? "✨ Normalizing..." : "⚖️ Normalize Language"}
            </Button>
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7, fontStyle: "italic" }}>
          <b>Transformation examples:</b> "She refused" → "The request was declined" • 
          "He was denied" → "Access was not provided" • 
          "cruel and heartbreaking" → (removed, facts preserved)
        </div>
      </Section>

      <Section
        title="Audit"
        right={<div style={{ fontSize: 12, opacity: 0.75 }}>Fast sanity checks</div>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>
              Events missing exhibits <Badge>{audit.missingExhibitRefs.length}</Badge>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              {audit.missingExhibitRefs.length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {audit.missingExhibitRefs.slice(0, 8).map((e) => (
                    <li key={e.id}>
                      {e.date || "(no date)"}: {e.title}
                    </li>
                  ))}
                </ul>
              ) : (
                "None detected (excluding AI draft entries)."
              )}
              {audit.missingExhibitRefs.length > 8 ? <div style={{ marginTop: 8 }}>…more not shown</div> : null}
            </div>
          </div>

          <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>
              Exhibits unreferenced <Badge>{audit.unreferencedExhibits.length}</Badge>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              {audit.unreferencedExhibits.length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {audit.unreferencedExhibits.slice(0, 8).map((x) => (
                    <li key={x.id}>
                      {x.code}: {x.title}
                    </li>
                  ))}
                </ul>
              ) : (
                "None detected."
              )}
              {audit.unreferencedExhibits.length > 8 ? <div style={{ marginTop: 8 }}>…more not shown</div> : null}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          Devil's advocate note: missing exhibits and "floating" exhibits are exactly where credibility arguments get traction.
        </div>
      </Section>

      <Section title="Timeline Events">
        <div className="no-print" style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Date</div>
              <Input value={newEventDate} onChange={setNewEventDate} type="date" />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Title</div>
              <Input value={newEventTitle} onChange={setNewEventTitle} placeholder="Short factual label" />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Exhibit refs</div>
              <Input
                value={newEventExhibits}
                onChange={setNewEventExhibits}
                placeholder="CL-###, FIN-###, PKT-###"
                list="exhibitCodes"
              />
              <datalist id="exhibitCodes">
                {exhibitCodes.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Description (original)</div>
            <TextArea value={newEventDesc} onChange={setNewEventDesc} placeholder="Verified facts only. Avoid conclusions." rows={4} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <Button onClick={addEvent}>Add event</Button>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {filteredEvents.length ? (
            filteredEvents.map((e) => (
              <div key={e.id} style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <b>{e.date || "(no date)"}</b>
                    <span style={{ fontSize: 16 }}>{e.title}</span>
                    {e.source === "ai" ? <Badge>AI Draft</Badge> : null}
                    {e.description_neutral ? <Badge>Neutral Draft Saved</Badge> : null}
                  </div>
                  <div className="no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      onClick={() => neutralizeEvent(e.id)}
                      disabled={busyId === e.id}
                      title="Transform to court-ready language (removes emotional content, preserves facts)"
                    >
                      {busyId === e.id ? "Normalizing..." : "Normalize Language"}
                    </Button>
                    <Button onClick={() => deleteEvent(e.id)} variant="danger" title="Delete event">
                      Delete
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Original description</div>
                    <TextArea
                      value={e.description || ""}
                      onChange={(v) => updateEvent(e.id, { description: v })}
                      rows={3}
                      placeholder="Original factual statement"
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Neutral draft (AI-assisted, labeled)</div>
                    <TextArea
                      value={e.description_neutral || ""}
                      onChange={(v) => updateEvent(e.id, { description_neutral: v })}
                      rows={3}
                      placeholder="If generated, appears here. You can edit."
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Exhibit refs</div>
                    <Input
                      value={e.exhibitRefs || ""}
                      onChange={(v) => updateEvent(e.id, { exhibitRefs: v })}
                      placeholder="CL-###, FIN-###, PKT-###"
                      list="exhibitCodes"
                    />
                  </div>
                </div>

                {printMode ? (
                  <div style={{ marginTop: 12 }}>
                    <Hr />
                    <div style={{ fontSize: 14 }}>{renderEventText(e)}</div>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.7 }}>No events yet.</div>
          )}
        </div>
      </Section>

      <Section title="Exhibits Index">
        <div className="no-print" style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Code</div>
              <Input value={newExCode} onChange={setNewExCode} placeholder="CL-###" />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Title</div>
              <Input value={newExTitle} onChange={setNewExTitle} placeholder="Exhibit title" />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Path</div>
              <Input value={newExPath} onChange={setNewExPath} placeholder="/ProSe_FileOrganizer/..." />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Notes</div>
            <TextArea value={newExNotes} onChange={setNewExNotes} placeholder="Short notes (authorship, relevance, etc.)" rows={3} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <Button onClick={addExhibit}>Add exhibit</Button>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {filteredExhibits.length ? (
            filteredExhibits.map((x) => (
              <div key={x.id} style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b>{x.code}</b>
                    <span>{x.title}</span>
                  </div>
                  <div className="no-print" style={{ display: "flex", gap: 8 }}>
                    <Button onClick={() => deleteExhibit(x.id)} variant="danger" title="Delete exhibit">
                      Delete
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Path</div>
                    <Input
                      value={x.path || ""}
                      onChange={(v) => setExhibits((prev) => prev.map((p) => (p.id === x.id ? { ...p, path: v } : p)))}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Notes</div>
                    <Input
                      value={x.notes || ""}
                      onChange={(v) => setExhibits((prev) => prev.map((p) => (p.id === x.id ? { ...p, notes: v } : p)))}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.7 }}>No exhibits yet.</div>
          )}
        </div>
      </Section>

      <Section title="Print Guidance">
        <div style={{ lineHeight: 1.45, opacity: 0.9 }}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              Originals stay intact. AI output is stored separately as a <b>neutral draft</b>.
            </li>
            <li>
              Use <b>Print policy</b> to control what appears in print and court packet exports.
            </li>
            <li>
              Devil's advocate: if anything looks "rewritten," you want the chain to be obvious: original → draft → verified filing.
            </li>
          </ul>
        </div>
      </Section>

      <div style={{ fontSize: 12, opacity: 0.65, textAlign: "center", padding: "16px 0" }}>
        Local-only storage. Export JSON for backups.
      </div>
    </div>
  );
}
