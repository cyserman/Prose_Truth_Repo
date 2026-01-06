import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Plus, Trash2, Bell, BellOff } from 'lucide-react';
import { format, addDays, differenceInDays, isPast, isToday, isFuture } from 'date-fns';

const DeadlineTracker = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    date: '',
    type: 'Filing',
    description: '',
    reminderDays: 7
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('deadlines');
    if (saved) {
      try {
        setDeadlines(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading deadlines:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (deadlines.length > 0) {
      localStorage.setItem('deadlines', JSON.stringify(deadlines));
    }
  }, [deadlines]);

  // Check for upcoming deadlines and show notifications
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const upcoming = deadlines.filter(d => {
        const deadlineDate = new Date(d.date);
        const daysUntil = differenceInDays(deadlineDate, now);
        return daysUntil <= d.reminderDays && daysUntil >= 0 && !d.completed;
      });

      if (upcoming.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        upcoming.forEach(d => {
          const daysUntil = differenceInDays(new Date(d.date), now);
          if (daysUntil === d.reminderDays) {
            new Notification(`Deadline Reminder: ${d.title}`, {
              body: `${d.title} is due in ${daysUntil} day(s)`,
              icon: '/favicon.ico'
            });
          }
        });
      }
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [deadlines]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const addDeadline = () => {
    if (!newDeadline.title || !newDeadline.date) return;

    const deadline = {
      id: Date.now().toString(),
      ...newDeadline,
      createdAt: new Date().toISOString(),
      completed: false
    };

    setDeadlines([...deadlines, deadline]);
    setNewDeadline({
      title: '',
      date: '',
      type: 'Filing',
      description: '',
      reminderDays: 7
    });
    setShowAddForm(false);
  };

  const toggleComplete = (id) => {
    setDeadlines(deadlines.map(d => 
      d.id === id ? { ...d, completed: !d.completed } : d
    ));
  };

  const deleteDeadline = (id) => {
    setDeadlines(deadlines.filter(d => d.id !== id));
  };

  const sortedDeadlines = useMemo(() => {
    return [...deadlines].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [deadlines]);

  const getDeadlineStatus = (deadline) => {
    const daysUntil = differenceInDays(new Date(deadline.date), new Date());
    
    if (deadline.completed) return { status: 'completed', label: 'Completed', color: 'green' };
    if (isPast(new Date(deadline.date))) return { status: 'overdue', label: 'Overdue', color: 'red' };
    if (isToday(new Date(deadline.date))) return { status: 'today', label: 'Due Today', color: 'orange' };
    if (daysUntil <= 3) return { status: 'urgent', label: `${daysUntil} days`, color: 'orange' };
    if (daysUntil <= deadline.reminderDays) return { status: 'upcoming', label: `${daysUntil} days`, color: 'yellow' };
    return { status: 'future', label: `${daysUntil} days`, color: 'blue' };
  };

  const overdueCount = deadlines.filter(d => !d.completed && isPast(new Date(d.date))).length;
  const todayCount = deadlines.filter(d => !d.completed && isToday(new Date(d.date))).length;
  const upcomingCount = deadlines.filter(d => {
    const daysUntil = differenceInDays(new Date(d.date), new Date());
    return !d.completed && daysUntil > 0 && daysUntil <= 7;
  }).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Deadline Tracker
            </h2>
            <p className="text-sm text-slate-600 mt-1">Track court deadlines, filing dates, and important dates</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Deadline
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <div className="text-sm text-red-700">Overdue</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{todayCount}</div>
            <div className="text-sm text-orange-700">Due Today</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{upcomingCount}</div>
            <div className="text-sm text-yellow-700">This Week</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{deadlines.length}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="border border-slate-200 rounded-lg p-4 mb-6 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-4">Add New Deadline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                  placeholder="e.g., File Response to Motion"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={newDeadline.date}
                  onChange={(e) => setNewDeadline({ ...newDeadline, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={newDeadline.type}
                  onChange={(e) => setNewDeadline({ ...newDeadline, type: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option>Filing</option>
                  <option>Hearing</option>
                  <option>Response</option>
                  <option>Court Order</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reminder (days before)</label>
                <input
                  type="number"
                  value={newDeadline.reminderDays}
                  onChange={(e) => setNewDeadline({ ...newDeadline, reminderDays: parseInt(e.target.value) || 7 })}
                  min="0"
                  max="30"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={addDeadline}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Deadline
              </button>
            </div>
          </div>
        )}

        {/* Deadlines List */}
        <div className="space-y-3">
          {sortedDeadlines.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No deadlines yet. Add one to get started.</p>
            </div>
          ) : (
            sortedDeadlines.map(deadline => {
              const status = getDeadlineStatus(deadline);
              return (
                <div
                  key={deadline.id}
                  className={`border rounded-lg p-4 ${
                    deadline.completed
                      ? 'bg-green-50 border-green-200'
                      : status.status === 'overdue'
                      ? 'bg-red-50 border-red-200'
                      : status.status === 'today'
                      ? 'bg-orange-50 border-orange-200'
                      : status.status === 'urgent'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={deadline.completed}
                          onChange={() => toggleComplete(deadline.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${deadline.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {deadline.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                              {status.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                              {deadline.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(deadline.date), 'MMMM d, yyyy')}
                            </span>
                            {deadline.description && (
                              <span>{deadline.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDeadline(deadline.id)}
                      className="p-2 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DeadlineTracker;

