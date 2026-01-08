/**
 * SwimlaneView - Multi-Lane Evidence Visualization
 * Organizes evidence into horizontal lanes by category
 */

import { useState } from 'react';
import type { EvidenceItem, SwimLane } from '../../types';
import { Badge } from '../shared/Badge';
import { Settings, Calendar, FileText } from 'lucide-react';

interface SwimlaneViewProps {
    evidence: EvidenceItem[];
    onUpdateEvidence: (updated: EvidenceItem) => void;
}

interface LaneProfile {
    name: string;
    lanes: SwimLane[];
    description: string;
}

const PROFILES: Record<string, LaneProfile> = {
    custody: {
        name: 'Custody',
        lanes: ['CUSTODY', 'COMMUNICATION', 'OTHER'],
        description: 'Day-to-day parenting log',
    },
    safety: {
        name: 'PFA / Safety',
        lanes: ['SAFETY', 'CUSTODY', 'PROCEDURAL'],
        description: 'Safety incidents and PFA events',
    },
    financial: {
        name: 'Financial',
        lanes: ['FINANCIAL', 'EMPLOYMENT', 'HOUSING'],
        description: 'Financial matters and support',
    },
    courtPrep: {
        name: 'Court Prep',
        lanes: ['PROCEDURAL', 'SAFETY', 'CUSTODY'],
        description: 'Hearing preparation view',
    },
    all: {
        name: 'All Categories',
        lanes: ['SAFETY', 'CUSTODY', 'FINANCIAL', 'PROCEDURAL', 'COMMUNICATION', 'HOUSING', 'EMPLOYMENT', 'OTHER'],
        description: 'Complete timeline view',
    },
};

const LANE_COLORS: Record<SwimLane, string> = {
    SAFETY: 'bg-red-600',
    CUSTODY: 'bg-blue-600',
    FINANCIAL: 'bg-green-600',
    PROCEDURAL: 'bg-purple-600',
    COMMUNICATION: 'bg-yellow-600',
    HOUSING: 'bg-orange-600',
    EMPLOYMENT: 'bg-teal-600',
    OTHER: 'bg-gray-600',
};

export function SwimlaneView({ evidence }: Pick<SwimlaneViewProps, "evidence">) {
    const [currentProfile, setCurrentProfile] = useState<LaneProfile>(PROFILES.all);
    const [showProfilePicker, setShowProfilePicker] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EvidenceItem | null>(null);

    // Calculate horizontal position based on timestamp (0-100%)
    const getDatePosition = (timestamp: string): number => {
        try {
            const start = new Date('2024-01-01');
            const end = new Date('2026-12-31');
            const current = new Date(timestamp);

            const totalMs = end.getTime() - start.getTime();
            const currentMs = current.getTime() - start.getTime();

            return Math.max(0, Math.min(100, (currentMs / totalMs) * 100));
        } catch {
            return 50; // Default to middle if date parsing fails
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={28} />
                        Swimlane Timeline: {currentProfile.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{currentProfile.description}</p>
                </div>
                <button
                    onClick={() => setShowProfilePicker(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold"
                >
                    <Settings size={16} />
                    Switch Profile
                </button>
            </div>

            {/* Swimlanes */}
            <div className="space-y-6">
                {currentProfile.lanes.map((lane) => {
                    const laneEvents = evidence.filter(e => e.lane === lane);

                    if (laneEvents.length === 0) return null;

                    return (
                        <div key={lane} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            {/* Lane Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-3 h-3 rounded-full ${LANE_COLORS[lane]}`} />
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {lane}
                                    <Badge variant="default">{laneEvents.length}</Badge>
                                </h3>
                            </div>

                            {/* Timeline Track */}
                            <div className="relative h-24 bg-gray-50 rounded border border-gray-200">
                                {/* Timeline background grid */}
                                <div className="absolute inset-0 flex">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0" />
                                    ))}
                                </div>

                                {/* Event Bubbles */}
                                {laneEvents.map((event) => {
                                    const position = getDatePosition(event.timestamp);

                                    return (
                                        <button
                                            key={event.id}
                                            className={`absolute top-1/2 -translate-y-1/2 ${LANE_COLORS[lane]} text-white rounded-lg px-3 py-2 shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer z-10`}
                                            style={{
                                                left: `${position}%`,
                                                maxWidth: '140px',
                                                transform: 'translateY(-50%)',
                                            }}
                                            onClick={() => setSelectedEvent(event)}
                                            title={`${event.content} - ${new Date(event.timestamp).toLocaleDateString()}`}
                                        >
                                            <div className="text-xs font-bold truncate">
                                                {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] opacity-90 truncate">
                                                {event.exhibitCode || event.sender || 'Event'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Profile Picker Modal */}
            {showProfilePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowProfilePicker(false)}>
                    <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Settings size={20} />
                            Select Lane Profile
                        </h3>
                        <div className="space-y-2">
                            {Object.values(PROFILES).map((profile) => (
                                <button
                                    key={profile.name}
                                    onClick={() => {
                                        setCurrentProfile(profile);
                                        setShowProfilePicker(false);
                                        localStorage.setItem('lane_profile', JSON.stringify(profile));
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border transition ${currentProfile.name === profile.name
                                            ? 'bg-truth-primary text-white border-truth-primary'
                                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="font-bold">{profile.name}</div>
                                    <div className="text-xs opacity-75 mt-1">{profile.description}</div>
                                    <div className="text-xs opacity-60 mt-1">
                                        Lanes: {profile.lanes.join(', ')}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowProfilePicker(false)}
                            className="mt-4 w-full px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white p-6 rounded-xl w-96 text-left shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-bold text-lg mb-2 text-gray-900">
                            {selectedEvent.sender || 'Event'}
                        </h2>
                        <div className="flex items-center gap-2 mb-3">
                            {selectedEvent.exhibitCode && (
                                <Badge variant="info">{selectedEvent.exhibitCode}</Badge>
                            )}
                            <Badge variant="default">{selectedEvent.lane}</Badge>
                            <Badge variant={selectedEvent.verified ? 'success' : 'warning'}>
                                {selectedEvent.verificationStatus}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            {new Date(selectedEvent.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-900 mb-4 italic">
                            "{selectedEvent.content}"
                        </p>
                        {selectedEvent.notes && (
                            <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-4">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Notes:</p>
                                <p className="text-sm text-gray-700">{selectedEvent.notes}</p>
                            </div>
                        )}
                        {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedEvent.tags.map(tag => (
                                    <Badge key={tag} variant="default">{tag}</Badge>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {evidence.length === 0 && (
                <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No evidence items to display</p>
                    <p className="text-sm text-gray-400 mt-2">Import CSV or add items from Truth Spine</p>
                </div>
            )}
        </div>
    );
}
