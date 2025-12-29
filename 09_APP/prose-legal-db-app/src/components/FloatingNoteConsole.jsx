import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { Mic, X, Link as LinkIcon } from "lucide-react";

const FloatingNoteConsole = ({ events = [], onNewNote }) => {
  const [text, setText] = useState("");
  const [attachedEvent, setAttachedEvent] = useState(null);
  const [pos, setPos] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const boxRef = useRef(null);
  const recognitionRef = useRef(null);

  // Listen for event attachment events
  useEffect(() => {
    const handleAttach = (e) => {
      setAttachedEvent(e.detail);
      // Focus the textarea
      setTimeout(() => {
        const textarea = boxRef.current?.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 100);
    };

    window.addEventListener("attachEventToNoteConsole", handleAttach);
    return () => window.removeEventListener("attachEventToNoteConsole", handleAttach);
  }, []);

  // --- mic input ---
  const startMic = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = (e) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setText((prev) => prev + finalTranscript);
    };

    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
    }
  };

  // --- drag behaviour ---
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging) return;
      setPos((p) => ({
        x: Math.max(0, Math.min(window.innerWidth - 320, p.x + e.movementX)),
        y: Math.max(0, Math.min(window.innerHeight - 200, p.y + e.movementY)),
      }));
    };
    const stop = () => setDragging(false);
    
    if (dragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", stop);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [dragging]);

  // --- handle save ---
  const handleSave = () => {
    if (!text.trim()) return;

    const noteEntry = {
      Date: new Date().toISOString().split("T")[0],
      Time: new Date().toLocaleTimeString(),
      Filename: "(manual note)",
      Categories: attachedEvent ? "Note+Linked" : "Note",
      Flags: attachedEvent ? `linked_to:${attachedEvent.Filename || attachedEvent.filename || 'event'}` : "",
      Note: text,
      Destination: "/09_APP/Database/",
      SourcePath: attachedEvent ? (attachedEvent.SourcePath || attachedEvent.sourcePath || "(none)") : "(none)",
    };

    // Export CSV
    const csvOut = Papa.unparse([noteEntry], { header: true });
    const blob = new Blob([csvOut], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "NewNote.csv";
    link.click();

    // Trigger watcher
    const signal = {
      type: "new_note",
      timestamp: new Date().toISOString(),
      linked: noteEntry.Flags || "",
      eventId: attachedEvent?.id || null,
    };
    const jsonBlob = new Blob([JSON.stringify(signal)], { type: "application/json" });
    const sigFile = new File([jsonBlob], "case_updates.json");
    const sigLink = document.createElement("a");
    sigLink.href = URL.createObjectURL(sigFile);
    sigLink.download = "case_updates.json";
    sigLink.click();

    // Callback
    if (onNewNote) onNewNote(noteEntry);

    // Reset
    setText("");
    setAttachedEvent(null);
  };

  return (
    <div
      ref={boxRef}
      className="fixed bg-gray-800 text-white rounded-xl shadow-2xl p-3 w-80 z-50 border border-gray-700"
      style={{ top: pos.y, left: pos.x }}
    >
      {/* Header - draggable */}
      <div
        className="flex justify-between items-center mb-2 cursor-move select-none"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      >
        <span className="font-bold text-sm flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Quick Note
        </span>
        <div className="flex items-center gap-1">
          {isRecording && (
            <span className="text-xs text-red-400 animate-pulse">● Recording</span>
          )}
          <button
            onClick={isRecording ? stopMic : startMic}
            title={isRecording ? "Stop recording" : "Start voice input"}
            className={`text-lg p-1 rounded transition ${
              isRecording ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attached event indicator */}
      {attachedEvent && (
        <div className="text-xs text-blue-300 mb-2 p-2 bg-blue-900/30 rounded flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">
              Linked: {attachedEvent.Filename || attachedEvent.filename || attachedEvent.Title || 'Event'}
            </div>
            <div className="text-[10px] text-blue-200 truncate">
              {attachedEvent.Date || attachedEvent.date || 'No date'}
            </div>
          </div>
          <button
            className="ml-2 text-gray-400 hover:text-white shrink-0"
            onClick={() => setAttachedEvent(null)}
            title="Unlink event"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!attachedEvent && (
        <div className="text-xs text-gray-400 mb-2 italic">
          (Click an event on the timeline to attach)
        </div>
      )}

      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isRecording ? "Listening... speak now" : "Type or dictate a note..."}
        className="w-full bg-gray-700 rounded p-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isRecording}
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!text.trim() || isRecording}
        className="mt-2 w-full bg-blue-600 py-2 rounded text-sm font-semibold hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
      >
        Add to Timeline
      </button>

      {/* Character count */}
      <div className="text-xs text-gray-400 mt-1 text-right">
        {text.length} chars
      </div>
    </div>
  );
};

export default FloatingNoteConsole;

