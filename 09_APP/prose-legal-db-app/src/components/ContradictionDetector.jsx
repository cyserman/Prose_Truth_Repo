import React, { useState, useMemo } from 'react';
import { AlertTriangle, Search, Sparkles, FileText, TrendingUp } from 'lucide-react';

const ContradictionDetector = ({ events }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contradictions, setContradictions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Analyze events for contradictions
  const analyzeContradictions = async () => {
    setIsAnalyzing(true);
    
    try {
      // Group events by topic/keyword
      const topicGroups = {};
      
      events.forEach(event => {
        const text = (event.description || '').toLowerCase();
        const neutral = (event.description_neutral || '').toLowerCase();
        const combined = text + ' ' + neutral;
        
        // Extract key topics
        const topics = extractTopics(combined);
        topics.forEach(topic => {
          if (!topicGroups[topic]) {
            topicGroups[topic] = [];
          }
          topicGroups[topic].push(event);
        });
      });

      // Find contradictions within each topic
      const found = [];
      
      Object.entries(topicGroups).forEach(([topic, groupEvents]) => {
        if (groupEvents.length < 2) return;
        
        // Check for contradictory statements
        const contradictions = findContradictions(topic, groupEvents);
        found.push(...contradictions);
      });

      setContradictions(found);
    } catch (error) {
      console.error('Error analyzing contradictions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTopics = (text) => {
    const topics = [];
    const keywords = [
      'pickup', 'drop', 'exchange', 'custody', 'visitation',
      'communication', 'call', 'text', 'email',
      'payment', 'support', 'alimony', 'financial',
      'school', 'medical', 'decision', 'permission'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics;
  };

  const findContradictions = (topic, events) => {
    const contradictions = [];
    
    // Simple contradiction detection based on keywords
    const positiveKeywords = ['agreed', 'allowed', 'permitted', 'yes', 'approved', 'granted'];
    const negativeKeywords = ['refused', 'denied', 'blocked', 'no', 'rejected', 'prevented'];
    
    const positiveEvents = events.filter(e => {
      const text = (e.description || '').toLowerCase();
      return positiveKeywords.some(k => text.includes(k));
    });
    
    const negativeEvents = events.filter(e => {
      const text = (e.description || '').toLowerCase();
      return negativeKeywords.some(k => text.includes(k));
    });
    
    if (positiveEvents.length > 0 && negativeEvents.length > 0) {
      contradictions.push({
        topic,
        type: 'positive_negative',
        description: `Contradictory statements found regarding ${topic}: some events indicate agreement/permission while others indicate refusal/denial.`,
        positiveEvents: positiveEvents.map(e => ({
          id: e.event_id,
          date: e.event_date,
          text: e.description || e.description_neutral
        })),
        negativeEvents: negativeEvents.map(e => ({
          id: e.event_id,
          date: e.event_date,
          text: e.description || e.description_neutral
        })),
        severity: 'high'
      });
    }
    
    // Check for timeline inconsistencies
    const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      
      // Check for impossible sequences
      if (current.description?.toLowerCase().includes('completed') && 
          next.description?.toLowerCase().includes('started') &&
          new Date(next.event_date) < new Date(current.event_date)) {
        contradictions.push({
          topic,
          type: 'timeline',
          description: `Timeline inconsistency: event marked as completed before it started.`,
          events: [current, next].map(e => ({
            id: e.event_id,
            date: e.event_date,
            text: e.description || e.description_neutral
          })),
          severity: 'medium'
        });
      }
    }
    
    return contradictions;
  };

  const filteredContradictions = useMemo(() => {
    if (!searchTerm) return contradictions;
    return contradictions.filter(c => 
      c.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contradictions, searchTerm]);

  const highSeverityCount = contradictions.filter(c => c.severity === 'high').length;
  const mediumSeverityCount = contradictions.filter(c => c.severity === 'medium').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Contradiction Detector
            </h2>
            <p className="text-sm text-slate-600 mt-1">Identify inconsistencies and contradictions in statements</p>
          </div>
          <button
            onClick={analyzeContradictions}
            disabled={isAnalyzing || events.length === 0}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze for Contradictions
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        {contradictions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{highSeverityCount}</div>
              <div className="text-sm text-red-700">High Severity</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{mediumSeverityCount}</div>
              <div className="text-sm text-yellow-700">Medium Severity</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{contradictions.length}</div>
              <div className="text-sm text-blue-700">Total Found</div>
            </div>
          </div>
        )}

        {/* Search */}
        {contradictions.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contradictions..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        )}

        {/* Contradictions List */}
        <div className="space-y-4">
          {contradictions.length === 0 && !isAnalyzing && (
            <div className="text-center py-12 text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No contradictions found yet. Click "Analyze" to scan your timeline.</p>
            </div>
          )}

          {filteredContradictions.map((contradiction, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-6 ${
                contradiction.severity === 'high'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      contradiction.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {contradiction.severity.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded text-xs font-medium bg-slate-200 text-slate-700">
                      {contradiction.topic}
                    </span>
                    <span className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {contradiction.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-900 font-medium mb-3">{contradiction.description}</p>
                </div>
              </div>

              {/* Events */}
              {contradiction.positiveEvents && contradiction.negativeEvents && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2">Positive Statements</h4>
                    <div className="space-y-2">
                      {contradiction.positiveEvents.map((e, i) => (
                        <div key={i} className="bg-white border border-green-200 rounded p-3 text-sm">
                          <div className="text-xs text-slate-500 mb-1">{e.date}</div>
                          <div className="text-slate-900">{e.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Negative Statements</h4>
                    <div className="space-y-2">
                      {contradiction.negativeEvents.map((e, i) => (
                        <div key={i} className="bg-white border border-red-200 rounded p-3 text-sm">
                          <div className="text-xs text-slate-500 mb-1">{e.date}</div>
                          <div className="text-slate-900">{e.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {contradiction.events && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Related Events</h4>
                  <div className="space-y-2">
                    {contradiction.events.map((e, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded p-3 text-sm">
                        <div className="text-xs text-slate-500 mb-1">{e.date}</div>
                        <div className="text-slate-900">{e.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContradictionDetector;

