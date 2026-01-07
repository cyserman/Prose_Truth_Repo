import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
} from 'react-native';
import { StickyNote } from '@/types/spine';
import { db } from '@/lib/spine-db';
import { useColors } from '@/hooks/use-colors';

interface StickyNoteEditorProps {
  visible: boolean;
  targetType: StickyNote['target_type'];
  targetId: string;
  existingNote?: StickyNote;
  onClose: () => void;
  onSave: () => void;
}

const COLORS = [
  { value: 'yellow', label: 'Yellow', hex: '#FEF08A' },
  { value: 'pink', label: 'Pink', hex: '#FBCFE8' },
  { value: 'blue', label: 'Blue', hex: '#DBEAFE' },
  { value: 'green', label: 'Green', hex: '#D1FAE5' },
];

export function StickyNoteEditor({
  visible,
  targetType,
  targetId,
  existingNote,
  onClose,
  onSave,
}: StickyNoteEditorProps) {
  const colors = useColors();
  const [text, setText] = useState('');
  const [color, setColor] = useState('yellow');
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    if (existingNote) {
      setText(existingNote.text);
      setColor(existingNote.color || 'yellow');
      setIsPrivate(existingNote.is_private);
    } else {
      setText('');
      setColor('yellow');
      setIsPrivate(true);
    }
  }, [existingNote, visible]);

  const handleSave = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      const now = new Date().toISOString();
      
      if (existingNote) {
        // Update existing note
        await db.stickyNotes.update(existingNote.id, {
          text: text.trim(),
          color,
          is_private: isPrivate,
          updated_at: now,
        });
      } else {
        // Create new note
        const note: StickyNote = {
          id: `NOTE-${Date.now()}`,
          target_type: targetType,
          target_id: targetId,
          text: text.trim(),
          color,
          is_private: isPrivate,
          created_at: now,
        };
        await db.stickyNotes.add(note);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving sticky note:', error);
    }
  };

  const handleDelete = async () => {
    if (!existingNote) return;

    try {
      await db.stickyNotes.delete(existingNote.id);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting sticky note:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View className="p-4 border-b flex-row justify-between items-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            {existingNote ? 'Edit Note' : 'Add Note'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg" style={{ color: colors.tint }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-4">
          {/* Text Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Note Text
            </Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Enter your note..."
              multiline
              numberOfLines={6}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Color Picker */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Color
            </Text>
            <View className="flex-row gap-2">
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setColor(c.value)}
                  className="w-12 h-12 rounded-lg border-2 items-center justify-center"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: color === c.value ? colors.tint : colors.border,
                  }}
                >
                  {color === c.value && (
                    <Text className="text-lg">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy Toggle */}
          <View className="mb-4 flex-row justify-between items-center p-3 rounded-lg" style={{ backgroundColor: colors.card }}>
            <View className="flex-1">
              <Text className="font-semibold mb-1" style={{ color: colors.text }}>
                Private Note
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Private notes are not included in exports by default
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.border, true: colors.tint }}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-2">
            {existingNote && (
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: '#EF4444' }}
              >
                <Text className="text-white font-semibold">Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 p-4 rounded-lg items-center"
              style={{ backgroundColor: colors.tint }}
              disabled={!text.trim()}
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

