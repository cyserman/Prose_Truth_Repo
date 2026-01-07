/**
 * Layout Component - Main app shell with responsive sidebar
 * Styled to match original CaseCraft Pro design
 */

import { ActiveLayer } from '../../types';
import {
    Database,
    Calendar,
    Layout as LayoutIcon,
    Brain,
    Mic,
    BookOpen,
    FileText,
    Clock,
    FolderOpen,
    StickyNote,
    Menu,
    X,
    Upload,
    Download,
    Printer
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeLayer: ActiveLayer;
    setActiveLayer: (layer: ActiveLayer) => void;
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onImport?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
}

export function Layout({
    children,
    activeLayer,
    setActiveLayer,
    isSidebarOpen,
    setSidebarOpen,
    onImport,
    onExport,
    onPrint,
}: LayoutProps) {
    const navItems = [
        { layer: ActiveLayer.DASHBOARD, icon: LayoutIcon, label: 'Dashboard', desc: 'Case Overview' },
        { layer: ActiveLayer.SPINE, icon: Database, label: 'Truth Spine', desc: 'Evidence Repository' },
        { layer: ActiveLayer.TIMELINE, icon: Calendar, label: 'Timeline', desc: 'Chronological View' },
        { layer: ActiveLayer.SWIMLANE, icon: FolderOpen, label: 'Swimlane', desc: 'Multi-Lane Analysis' },
        { layer: ActiveLayer.NOTES, icon: StickyNote, label: 'Notes', desc: 'Case Notes' },
        { layer: ActiveLayer.AI, icon: Brain, label: 'AI Analysis', desc: 'Strategy Assistant' },
        { layer: ActiveLayer.LIVE, icon: Mic, label: 'Live Advocate', desc: 'Real-Time Monitoring' },
        { layer: ActiveLayer.KNOWLEDGE, icon: BookOpen, label: 'Knowledge Base', desc: 'Legal Research' },
        { layer: ActiveLayer.MOTIONS, icon: FileText, label: 'Motions', desc: 'Document Builder' },
        { layer: ActiveLayer.DEADLINES, icon: Clock, label: 'Deadlines', desc: 'Calendar & Alerts' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`
          fixed md:static top-0 left-0 bottom-0 z-50
          w-64 bg-slate-900 text-white
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl">⚖️</div>
                            <div>
                                <div className="text-sm font-black uppercase tracking-wider">CaseCraft</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest">TruthTrack™</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">Firey v. Firey</div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navItems.map(({ layer, icon: Icon, label, desc }) => (
                            <li key={layer}>
                                <button
                                    onClick={() => {
                                        setActiveLayer(layer);
                                        if (window.innerWidth < 768) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    className={`
                    w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left
                    transition-all duration-200
                    ${activeLayer === layer
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon size={20} className="mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold uppercase tracking-wide">{label}</div>
                                        <div className="text-[10px] opacity-75 uppercase tracking-wider">{desc}</div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="uppercase tracking-widest font-bold">Offline Mode</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">All data stored locally</div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <div className="px-4 md:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <Menu size={24} />
                            </button>

                            <div>
                                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900">
                                    {navItems.find(item => item.layer === activeLayer)?.label || 'CaseCraft'}
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    TruthTrack™ Active • Firey v. Firey
                                </p>
                            </div>
                        </div>

                        {/* Header actions */}
                        <div className="flex items-center gap-2">
                            {onImport && (
                                <button
                                    onClick={onImport}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold uppercase tracking-wide transition-colors"
                                    title="Import CSV"
                                >
                                    <Upload size={16} />
                                    <span className="hidden md:inline">Import CSV</span>
                                </button>
                            )}
                            {onExport && (
                                <button
                                    onClick={onExport}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold uppercase tracking-wide transition-colors"
                                    title="Export Data"
                                >
                                    <Download size={16} />
                                    <span className="hidden md:inline">Export</span>
                                </button>
                            )}
                            {onPrint && (
                                <button
                                    onClick={onPrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold uppercase tracking-wide transition-colors"
                                    title="Print PDF"
                                >
                                    <Printer size={16} />
                                    <span className="hidden md:inline">Print</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
