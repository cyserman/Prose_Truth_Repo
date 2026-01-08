import React, { useState, useRef, useEffect } from 'react';
import { Mic, Terminal, Clipboard, Globe, AlertTriangle, Minimize2, FileText, Upload, X, Save, Download, Zap, Scale } from 'lucide-react';

interface FileUpload {
    name: string;
    size: number;
    file: File;
}

interface Conflict {
    type: string;
    description: string;
}

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

export const FloatingConsole: React.FC = () => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeTab, setActiveTab] = useState('notes');
    const [position, setPosition] = useState<Position>({ x: 100, y: 100 });
    const [size, setSize] = useState<Size>({ width: 320, height: 480 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [noteContent, setNoteContent] = useState('');
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [clipboardContent, setClipboardContent] = useState('');
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);

    const panelRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Gemini Configuration (Environment managed)
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
    const GEMINI_MODEL = 'gemini-2.0-flash-exp';

    // Dragging logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.tab-button') || (e.target as HTMLElement).closest('.control-btn')) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            } else if (isResizing) {
                setSize({
                    width: Math.max(300, e.clientX - position.x),
                    height: Math.max(200, e.clientY - position.y)
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragOffset]);

    // Auto-save to localStorage
    useEffect(() => {
        const saveInterval = setInterval(() => {
            if (noteContent) {
                localStorage.setItem('prosepower_notes', noteContent);
                localStorage.setItem('prosepower_files', JSON.stringify(uploadedFiles));
            }
        }, 5000);
        return () => clearInterval(saveInterval);
    }, [noteContent, uploadedFiles]);

    // Load saved data
    useEffect(() => {
        const savedNotes = localStorage.getItem('prosepower_notes'); // No type argument needed
        const savedFiles = localStorage.getItem('prosepower_files');
        if (savedNotes) setNoteContent(savedNotes);
        if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));
    }, []);

    // File upload handling
    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, file: f }))]);
        setTerminalHistory(prev => [...prev, `✓ Uploaded: ${files.map(f => f.name).join(', ')}`]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, file: f }))]);
        }
    };

    // Audio recording
    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                const chunks: Blob[] = [];

                mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorderRef.current.onstop = () => {
                    // const blob = new Blob(chunks, { type: 'audio/webm' }); // Blob created but currently unused
                    const timestamp = new Date().toLocaleTimeString();
                    setNoteContent(prev => prev + `\n[Audio Recording: ${timestamp}]`);
                    setTerminalHistory(prev => [...prev, `✓ Voice note recorded at ${timestamp}`]);
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                setTerminalHistory(prev => [...prev, `✗ Microphone access denied`]);
            }
        } else {
            mediaRecorderRef.current?.stop();
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // Terminal command execution
    const executeCommand = async (cmd: string) => {
        setTerminalHistory(prev => [...prev, `$ ${cmd}`]);

        if (cmd.startsWith('analyze')) {
            setTerminalHistory(prev => [...prev, '→ Analyzing case documents...']);
            await analyzeWithGemini(noteContent);
        } else if (cmd.startsWith('conflict')) {
            setTerminalHistory(prev => [...prev, '→ Scanning for conflicts...']);
            await detectConflicts();
        } else if (cmd.startsWith('neutralize')) {
            setTerminalHistory(prev => [...prev, '→ Neutralizing emotional language...']);
            await neutralizeText();
        } else if (cmd.startsWith('export')) {
            exportToCSV();
        } else if (cmd.startsWith('save')) {
            saveToTruthRepo();
        } else if (cmd === 'clear') {
            setTerminalHistory([]);
        } else if (cmd === 'help') {
            setTerminalHistory(prev => [...prev,
                'Commands:',
                '  analyze     - AI case analysis',
                '  conflict    - Detect contradictions',
                '  neutralize  - Convert emotional → objective',
                '  export      - Export to CSV',
                '  save        - Save to Truth Repo',
                '  clear       - Clear terminal'
            ]);
        } else {
            setTerminalHistory(prev => [...prev, `✓ ${cmd}`]);
        }
        setTerminalInput('');
    };

    // Gemini API Integration
    const analyzeWithGemini = async (content: string) => {
        if (!GEMINI_API_KEY) {
            setTerminalHistory(prev => [...prev, '✗ API Key not configured. Check .env']);
            return;
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `As a legal analyst, analyze this case content for key facts, timeline events, and strategic issues:\n\n${content}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis returned';
            setTerminalHistory(prev => [...prev, `✓ Analysis complete`, analysis]);
        } catch (err: any) {
            setTerminalHistory(prev => [...prev, `✗ ${err.message}`]);
        }
    };

    // Conflict detection
    const detectConflicts = async () => {
        if (!GEMINI_API_KEY) {
            setTerminalHistory(prev => [...prev, '✗ API Key not configured']);
            return;
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Identify logical contradictions, inconsistent statements, and areas requiring opposing counsel perspective in:\n\n${noteContent}\n\nReturn as JSON: [{"type": "...", "description": "..."}]`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const conflictText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
            const cleanJson = conflictText.replace(/```json|```/g, '').trim();
            const detected = JSON.parse(cleanJson);
            setConflicts(detected);
            setActiveTab('conflicts');
            setTerminalHistory(prev => [...prev, `✓ Found ${detected.length} conflicts`]);
        } catch (err: any) {
            setTerminalHistory(prev => [...prev, `✗ ${err.message}`]);
        }
    };

    // Neutralization
    const neutralizeText = async () => {
        if (!GEMINI_API_KEY) {
            setTerminalHistory(prev => [...prev, '✗ API Key not configured']);
            return;
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Convert this emotional text to objective, court-ready language:\n\n${noteContent}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const neutralized = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            setNoteContent(neutralized);
            setTerminalHistory(prev => [...prev, `✓ Text neutralized`]);
        } catch (err: any) {
            setTerminalHistory(prev => [...prev, `✗ ${err.message}`]);
        }
    };

    // Export to CSV
    const exportToCSV = () => {
        const csv = [
            ['event_id', 'date', 'type', 'description', 'source'],
            ...noteContent.split('\n').filter(line => line.trim()).map((line, i) => [
                `EVT-${String(i + 1).padStart(3, '0')}`,
                new Date().toISOString().split('T')[0],
                'note',
                `"${line.replace(/"/g, '""')}"`, // Basic CSV escaping
                'ProSePower Panel'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timeline_${Date.now()}.csv`;
        a.click();
        setTerminalHistory(prev => [...prev, `✓ Exported to CSV`]);
    };

    // Save to Truth Repo structure
    const saveToTruthRepo = () => {
        const data = {
            notes: noteContent,
            files: uploadedFiles.map(f => f.name),
            conflicts: conflicts,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('prosepower_truthrepo', JSON.stringify(data));
        setTerminalHistory(prev => [...prev, `✓ Saved to Truth Repo format`]);
    };

    // Clipboard functionality
    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setClipboardContent(text);
        } catch (err) {
            setTerminalHistory(prev => [...prev, `✗ Clipboard access denied`]);
        }
    };

    const tabs = [
        { id: 'notes', icon: FileText, label: 'Notes' },
        { id: 'terminal', icon: Terminal, label: 'Terminal' },
        { id: 'clipboard', icon: Clipboard, label: 'Clipboard' },
        { id: 'conflicts', icon: AlertTriangle, label: 'Conflicts' },
        { id: 'actions', icon: Zap, label: 'Actions' }
    ];

    if (isMinimized) {
        return (
            <div
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: 9999
                }}
                className="cursor-move"
                onMouseDown={handleMouseDown}
            >
                <div className="rounded-full p-2 shadow-2xl" style={{
                    background: '#374151',
                    border: '2px solid #4b5563'
                }}>
                    <button onClick={() => setIsMinimized(false)} className="text-gray-300">
                        <Scale size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={panelRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: 9999
            }}
            className="font-mono select-none"
        >
            <div className="h-full flex flex-col rounded-3xl shadow-2xl border-4 overflow-hidden" style={{
                background: 'linear-gradient(to bottom right, #374151, #1f2937)',
                borderColor: '#374151'
            }}>
                <div
                    className="p-2 cursor-move border-b flex justify-between items-center"
                    style={{
                        background: '#1f2937',
                        borderColor: '#4b5563'
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <div className="text-gray-300 font-bold text-xs tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
                        TRUTHDOCK
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => window.open('http://localhost:3000', '_blank')}
                            className="control-btn hover:bg-gray-600 p-1 rounded-full transition-colors"
                            style={{ backgroundColor: '#374151' }}
                            title="Open localhost"
                        >
                            <Globe size={11} className="text-gray-300" />
                        </button>
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="control-btn hover:bg-gray-600 p-1 rounded-full transition-colors"
                            style={{ backgroundColor: '#374151' }}
                            title="Minimize"
                        >
                            <Minimize2 size={11} className="text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="flex border-b p-0.5 gap-0.5 overflow-x-auto" style={{
                    backgroundColor: '#1f2937',
                    borderColor: '#4b5563'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button flex-1 flex flex-col items-center justify-center p-1.5 rounded-lg transition-all text-xs ${activeTab === tab.id ? '' : 'hover:bg-gray-700'
                                }`}
                            style={{
                                backgroundColor: activeTab === tab.id ? '#374151' : 'transparent',
                                color: '#d1d5db',
                                borderLeft: activeTab === tab.id ? '2px solid #fbbf24' : '2px solid transparent',
                                minWidth: '50px'
                            }}
                        >
                            <tab.icon size={12} />
                            <span className="text-xs mt-0.5">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-hidden m-2 rounded-xl shadow-inner" style={{
                    background: '#f9fafb',
                    border: '1px solid #d1d5db'
                }}>
                    {activeTab === 'notes' && (
                        <div className="h-full flex flex-col p-2">
                            <div className="flex gap-1 mb-2">
                                <button
                                    onClick={toggleRecording}
                                    className={`p-1.5 rounded-lg text-white transition-all ${isRecording ? 'animate-pulse' : 'hover:bg-gray-600'}`}
                                    style={{ backgroundColor: isRecording ? '#dc2626' : '#4b5563' }}
                                    title="Voice recording"
                                >
                                    <Mic size={12} />
                                </button>
                                <label className="p-1.5 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors" style={{ backgroundColor: '#4b5563' }} title="Upload files">
                                    <Upload size={12} className="text-gray-300" />
                                    <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                                </label>
                                <button
                                    onClick={() => executeCommand('save')}
                                    className="p-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                                    style={{ backgroundColor: '#4b5563' }}
                                    title="Save to Truth Repo"
                                >
                                    <Save size={12} className="text-gray-300" />
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="p-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                                    style={{ backgroundColor: '#4b5563' }}
                                    title="Export CSV"
                                >
                                    <Download size={12} className="text-gray-300" />
                                </button>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="mb-2 p-1.5 rounded-lg text-xs max-h-20 overflow-y-auto" style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24' }}>
                                    {uploadedFiles.map((f, i) => (
                                        <div key={i} className="flex justify-between items-center mb-1">
                                            <span className="truncate text-gray-700 text-xs">{f.name}</span>
                                            <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:opacity-70">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                onDrop={handleFileDrop}
                                onDragOver={(e) => e.preventDefault()}
                                placeholder="Drop files or type notes..."
                                className="flex-1 p-2 bg-white rounded-lg resize-none focus:outline-none text-xs font-mono"
                                style={{ border: '1px solid #d1d5db', color: '#111827' }}
                            />
                        </div>
                    )}

                    {activeTab === 'terminal' && (
                        <div className="h-full flex flex-col p-2 bg-black text-green-400 font-mono text-xs">
                            <div className="flex-1 overflow-y-auto mb-2 text-xs">
                                {terminalHistory.map((line, i) => (
                                    <div key={i} className="mb-0.5">{line}</div>
                                ))}
                            </div>
                            <div className="flex gap-1 text-xs">
                                <span className="text-green-500">$</span>
                                <input
                                    type="text"
                                    value={terminalInput}
                                    onChange={(e) => setTerminalInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && executeCommand(terminalInput)}
                                    className="flex-1 bg-transparent outline-none text-green-400 text-xs"
                                    placeholder="analyze | conflict | help"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'clipboard' && (
                        <div className="h-full p-2">
                            <button
                                onClick={pasteFromClipboard}
                                className="w-full mb-2 p-1.5 rounded-lg text-xs hover:bg-gray-600 transition-colors text-gray-300"
                                style={{ backgroundColor: '#4b5563' }}
                            >
                                Paste from Clipboard
                            </button>
                            <div className="h-full overflow-y-auto bg-white p-2 rounded-lg text-xs whitespace-pre-wrap text-gray-900" style={{ border: '1px solid #d1d5db' }}>
                                {clipboardContent || 'No clipboard content'}
                            </div>
                        </div>
                    )}

                    {activeTab === 'conflicts' && (
                        <div className="h-full p-2 overflow-y-auto">
                            {conflicts.length === 0 ? (
                                <div className="text-center mt-8 text-gray-500">
                                    <AlertTriangle size={32} className="mx-auto mb-2" style={{ color: '#9ca3af' }} />
                                    <p className="font-medium text-xs">No conflicts detected</p>
                                    <p className="text-xs mt-1">Use terminal: conflict</p>
                                </div>
                            ) : (
                                conflicts.map((c, i) => (
                                    <div key={i} className="mb-2 p-2 bg-red-50 rounded-lg text-xs" style={{ borderLeft: '3px solid #dc2626' }}>
                                        <div className="font-bold text-red-900 text-xs">{c.type}</div>
                                        <div className="text-red-700 text-xs mt-0.5">{c.description}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div className="h-full p-2 overflow-y-auto">
                            <div className="space-y-2">
                                <button
                                    onClick={() => executeCommand('analyze')}
                                    className="w-full p-2 rounded-lg text-left hover:bg-gray-100 transition-colors text-xs"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    <div className="font-bold text-gray-700">Analyze Case</div>
                                    <div className="text-xs text-gray-500">AI-powered analysis</div>
                                </button>
                                <button
                                    onClick={() => executeCommand('conflict')}
                                    className="w-full p-2 rounded-lg text-left hover:bg-gray-100 transition-colors text-xs"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    <div className="font-bold text-gray-700">Detect Conflicts</div>
                                    <div className="text-xs text-gray-500">Find contradictions</div>
                                </button>
                                <button
                                    onClick={() => executeCommand('neutralize')}
                                    className="w-full p-2 rounded-lg text-left hover:bg-gray-100 transition-colors text-xs"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    <div className="font-bold text-gray-700">Neutralize Text</div>
                                    <div className="text-xs text-gray-500">Convert to objective</div>
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="w-full p-2 rounded-lg text-left hover:bg-gray-100 transition-colors text-xs"
                                    style={{ border: '1px solid #d1d5db' }}
                                >
                                    <div className="font-bold text-gray-700">Export Timeline</div>
                                    <div className="text-xs text-gray-500">Save as CSV</div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="absolute bottom-2 right-2 w-4 h-4 rounded-full cursor-nwse-resize shadow-lg"
                    style={{
                        backgroundColor: '#4b5563',
                        border: '1px solid #6b7280'
                    }}
                    onMouseDown={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setIsResizing(true);
                    }}
                />
            </div>
        </div>
    );
};
