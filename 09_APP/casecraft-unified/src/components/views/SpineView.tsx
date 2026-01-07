/**
 * SpineView - Evidence Repository
 * The Truth Spine: Immutable forensic log with SHA-256 protection
 */

import { useState } from 'react';
import type { EvidenceItem } from '../../types';
import { VerificationStatus } from '../../types';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Search, X, Shield, Calendar, Tag as TagIcon } from 'lucide-react';

interface SpineViewProps {
    evidence: EvidenceItem[];
    onToggleTimeline: (id: string) => void;
    onUpdateEvidence: (updated: EvidenceItem) => void;
}

const STATUS_CONFIG = {
    [VerificationStatus.VERIFIED]: {
        label: 'Verified',
        color: 'text-green-600 bg-green-50 border-green-200',
        dot: 'bg-green-500'
    },
    [VerificationStatus.PENDING]: {
        label: 'Pending',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        dot: 'bg-yellow-500'
    },
    [VerificationStatus.DISPUTED]: {
        label: 'Disputed',
        color: 'text-red-600 bg-red-50 border-red-200',
        dot: 'bg-red-500'
    },
    [VerificationStatus.UNVERIFIED]: {
        label: 'Unverified',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        dot: 'bg-gray-500'
    },
};

export function SpineView({ evidence, onToggleTimeline, onUpdateEvidence }: SpineViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInputId, setTagInputId] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');

    // Extract all unique tags
    const allTags = Array.from(new Set(evidence.flatMap(e => e.tags || []))).sort();

    // Filter evidence
    const filtered = evidence.filter(e => {
        const matchesSearch =
            (e.sender?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.exhibitCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (e.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) || false);

        const matchesTags = selectedTags.length === 0 ||
            (e.tags && selectedTags.every(tag => e.tags!.includes(tag)));

        return matchesSearch && matchesTags;
    });

    const cycleStatus = (item: EvidenceItem) => {
        const statuses = [
            VerificationStatus.PENDING,
            VerificationStatus.VERIFIED,
            VerificationStatus.DISPUTED,
            VerificationStatus.UNVERIFIED
        ];
        const currentIndex = statuses.indexOf(item.verificationStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        onUpdateEvidence({
            ...item,
            verificationStatus: nextStatus,
            verified: nextStatus === VerificationStatus.VERIFIED
        });
    };

    const addTag = (item: EvidenceItem, tag: string) => {
        const normalized = tag.trim().toUpperCase();
        if (normalized && !(item.tags || []).includes(normalized)) {
            onUpdateEvidence({ ...item, tags: [...(item.tags || []), normalized] });
        }
        setNewTag('');
        setTagInputId(null);
    };

    const removeTag = (item: EvidenceItem, tagToRemove: string) => {
        onUpdateEvidence({ ...item, tags: item.tags?.filter(t => t !== tagToRemove) || [] });
    };

    const toggleTagFilter = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Card
                title="The Truth Spine"
                subtitle="Immutable forensic log • SHA-256 protected • Git audited"
                actions={
                    <Badge variant="success">
                        <Shield size={12} className="inline mr-1" />
                        Verified
                    </Badge>
                }
            >
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary transition-all"
                            placeholder="Search by keyword, sender, ID, exhibit code, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        {searchTerm || selectedTags.length > 0 ? (
                            <span>Showing {filtered.length} of {evidence.length} records</span>
                        ) : (
                            <span>Displaying all {evidence.length} records</span>
                        )}
                    </div>
                </div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-wrap gap-2 items-center">
                            <TagIcon size={14} className="text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Filter by Tags:</span>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTagFilter(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTags.includes(tag)
                                            ? 'bg-truth-primary text-white shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-truth-primary'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="ml-auto text-xs font-semibold text-truth-primary hover:underline"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Evidence List */}
                <div className="space-y-4">
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Header Row */}
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-xs font-mono text-gray-500">UUID-{item.id}</span>

                                            <button
                                                onClick={() => cycleStatus(item)}
                                                className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition-all ${STATUS_CONFIG[item.verificationStatus].color}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[item.verificationStatus].dot}`} />
                                                {STATUS_CONFIG[item.verificationStatus].label}
                                            </button>

                                            {item.exhibitCode && (
                                                <Badge variant="info">{item.exhibitCode}</Badge>
                                            )}

                                            {item.isInTimeline && (
                                                <Badge variant="primary">
                                                    <Calendar size={10} className="inline mr-1" />
                                                    Timeline
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="mb-2">
                                            {item.sender && (
                                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                                    {item.sender}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-700 italic">
                                                "{item.content}"
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 items-center mt-3">
                                            {item.tags?.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="group flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => removeTag(item, tag)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                            {tagInputId === item.id ? (
                                                <input
                                                    autoFocus
                                                    className="w-24 px-2 py-0.5 border border-truth-primary rounded text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-truth-primary"
                                                    placeholder="TAG NAME"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') addTag(item, newTag);
                                                        if (e.key === 'Escape') setTagInputId(null);
                                                    }}
                                                    onBlur={() => addTag(item, newTag)}
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => setTagInputId(item.id)}
                                                    className="text-xs font-semibold text-truth-primary hover:underline"
                                                >
                                                    + Add Tag
                                                </button>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Shield size={12} />
                                                <span className="font-mono">{item.hash.substring(0, 12)}...</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                            <Badge variant="default">{item.type}</Badge>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        <button
                                            onClick={() => onToggleTimeline(item.id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${item.isInTimeline
                                                    ? 'bg-gray-100 text-gray-500 cursor-default'
                                                    : 'bg-truth-primary text-white hover:bg-truth-secondary shadow-md'
                                                }`}
                                        >
                                            {item.isInTimeline ? '✓ In Timeline' : 'Add to Timeline'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Search size={48} className="mx-auto opacity-20" />
                            </div>
                            <p className="text-gray-500 mb-2">
                                No records found matching "{searchTerm}"
                            </p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedTags([]); }}
                                className="text-truth-primary hover:underline font-semibold text-sm"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
