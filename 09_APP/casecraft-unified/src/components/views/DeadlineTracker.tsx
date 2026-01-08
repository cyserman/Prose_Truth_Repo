/**
 * DeadlineTracker - Deadline Management Component
 * Track important case deadlines with reminders
 */

import { useState } from 'react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Clock, Plus, Trash2, CheckCircle, Circle, AlertTriangle, Calendar } from 'lucide-react';

interface Deadline {
    id: string;
    title: string;
    date: string;
    type: 'filing' | 'hearing' | 'response' | 'deadline' | 'task';
    description?: string;
    completed: boolean;
    reminderDays?: number;
}

interface DeadlineTrackerProps {
    deadlines?: Deadline[];
    onUpdateDeadlines?: (deadlines: Deadline[]) => void;
}

export function DeadlineTracker({ deadlines: initialDeadlines = [], onUpdateDeadlines }: DeadlineTrackerProps) {
    const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDeadline, setNewDeadline] = useState<Partial<Deadline>>({
        title: '',
        date: '',
        type: 'deadline',
        description: '',
        reminderDays: 7,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const addDeadline = () => {
        if (!newDeadline.title || !newDeadline.date) {
            alert('Please fill in title and date');
            return;
        }

        const deadline: Deadline = {
            id: `dl-${Date.now()}`,
            title: newDeadline.title,
            date: newDeadline.date,
            type: newDeadline.type || 'deadline',
            description: newDeadline.description,
            completed: false,
            reminderDays: newDeadline.reminderDays,
        };

        const updated = [...deadlines, deadline];
        setDeadlines(updated);
        onUpdateDeadlines?.(updated);

        // Save to localStorage
        localStorage.setItem('deadlines', JSON.stringify(updated));

        setNewDeadline({ title: '', date: '', type: 'deadline', description: '', reminderDays: 7 });
        setShowAddForm(false);
    };

    const toggleComplete = (id: string) => {
        const updated = deadlines.map(d => d.id === id ? { ...d, completed: !d.completed } : d);
        setDeadlines(updated);
        onUpdateDeadlines?.(updated);
        localStorage.setItem('deadlines', JSON.stringify(updated));
    };

    const deleteDeadline = (id: string) => {
        const updated = deadlines.filter(d => d.id !== id);
        setDeadlines(updated);
        onUpdateDeadlines?.(updated);
        localStorage.setItem('deadlines', JSON.stringify(updated));
    };

    const getDaysUntil = (dateStr: string): number => {
        const deadline = new Date(dateStr);
        deadline.setHours(0, 0, 0, 0);
        const diffTime = deadline.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatusColor = (daysUntil: number, completed: boolean) => {
        if (completed) return 'success';
        if (daysUntil < 0) return 'danger';
        if (daysUntil === 0) return 'warning';
        if (daysUntil <= 7) return 'warning';
        return 'info';
    };

    const overdue = deadlines.filter(d => !d.completed && getDaysUntil(d.date) < 0);
    const dueToday = deadlines.filter(d => !d.completed && getDaysUntil(d.date) === 0);
    const upcoming = deadlines.filter(d => !d.completed && getDaysUntil(d.date) > 0 && getDaysUntil(d.date) <= 7);
    const completed = deadlines.filter(d => d.completed);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={28} />
                        Deadline Tracker
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage court dates and filing deadlines</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-truth-primary hover:bg-truth-secondary text-white rounded-lg font-semibold"
                >
                    <Plus size={18} />
                    Add Deadline
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="!p-0">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase">Overdue</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{overdue.length}</p>
                            </div>
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                    </div>
                </Card>

                <Card className="!p-0">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase">Due Today</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">{dueToday.length}</p>
                            </div>
                            <Clock className="text-amber-500" size={32} />
                        </div>
                    </div>
                </Card>

                <Card className="!p-0">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase">This Week</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{upcoming.length}</p>
                            </div>
                            <Calendar className="text-blue-500" size={32} />
                        </div>
                    </div>
                </Card>

                <Card className="!p-0">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase">Completed</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{completed.length}</p>
                            </div>
                            <CheckCircle className="text-green-500" size={32} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Deadlines List */}
            <Card title="All Deadlines">
                <div className="space-y-3">
                    {deadlines.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Clock size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No deadlines tracked yet</p>
                            <p className="text-sm mt-2">Click "Add Deadline" to get started</p>
                        </div>
                    ) : (
                        deadlines.map(deadline => {
                            const daysUntil = getDaysUntil(deadline.date);
                            const statusColor = getStatusColor(daysUntil, deadline.completed);

                            return (
                                <div
                                    key={deadline.id}
                                    className={`p-4 rounded-lg border-2 transition-all ${deadline.completed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:border-truth-primary'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => toggleComplete(deadline.id)}
                                            className="mt-1 text-gray-400 hover:text-truth-primary transition-colors"
                                        >
                                            {deadline.completed ? (
                                                <CheckCircle size={24} className="text-green-500" />
                                            ) : (
                                                <Circle size={24} />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className={`font-semibold ${deadline.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                    {deadline.title}
                                                </h3>
                                                <Badge variant={statusColor}>
                                                    {deadline.type}
                                                </Badge>
                                                {!deadline.completed && (
                                                    <Badge variant={statusColor}>
                                                        {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil}d remaining`}
                                                    </Badge>
                                                )}
                                            </div>
                                            {deadline.description && (
                                                <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Due: {new Date(deadline.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => deleteDeadline(deadline.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Add Deadline Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Add New Deadline</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary"
                                    placeholder="Motion for Custody hearing"
                                    value={newDeadline.title}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary"
                                    value={newDeadline.date}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary"
                                    value={newDeadline.type}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, type: e.target.value as any })}
                                >
                                    <option value="filing">Filing</option>
                                    <option value="hearing">Hearing</option>
                                    <option value="response">Response</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="task">Task</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary resize-none"
                                    rows={2}
                                    placeholder="Additional details..."
                                    value={newDeadline.description}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addDeadline}
                                className="flex-1 px-4 py-2 bg-truth-primary hover:bg-truth-secondary text-white rounded-lg font-semibold"
                            >
                                Add Deadline
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
