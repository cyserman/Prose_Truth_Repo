/**
 * Main App Component
 * 
 * Truth Repo - Pro Se Legal DB
 * 
 * Architecture:
 * - Data Layer: lib/db.js (Dexie schema)
 * - Domain Logic: lib/spine/*, lib/importers/*
 * - Presentation: components/*
 * - Optional AI: lib/neutralize.js
 */

import { useState } from 'react';
import { ShieldCheck, Database, FileText, Calendar, Upload, Download } from 'lucide-react';
import { useCaseStore } from './state/useCaseStore';
import { SpineView } from './components/SpineView';
import { TimelineView } from './components/TimelineView';
import { IntakeQueue } from './components/IntakeQueue';
import { ExportPanel } from './components/ExportPanel';
import { ANCHOR_RULES, TRUTH_REPO_PRINCIPLES } from './constants/anchors';

function App() {
  const { dbReady, stats, refreshStats } = useCaseStore();
  const [activeView, setActiveView] = useState('intake');
  
  const views = [
    { id: 'intake', label: 'Intake Queue', icon: Upload },
    { id: 'spine', label: 'Comm Spine', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'export', label: 'Export', icon: Download },
  ];
  
  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <div className="text-gray-600">Initializing database...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-500" />
              <div>
                <h1 className="text-xl font-semibold">Pro Se Legal DB</h1>
                <p className="text-sm text-gray-600">The Truth Repo</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{stats.scans}</div>
                <div className="text-gray-500">Scans</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats.comms}</div>
                <div className="text-gray-500">Comms</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats.events}</div>
                <div className="text-gray-500">Events</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats.exhibits}</div>
                <div className="text-gray-500">Exhibits</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {views.map(view => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id);
                    refreshStats();
                  }}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeView === view.id
                      ? 'border-blue-500 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeView === 'intake' && <IntakeQueue />}
        {activeView === 'spine' && <SpineView />}
        {activeView === 'timeline' && <TimelineView />}
        {activeView === 'export' && <ExportPanel />}
      </main>
      
      {/* Footer with Anchor Reminders */}
      <footer className="bg-gray-100 border-t mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-semibold mb-2">Truth Repo Principles:</div>
            <div>{TRUTH_REPO_PRINCIPLES.PURPOSE}</div>
            <div className="mt-2">
              <strong>Key Rule:</strong> {ANCHOR_RULES.NEVER_OVERWRITE_ORIGINALS}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
