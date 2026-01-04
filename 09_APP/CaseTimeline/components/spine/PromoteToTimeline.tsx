import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SpineItem, TimelineEvent, EventStatus } from '@/types/spine';
import { db } from '@/lib/spine-db';
import { useColors } from '@/hooks/use-colors';
import { format } from 'date-fns';

interface PromoteToTimelineProps {
  visible: boolean;
  selectedItems: SpineItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export function PromoteToTimeline({
  visible,
  selectedItems,
  onClose,
  onSuccess,
}: PromoteToTimelineProps) {
  const colors = useColors();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lane, setLane] = useState('custody');
  const [status, setStatus] = useState<EventStatus>(EventStatus.ASSERTED);

  // Get date from selected items (use earliest)
  const eventDate = React.useMemo(() => {
    if (selectedItems.length === 0) return new Date().toISOString().split('T')[0];
    const dates = selectedItems.map(item => new Date(item.timestamp));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    return earliest.toISOString().split('T')[0];
  }, [selectedItems]);

  const lanes = [
    { id: 'custody', label: 'Custody' },
    { id: 'court', label: 'Court' },
    { id: 'financial', label: 'Financial' },
    { id: 'administrative', label: 'Administrative' },
  ];

  const statuses = [
    { value: EventStatus.ASSERTED, label: 'Asserted' },
    { value: EventStatus.DENIED, label: 'Denied' },
    { value: EventStatus.WITHDRAWN, label: 'Withdrawn' },
    { value: EventStatus.PENDING, label: 'Pending' },
    { value: EventStatus.RESOLVED, label: 'Resolved' },
    { value: EventStatus.FACT, label: 'Fact' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      const now = new Date().toISOString();
      const event: TimelineEvent = {
        id: `EVT-${Date.now()}`,
        date: eventDate,
        lane,
        title: title.trim(),
        description: description.trim(),
        status,
        spine_refs: selectedItems.map(item => item.id),
        created_at: now,
        updated_at: now,
      };

      await db.timeline.add(event);

      // Reset form
      setTitle('');
      setDescription('');
      setLane('custody');
      setStatus(EventStatus.ASSERTED);

      Alert.alert('Success', 'Timeline event created successfully', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating timeline event:', error);
      Alert.alert('Error', 'Failed to create timeline event');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View className="p-4 border-b flex-row justify-between items-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Create Timeline Event
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg" style={{ color: colors.tint }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Selected Items Preview */}
          <View className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.card }}>
            <Text className="font-semibold mb-2" style={{ color: colors.text }}>
              Selected Messages ({selectedItems.length})
            </Text>
            {selectedItems.slice(0, 3).map(item => (
              <View key={item.id} className="mb-2">
                <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                  {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')} • {item.counterpart}
                </Text>
                <Text className="text-sm" style={{ color: colors.text }} numberOfLines={2}>
                  {item.content_original}
                </Text>
              </View>
            ))}
            {selectedItems.length > 3 && (
              <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                +{selectedItems.length - 3} more messages
              </Text>
            )}
          </View>

          {/* Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Date
            </Text>
            <Text className="p-3 rounded-lg" style={{ backgroundColor: colors.card, color: colors.text }}>
              {format(new Date(eventDate), 'MMMM d, yyyy')}
            </Text>
          </View>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Title *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter event title"
              className="p-3 rounded-lg"
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description (summary, not raw text)"
              multiline
              numberOfLines={4}
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
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Enter a summary, not the raw message text
            </Text>
          </View>

          {/* Lane */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Lane
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {lanes.map(l => (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => setLane(l.id)}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: lane === l.id ? colors.tint : colors.card,
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: lane === l.id ? 'white' : colors.text,
                    }}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {statuses.map(s => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setStatus(s.value)}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: status === s.value ? colors.tint : colors.card,
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: status === s.value ? 'white' : colors.text,
                    }}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            className="p-4 rounded-lg items-center mb-4"
            style={{ backgroundColor: colors.tint }}
          >
            <Text className="text-white font-semibold text-lg">Create Event</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

