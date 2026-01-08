/**
 * NotesView - Sticky Notes Management
 * Create, edit, and organize case notes
 */

import { useState } from 'react';
import { Badge } from '../shared/Badge';
import { StickyNote, Plus, Trash2, Edit } from 'lucide-react';

interface Note {
    id: string;
    title: string;
    content: string;
    color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
    createdAt: string;
    updatedAt: string;
}

interface NotesViewProps {
    notes?: Note[];
    onUpdateNotes?: (notes: Note[]) => void;
}

const COLOR_CLASSES = {
    yellow: 'bg-yellow-100 border-yellow-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    pink: 'bg-pink-100 border-pink-300',
    purple: 'bg-purple-100 border-purple-300',
};

export function NotesView({ notes: initialNotes = [], onUpdateNotes }: NotesViewProps) {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [newNote, setNewNote] = useState<Partial<Note>>({
        title: '',
        content: '',
        color: 'yellow',
    });

    const addNote = () => {
        if (!newNote.title || !newNote.content) {
            alert('Please fill in title and content');
            return;
        }

        const note: Note = {
            id: editingNote?.id || `note-${Date.now()}`,
            title: newNote.title,
            content: newNote.content,
            color: newNote.color || 'yellow',
            createdAt: editingNote?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        let updated: Note[];
        if (editingNote) {
            updated = notes.map(n => n.id === editingNote.id ? note : n);
        } else {
            updated = [...notes, note];
        }

        setNotes(updated);
        onUpdateNotes?.(updated);
        localStorage.setItem('notes', JSON.stringify(updated));

        setNewNote({ title: '', content: '', color: 'yellow' });
        setShowAddForm(false);
        setEditingNote(null);
    };

    const deleteNote = (id: string) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        onUpdateNotes?.(updated);
        localStorage.setItem('notes', JSON.stringify(updated));
    };

    const startEdit = (note: Note) => {
        setEditingNote(note);
        setNewNote({ title: note.title, content: note.content, color: note.color });
        setShowAddForm(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <StickyNote size={28} />
                        Case Notes
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Quick notes and reminders for your case</p>
                </div>
                <button
                    onClick={() => {
                        setEditingNote(null);
                        setNewNote({ title: '', content: '', color: 'yellow' });
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-truth-primary hover:bg-truth-secondary text-white rounded-lg font-semibold"
                >
                    <Plus size={18} />
                    Add Note
                </button>
            </div>

            {/* Notes Grid */}
            {notes.length === 0 ? (
                <div className="text-center py-12">
                    <StickyNote size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No notes yet</p>
                    <p className="text-sm text-gray-400 mt-2">Click "Add Note" to create your first note</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            className={`p-4 rounded-lg border-2 shadow-md hover:shadow-lg transition-shadow ${COLOR_CLASSES[note.color]}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-gray-900 flex-1">{note.title}</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => startEdit(note)}
                                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                                {note.content}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-300">
                                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                <Badge variant="default">{note.color}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Note Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
                    setShowAddForm(false);
                    setEditingNote(null);
                }}>
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">
                            {editingNote ? 'Edit Note' : 'Add New Note'}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary"
                                    placeholder="Note title..."
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-truth-primary resize-none"
                                    rows={5}
                                    placeholder="Note content..."
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                                <div className="flex gap-2">
                                    {(['yellow', 'blue', 'green', 'pink', 'purple'] as const).map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewNote({ ...newNote, color })}
                                            className={`w-10 h-10 rounded-lg border-2 transition-all ${COLOR_CLASSES[color]} ${newNote.color === color ? 'ring-2 ring-truth-primary scale-110' : 'hover:scale-105'
                                                }`}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addNote}
                                className="flex-1 px-4 py-2 bg-truth-primary hover:bg-truth-secondary text-white rounded-lg font-semibold"
                            >
                                {editingNote ? 'Update Note' : 'Add Note'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingNote(null);
                                }}
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
