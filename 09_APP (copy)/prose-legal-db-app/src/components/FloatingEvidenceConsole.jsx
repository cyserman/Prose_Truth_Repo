import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import Papa from "papaparse";
import { Mic, FileText, X, Sparkles } from "lucide-react";

const FloatingEvidenceConsole = ({ onSubmit }) => {
  const [activeTab, setActiveTab] = useState("note"); // note | mic
  const [note, setNote] = useState("");
  const [aiOutput, setAiOutput] = useState(null);
  const [files, setFiles] = useState([]);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const fileInputRef = useRef(null);

  // --- mic recording ---
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert("Microphone not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setMediaRecorder(rec);
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // --- AI normalizer stub ---
  const runAiNormalizer = async (file) => {
    setIsNormalizing(true);
    try {
      // Placeholder for your local AI normalizer endpoint
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://localhost:5001/normalize", { 
        method: "POST", 
        body: form 
      });
      
      if (!res.ok) {
        throw new Error(`AI normalizer returned ${res.status}`);
      }
      
      const data = await res.json();
      return data.summary || "AI summary pending...";
    } catch (error) {
      console.error("AI normalization error:", error);
      // Fallback: return a basic summary
      return `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB) - Ready for review`;
    } finally {
      setIsNormalizing(false);
    }
  };

  // --- drop zone handler ---
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = [...e.dataTransfer.files];
    if (!dropped.length) return;
    
    setFiles(dropped);
    const summary = await runAiNormalizer(dropped[0]);
    setAiOutput(summary);
    triggerWatcher("file_drop", dropped.map(f => f.name).join(", "));
  };

  const handleFileSelect = async (e) => {
    const selected = [...e.target.files];
    if (!selected.length) return;
    
    setFiles(selected);
    const summary = await runAiNormalizer(selected[0]);
    setAiOutput(summary);
    triggerWatcher("file_select", selected.map(f => f.name).join(", "));
  };

  // --- watcher trigger ---
  const triggerWatcher = (type, detail) => {
    const update = { 
      type, 
      detail, 
      timestamp: new Date().toISOString() 
    };
    const blob = new Blob([JSON.stringify(update)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "case_updates.json";
    link.click();
  };

  const handleAddToTimeline = () => {
    const entry = {
      Date: new Date().toISOString().split("T")[0],
      Time: new Date().toLocaleTimeString(),
      Filename: files[0]?.name || "(manual note)",
      Categories: files.length > 0 ? "Evidence" : "Note",
      Flags: "",
      Note: note || (files.length > 0 ? `File: ${files[0].name}` : ""),
      Destination: "/09_APP/Database/",
      SourcePath: files[0]?.name || "(none)",
    };
    
    const csvOut = Papa.unparse([entry], { header: true });
    const blob = new Blob([csvOut], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "NewNote.csv";
    link.click();
    
    triggerWatcher("new_note", files[0]?.name || "note_only");
    
    // Callback if provided
    if (onSubmit) {
      onSubmit(entry);
    }
    
    // Reset
    setNote("");
    setFiles([]);
    setAiOutput(null);
    setAudioUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Rnd
      default={{ x: 60, y: 60, width: 380, height: 400 }}
      dragHandleClassName="drag-handle"
      bounds="window"
      enableResizing={{ 
        bottom: true, 
        bottomRight: true, 
        right: true 
      }}
      minWidth={320}
      minHeight={300}
      className="fixed z-50 glass-dark text-white rounded-xl shadow-lg border border-white/10 overflow-hidden"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Header - draggable */}
      <div className="drag-handle cursor-move glass-warm px-4 py-2.5 flex justify-between items-center border-b border-white/10">
        <span className="font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Quick Note / Evidence Entry
        </span>
        <button
          onClick={() => triggerWatcher("open_watcher", "manual")}
          className="bg-blue-600/50 hover:bg-blue-600 text-xs px-2.5 py-1 rounded transition flex items-center gap-1"
          title="Trigger watcher"
        >
          <Sparkles className="w-3 h-3" />
          Watcher
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("note")}
          className={`flex-1 py-2 text-sm font-medium transition ${
            activeTab === "note" 
              ? "bg-blue-600/30 text-white border-b-2 border-blue-400" 
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          📝 Note
        </button>
        <button
          onClick={() => setActiveTab("mic")}
          className={`flex-1 py-2 text-sm font-medium transition ${
            activeTab === "mic" 
              ? "bg-blue-600/30 text-white border-b-2 border-blue-400" 
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          🎙 Mic
        </button>
      </div>

      {/* Content */}
      <div className="p-4 text-sm space-y-3 h-[calc(100%-8rem)] overflow-y-auto scrollbar-hide">
        {activeTab === "note" && (
          <>
            {/* File drop zone */}
            <div
              className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-400/50 transition cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs text-slate-400">
                Drop files here or click to select
              </p>
            </div>

            {/* Selected files */}
            {files.length > 0 && (
              <div className="bg-slate-800/50 rounded p-2 space-y-1">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      onClick={() => {
                        setFiles(files.filter((_, i) => i !== idx));
                        if (files.length === 1) setAiOutput(null);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Text input */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type a note or drop a file here..."
              className="w-full h-28 p-3 bg-slate-800/50 rounded resize-none text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
            />

            {/* AI Normalizer output */}
            {aiOutput && (
              <div className="text-xs bg-blue-900/30 p-3 rounded border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <strong className="text-blue-300">AI Normalizer:</strong>
                </div>
                <div className="text-slate-300">{aiOutput}</div>
                {isNormalizing && (
                  <div className="text-xs text-blue-400 mt-2 animate-pulse">
                    Processing...
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "mic" && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                recording 
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                  : "btn-ember text-white"
              }`}
            >
              <Mic className="w-5 h-5" />
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
            
            {recording && (
              <div className="text-xs text-red-400 animate-pulse">
                ● Recording...
              </div>
            )}
            
            {audioUrl && (
              <div className="w-full mt-4">
                <audio controls src={audioUrl} className="w-full" />
                <button
                  onClick={() => {
                    setAudioUrl(null);
                    setFiles([]);
                  }}
                  className="mt-2 text-xs text-slate-400 hover:text-white"
                >
                  Clear recording
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add to Timeline button */}
        <button
          onClick={handleAddToTimeline}
          disabled={!note.trim() && files.length === 0 && !audioUrl}
          className="w-full btn-ember py-2.5 rounded-lg mt-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add to Timeline
        </button>
      </div>
    </Rnd>
  );
};

export default FloatingEvidenceConsole;

