import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { Settings, FileText, Calendar } from 'lucide-react';

// --- CSV SYNC HOOK ---
const useCsvData = (path) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first (for offline)
    const cached = localStorage.getItem('timeline_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached data:', e);
      }
    }

    // Then try to fetch from path
    if (path && path.startsWith('http')) {
      fetch(path)
        .then((r) => r.text())
        .then((text) => {
          const parsed = Papa.parse(text, { header: true });
          setData(parsed.data);
          localStorage.setItem('timeline_data', JSON.stringify(parsed.data));
          setLoading(false);
        })
        .catch((e) => {
          console.error('Error loading CSV:', e);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [path]);

  return [data, setData, loading];
};

// --- LANE PROFILE SYSTEM ---
const DEFAULT_PROFILES = {
  "Custody": {
    name: "Custody",
    lanes: ["Communication", "Incident", "Exchange", "Note"],
    description: "Day-to-day parenting log"
  },
  "PFA / Safety": {
    name: "PFA / Safety",
    lanes: ["Incident", "Evidence", "Witness", "Filing"],
    description: "Showing corroboration sequence"
  },
  "Financial": {
    name: "Financial",
    lanes: ["Expense", "Transfer", "Order", "Note"],
    description: "For APL / support review"
  },
  "Court Prep": {
    name: "Court Prep",
    lanes: ["Filing", "Evidence", "Note", "Task"],
    description: "Hearing packet planning"
  },
  "All Categories": {
    name: "All Categories",
    lanes: ["Communication", "Incident", "Evidence", "Court Filing", "Note", "Other"],
    description: "Complete timeline view"
  }
};

const LaneProfilePicker = ({ profiles, currentProfile, onSelect, onClose }) => {
  const [selected, setSelected] = useState(currentProfile);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 text-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Select Lane Profile
        </h3>
        <div className="space-y-2">
          {Object.values(profiles).map((profile) => (
            <button
              key={profile.name}
              onClick={() => {
                setSelected(profile.name);
                onSelect(profile);
              }}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selected === profile.name
                  ? 'bg-blue-600 border-blue-400'
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <div className="font-bold">{profile.name}</div>
              <div className="text-xs text-gray-300 mt-1">{profile.description}</div>
              <div className="text-xs text-gray-400 mt-1">
                Lanes: {profile.lanes.join(', ')}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-3 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const SwimlaneTimeline = ({ csvPath, events, onEventClick }) => {
  // Convert events to CSV format if provided
  const [data, setData, loading] = useCsvData(csvPath);
  
  // If events prop is provided, convert to timeline format
  const timelineData = React.useMemo(() => {
    if (events && events.length > 0) {
      return events.map((event, idx) => ({
        Date: event.event_date || event.Date || new Date().toISOString().split('T')[0],
        Time: new Date().toLocaleTimeString(),
        Filename: event.short_title || event.Filename || `Event ${idx + 1}`,
        Categories: event.event_type || event.Categories || 'Other',
        Flags: '',
        Note: event.description || event.Note || '',
        Destination: '/09_APP/Database/',
        SourcePath: event.source || event.SourcePath || '(none)',
        Title: event.short_title || event.Title || '',
        title: event.short_title || '',
        category: event.event_type || '',
        id: idx
      }));
    }
    return data;
  }, [events, data]);
  
  const displayData = timelineData.length > 0 ? timelineData : data;
  
  const [currentProfile, setCurrentProfile] = useState(DEFAULT_PROFILES["All Categories"]);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [syncStatus, setSyncStatus] = useState('🟢 Synced');

  // Load saved profile preference
  useEffect(() => {
    const saved = localStorage.getItem('lane_profile');
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        setCurrentProfile(profile);
      } catch (e) {
        console.error('Error loading saved profile:', e);
      }
    }
  }, []);

  // Save profile preference
  const handleProfileSelect = (profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('lane_profile', JSON.stringify(profile));
    setShowProfilePicker(false);
  };

  // Save note to event
  const saveEventNote = (eventId, note) => {
    const sourceData = timelineData.length > 0 ? timelineData : data;
    const updated = sourceData.map((item, idx) => {
      if (idx === eventId) {
        const updatedItem = { ...item, Note: note };
        // Update localStorage
        const cached = JSON.parse(localStorage.getItem('timeline_data') || '[]');
        cached[idx] = updatedItem;
        localStorage.setItem('timeline_data', JSON.stringify(cached));
        return updatedItem;
      }
      return item;
    });
    setData(updated);

    // Export updated CSV
    const csvOut = Papa.unparse(updated, { header: true });
    const blob = new Blob([csvOut], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Master_CaseDB_updated.csv';
    link.click();

    // Trigger watcher
    const signal = {
      type: 'note_edit',
      timestamp: new Date().toISOString(),
      eventId: eventId,
      note: note
    };
    const jsonBlob = new Blob([JSON.stringify(signal)], { type: 'application/json' });
    const sigLink = document.createElement('a');
    sigLink.href = URL.createObjectURL(jsonBlob);
    sigLink.download = 'case_updates.json';
    sigLink.click();

    setSyncStatus('🟡 Syncing...');
    setTimeout(() => setSyncStatus('🟢 Synced'), 2000);
  };

  const getXPositionFromDate = (dateStr) => {
    if (!dateStr) return 0;
    try {
      const start = new Date('2024-01-01');
      const end = new Date('2026-01-01');
      const totalMs = end - start;
      const currentDate = new Date(dateStr);
      const currentMs = currentDate - start;
      return Math.max(0, Math.min(100, (currentMs / totalMs) * 100));
    } catch (e) {
      return 0;
    }
  };

  const getCategoryFromItem = (item) => {
    const cats = item.Categories || item.category || '';
    return cats.split(';').map(c => c.trim()).filter(Boolean);
  };

  if (loading && !displayData.length) {
    return (
      <div className="p-8 bg-gray-900 text-white text-center">
        <div className="animate-pulse">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4 bg-gray-900 text-white min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 z-10 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline: {currentProfile.name}
          </h2>
          <button
            onClick={() => setShowProfilePicker(true)}
            className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
          >
            <Settings className="w-4 h-4" />
            Switch Profile
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {syncStatus} · {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Swimlanes */}
      <div className="flex flex-col space-y-6 min-w-max">
        {currentProfile.lanes.map((lane) => {
          const laneEvents = displayData.filter((item) => {
            const categories = getCategoryFromItem(item);
            return categories.some(cat => lane.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(lane.toLowerCase()));
          });

          if (laneEvents.length === 0) return null;

          return (
            <div key={lane} className="relative">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {lane}
                <span className="text-sm text-gray-400 font-normal">({laneEvents.length})</span>
              </h3>
              <div className="relative h-24 border-b border-gray-700 bg-gray-800/30 rounded p-2">
                {laneEvents.map((event, idx) => {
                  const date = event.Date || event.date || new Date().toISOString().split('T')[0];
                  const title = event.Title || event.title || event.Filename || 'Untitled';
                  const xPos = getXPositionFromDate(date);
                  
                  return (
                    <div
                      key={idx}
                      className="absolute bg-blue-600 rounded px-2 py-1 text-xs cursor-pointer hover:bg-blue-500 transition shadow-lg border border-blue-400"
                      style={{
                        left: `${xPos}%`,
                        top: '0.5rem',
                        maxWidth: '120px',
                        zIndex: 10
                      }}
                      onClick={() => {
                        setActiveEvent({ ...event, id: idx });
                        setNoteDraft(event.Note || event.note || '');
                        if (onEventClick) onEventClick(event);
                      }}
                      title={`${title} - ${date}`}
                    >
                      <div className="font-semibold truncate">{format(new Date(date), 'MMM d')}</div>
                      <div className="text-[10px] opacity-75 truncate">{title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Picker Modal */}
      {showProfilePicker && (
        <LaneProfilePicker
          profiles={DEFAULT_PROFILES}
          currentProfile={currentProfile.name}
          onSelect={handleProfileSelect}
          onClose={() => setShowProfilePicker(false)}
        />
      )}

      {/* Note Edit Modal */}
      {activeEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setActiveEvent(null)}>
          <div className="bg-gray-800 p-6 rounded-xl w-96 text-left" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-2">
              {activeEvent.Title || activeEvent.title || activeEvent.Filename || 'Event'}
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              {activeEvent.Filename || 'Unknown source'} · {activeEvent.Date || activeEvent.date || 'No date'}
            </p>
            <p className="text-xs text-gray-300 mb-2">Categories: {activeEvent.Categories || activeEvent.category || 'None'}</p>
            {activeEvent.Flags && (
              <p className="text-xs text-amber-400 mb-2">Flags: {activeEvent.Flags}</p>
            )}

            <textarea
              className="w-full p-2 rounded bg-gray-700 text-white text-sm h-32 resize-none"
              placeholder="Add or edit note..."
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
            />

            <div className="flex justify-between mt-3">
              <button
                onClick={() => {
                  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                  recognition.lang = 'en-US';
                  recognition.onresult = (e) =>
                    setNoteDraft(noteDraft + ' ' + e.results[0][0].transcript);
                  recognition.start();
                }}
                className="px-3 py-1 bg-gray-700 rounded text-lg"
                title="Record voice"
              >
                🎙
              </button>

              <div className="space-x-2">
                <button
                  onClick={() => {
                    saveEventNote(activeEvent.id, noteDraft);
                    setActiveEvent(null);
                  }}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
                >
                  Save
                </button>
                <button
                  onClick={() => setActiveEvent(null)}
                  className="px-3 py-1 border border-gray-500 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwimlaneTimeline;
