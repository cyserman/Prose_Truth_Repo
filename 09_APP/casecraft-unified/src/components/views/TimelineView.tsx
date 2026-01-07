/**
 * TimelineView - Chronological Evidence Display
 * Shows evidence items in chronological order with lane organization
 */

import { useState } from 'react';
import type { EvidenceItem, SwimLane } from '../../types';
import { VerificationStatus } from '../../types';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Calendar, ArrowUpDown } from 'lucide-react';

interface TimelineViewProps {
    evidence: EvidenceItem[];
    onUpdateEvidence: (updated: EvidenceItem) => void;
}

const LANES: { id: SwimLane; label: string; color: string }[] = [
    { id: 'SAFETY', label: 'PFA / Safety', color: 'bg-red-50' },
    { id: 'CUSTODY', label: 'Custody', color: 'bg-blue-50' },
    { id: 'FINANCIAL', label: 'Financial', color: 'bg-green-50' },
    { id: 'PROCEDURAL', label: 'Court / Procedural', color: 'bg-purple-50' },
    { id: 'COMMUNICATION', label: 'Communication', color: 'bg-yellow-50' },
    { id: 'HOUSING', label: 'Housing', color: 'bg-orange-50' },
    { id: 'EMPLOYMENT', label: 'Employment', color: 'bg-teal-50' },
    { id: 'OTHER', label: 'Other', color: 'bg-gray-50' },
];

export function TimelineView({ evidence, onUpdateEvidence }: TimelineViewProps) {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const sorted = [...evidence].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const updateLane = (item: EvidenceItem, lane: SwimLane) => {
        onUpdateEvidence({ ...item, lane });
    };

    const getStatusColor = (status: VerificationStatus) => {
        switch (status) {
            case VerificationStatus.VERIFIED: return 'bg-green-500';
            case VerificationStatus.DISPUTED: return 'bg-red-500';
            case VerificationStatus.PENDING: return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <Card
                title="Timeline View"
                subtitle="Chronological evidence progression"
                actions={
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-truth-primary text-white rounded-lg hover:bg-truth-secondary transition-colors text-sm"
                    >
                        <ArrowUpDown size={16} />
                        {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                    </button>
                }
            >
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                        {sorted.map((item) => (
                            <div key={item.id} className="relative pl-12 pb-8 last:pb-0">
                                {/* Dot on timeline */}
                                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(item.verificationStatus)}`} />

                                {/* Content */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Calendar size={14} className="text-gray-500" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {new Date(item.timestamp).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {item.exhibitCode && (
                                                <Badge variant="info">{item.exhibitCode}</Badge>
                                            )}
                                        </div>

                                        {/* Lane selector */}
                                        <select
                                            value={item.lane || 'OTHER'}
                                            onChange={(e) => updateLane(item, e.target.value as SwimLane)}
                                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-truth-primary"
                                        >
                                            {LANES.map(lane => (
                                                <option key={lane.id} value={lane.id}>
                                                    {lane.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sender */}
                                    {item.sender && (
                                        <div className="text-sm font-semibold text-gray-900 mb-2">
                                            {item.sender}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="text-sm text-gray-700 mb-3">
                                        {item.contentNeutral ? (
                                            <div>
                                                <div className="font-medium text-truth-primary mb-1">
                                                    Neutralized:
                                                </div>
                                                <div className="italic">{item.contentNeutral}</div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Original: "{item.content}"
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="italic">"{item.content}"</div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {item.tags.map(tag => (
                                                <Badge key={tag} variant="default">{tag}</Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                        <span>Type: {item.type}</span>
                                        {item.lane && <span>Lane: {item.lane}</span>}
                                        <span className={`px-2 py-0.5 rounded ${item.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {item.verificationStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {sorted.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No evidence items in timeline</p>
                                <p className="text-sm mt-2">Add items from the Truth Spine</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
