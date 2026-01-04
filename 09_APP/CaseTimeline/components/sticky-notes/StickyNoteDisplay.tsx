import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StickyNote } from '@/types/spine';
import { useColors } from '@/hooks/use-colors';

interface StickyNoteDisplayProps {
  note: StickyNote;
  onPress?: () => void;
  compact?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  yellow: '#FEF08A',
  pink: '#FBCFE8',
  blue: '#DBEAFE',
  green: '#D1FAE5',
};

export function StickyNoteDisplay({ note, onPress, compact = false }: StickyNoteDisplayProps) {
  const colors = useColors();
  const bgColor = COLOR_MAP[note.color || 'yellow'] || COLOR_MAP.yellow;

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <Text className="text-xs">📌</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-3 rounded-lg mb-2"
      style={{ backgroundColor: bgColor }}
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-xs" style={{ color: '#6B7280' }}>
          {note.is_private ? '🔒 Private' : '📌 Public'}
        </Text>
      </View>
      <Text className="text-sm" style={{ color: '#1F2937' }}>
        {note.text}
      </Text>
    </TouchableOpacity>
  );
}

