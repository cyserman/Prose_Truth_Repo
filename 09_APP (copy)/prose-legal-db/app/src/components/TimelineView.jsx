/**
 * Timeline View Component
 * 
 * Judge-facing timeline list (neutral).
 * Shows events with exhibit references.
 */

import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { buildTimelineEvent, saveTimelineEvent } from '../lib/spine/timelineBuilder';

export function TimelineView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    lane: '',
    title: '',
    description: '',
    status: 'asserted',
  });
  
  useEffect(() => {
    loadEvents();
  }, []);
  
  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await db.timeline_events.orderBy('date').reverse().toArray();
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    try {
      const event = buildTimelineEvent(newEvent);
      await saveTimelineEvent(event);
      await loadEvents();
      setShowAddForm(false);
      setNewEvent({
        date: new Date().toISOString().split('T')[0],
        lane: '',
        title: '',
        description: '',
        status: 'asserted',
      });
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event');
    }
  };
  
  if (loading) {
    return <div className="p-4">Loading timeline...</div>;
  }
  
  return (
    <div className="timeline-view">
      <div className="timeline-header p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Timeline Events</h2>
            <p className="text-sm text-gray-600 mt-1">
              Judge-facing neutral events ({events.length} total)
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showAddForm ? 'Cancel' : 'Add Event'}
          </button>
        </div>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleAddEvent} className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lane</label>
              <input
                type="text"
                value={newEvent.lane}
                onChange={(e) => setNewEvent({ ...newEvent, lane: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Custody, Court, Financial"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="asserted">Asserted</option>
              <option value="denied">Denied</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="fact">Fact</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Event
          </button>
        </form>
      )}
      
      <div className="timeline-list">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No timeline events yet. Add events to build the timeline.
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="timeline-item p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-gray-600">{event.lane}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">{event.description}</div>
              
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  event.status === 'asserted' ? 'bg-blue-100 text-blue-800' :
                  event.status === 'denied' ? 'bg-red-100 text-red-800' :
                  event.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
                
                {event.exhibit_refs.length > 0 && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {event.exhibit_refs.length} exhibit(s)
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mt-2">
                {event.event_id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

