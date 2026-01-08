/**
 * AIAnalysisView - AI-Powered Case Analysis  
 * Framework for future Gemini integration (optional)
 */

import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Brain, Sparkles, AlertTriangle, TrendingUp, FileSearch } from 'lucide-react';
import type { EvidenceItem } from '../../types';

interface AIAnalysisViewProps {
    evidence: EvidenceItem[];
}

export function AIAnalysisView({ evidence }: AIAnalysisViewProps) {
    const apiKeyConfigured = !!import.meta.env.VITE_GEMINI_API_KEY;

    const stats = {
        totalEvidence: evidence.length,
        verified: evidence.filter(e => e.verified).length,
        inTimeline: evidence.filter(e => e.isInTimeline).length,
        uniqueTags: new Set(evidence.flatMap(e => e.tags || [])).size,
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Brain size={28} className="text-purple-600" />
                    AI Analysis
                </h2>
                <p className="text-sm text-gray-600 mt-1">Strategic case analysis powered by AI (optional)</p>
            </div>

            {/* API Status */}
            <Card>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${apiKeyConfigured ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <Sparkles size={24} className={apiKeyConfigured ? 'text-green-600' : 'text-amber-600'} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                            {apiKeyConfigured ? '✅ Gemini AI Configured' : '⚠️ Gemini AI Not Configured'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            {apiKeyConfigured
                                ? 'Your Gemini API key is configured. AI features are ready to use.'
                                : 'Add your Gemini API key to .env to enable AI-powered analysis. This is optional - the app works fully without it.'}
                        </p>
                        {!apiKeyConfigured && (
                            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs font-mono">
                                <p className="text-gray-700 mb-1">1. Copy .env.example to .env</p>
                                <p className="text-gray-700">2. Add: VITE_GEMINI_API_KEY=your-key-here</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Case Statistics */}
            <Card title="Case Overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Total Evidence</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalEvidence}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-xs font-semibold text-green-600 uppercase mb-1">Verified</p>
                        <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-xs font-semibold text-purple-600 uppercase mb-1">In Timeline</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.inTimeline}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Unique Tags</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.uniqueTags}</p>
                    </div>
                </div>
            </Card>

            {/* Analysis Features (Future) */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <div className="flex items-start gap-3">
                        <TrendingUp size={24} className="text-blue-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Pattern Detection</h3>
                            <Badge variant="default">Coming Soon</Badge>
                            <p className="text-sm text-gray-600 mt-2">
                                AI will analyze your evidence timeline to identify patterns, gaps, and inconsistencies automatically.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={24} className="text-red-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Contradiction Detection</h3>
                            <Badge variant="default">Coming Soon</Badge>
                            <p className="text-sm text-gray-600 mt-2">
                                Automatically scan for contradictory statements or timeline inconsistencies in opponent's claims.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <FileSearch size={24} className="text-purple-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Strategic Analysis</h3>
                            <Badge variant="default">Coming Soon</Badge>
                            <p className="text-sm text-gray-600 mt-2">
                                Get AI-powered suggestions for case strategy based on your evidence timeline and patterns.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <Sparkles size={24} className="text-green-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Language Neutralization</h3>
                            <Badge variant="default">Coming Soon</Badge>
                            <p className="text-sm text-gray-600 mt-2">
                                Convert emotional language to court-ready, neutral phrasing while preserving factual content.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Privacy Notice */}
            <Card>
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Privacy-First AI</h3>
                        <p className="text-sm text-gray-600">
                            When you enable AI features, your case data is sent to Google's Gemini API for analysis.
                            No data is stored or used for training. You maintain complete control - AI features are
                            <strong> optional and disabled by default</strong>. For maximum privacy, use this app
                            offline without any API key configured.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
