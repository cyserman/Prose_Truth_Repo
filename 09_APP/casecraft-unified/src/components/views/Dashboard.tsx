/**
 * Dashboard View - Overview of case status
 */

import type { EvidenceItem, Deadline } from '../../types';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { CheckCircle, Clock, AlertCircle, FolderOpen } from 'lucide-react';

interface DashboardProps {
    evidence: EvidenceItem[];
    deadlines?: Deadline[];
}

export function Dashboard({ evidence, deadlines = [] }: DashboardProps) {
    const stats = {
        totalEvidence: evidence.length,
        verified: evidence.filter(e => e.verified).length,
        inTimeline: evidence.filter(e => e.isInTimeline).length,
        pending: evidence.filter(e => !e.verified).length,
        upcomingDeadlines: deadlines.filter(d => !d.completed).length,
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-1">Case overview and statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="!p-0">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Evidence</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvidence}</p>
                            </div>
                            <FolderOpen className="text-truth-primary" size={40} />
                        </div>
                    </div>
                </Card>

                <Card className="!p-0">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Verified</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.verified}</p>
                            </div>
                            <CheckCircle className="text-green-600" size={40} />
                        </div>
                    </div>
                </Card>

                <Card className="!p-0">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Timeline</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inTimeline}</p>
                            </div>
                            <Clock className="text-blue-600" size={40} />
                        </div>
                    </div>
                </Card>

                <Card className="!p-0">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                            </div>
                            <AlertCircle className="text-amber-600" size={40} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Evidence */}
            <Card title="Recent Evidence" subtitle="Last 5 items added">
                <div className="space-y-3">
                    {evidence.slice(0, 5).map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {item.exhibitCode && (
                                        <Badge variant="info">{item.exhibitCode}</Badge>
                                    )}
                                    {item.verified && (
                                        <Badge variant="success">✓ Verified</Badge>
                                    )}
                                    {item.isInTimeline && (
                                        <Badge variant="primary">Timeline</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-900 line-clamp-2">{item.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    {evidence.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            No evidence items yet. Import CSV or add manually.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}
