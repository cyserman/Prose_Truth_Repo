import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import { useState, useEffect } from "react";
import { Event, Attachment, VoiceNote, EventClass, EventStatus, generateId } from "@/types/timeline";
import { useTimeline } from "@/lib/timeline-context";
import { Picker } from "@react-native-picker/picker";
import { VoiceRecorder } from "./VoiceRecorder";
import { AudioPlayer } from "./AudioPlayer";
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/spine-db';
import { StickyNote, SpineItem } from '@/types/spine';
import { StickyNoteEditor } from '../sticky-notes/StickyNoteEditor';
import { StickyNoteDisplay } from '../sticky-notes/StickyNoteDisplay';
import { format } from 'date-fns';

interface EventEditorProps {
  visible: boolean;
  year: number;
  laneId: string;
  monthIndex: number;
  existingEvent?: Event;
  onClose: () => void;
}

export function EventEditor({
  visible,
  year,
  laneId,
  monthIndex,
  existingEvent,
  onClose,
}: EventEditorProps) {
  const { state, dispatch } = useTimeline();
  const { eventTypes } = state;

  const [typeId, setTypeId] = useState(existingEvent?.typeId || eventTypes[0].id);
  const [note, setNote] = useState(existingEvent?.note || "");
  const [attachments, setAttachments] = useState(existingEvent?.attachments || []);
  const [voiceNote, setVoiceNote] = useState(existingEvent?.voiceNote);
  
  // Sticky note state
  const [showStickyNoteEditor, setShowStickyNoteEditor] = useState(false);
  const [editingStickyNote, setEditingStickyNote] = useState<StickyNote | undefined>(undefined);
  
  // Get sticky notes for this event (if it exists)
  const eventStickyNotes = useLiveQuery(
    async () => {
      if (!existingEvent?.id) return [];
      return await db.stickyNotes
        .where('[target_type+target_id]')
        .equals(['timeline', existingEvent.id])
        .toArray();
    },
    [existingEvent?.id],
    []
  );

  // Get linked spine items for this event (if it has source_refs)
  const linkedSpineItems = useLiveQuery(
    async () => {
      if (!existingEvent?.source_refs || existingEvent.source_refs.length === 0) return [];
      const items: SpineItem[] = [];
      for (const ref of existingEvent.source_refs) {
        const item = await db.spine.get(ref);
        if (item) items.push(item);
      }
      return items;
    },
    [existingEvent?.source_refs?.join(',')],
    []
  );

  useEffect(() => {
    if (visible) {
      setTypeId(existingEvent?.typeId || eventTypes[0].id);
      setNote(existingEvent?.note || "");
      setAttachments(existingEvent?.attachments || []);
      setVoiceNote(existingEvent?.voiceNote);
    }
  }, [visible, existingEvent, eventTypes]);

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const event: Event = {
      id: existingEvent?.id || generateId(),
      year,
      laneId,
      monthIndex,
      typeId,
      note,
      attachments,
      voiceNote,
      class: existingEvent?.class || EventClass.ADMINISTRATIVE,
      status: existingEvent?.status || EventStatus.ASSERTED,
      createdAt: existingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingEvent) {
      dispatch({ type: "UPDATE_EVENT", payload: event });
    } else {
      dispatch({ type: "ADD_EVENT", payload: event });
    }

    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (existingEvent) {
              dispatch({ type: "DELETE_EVENT", payload: existingEvent.id });
            }
            onClose();
          },
        },
      ]
    );
  };

  const handleAddAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newAttachment: Attachment = {
          id: generateId(),
          name: file.name,
          mime: file.mimeType || "application/octet-stream",
          size: file.size || 0,
          localUri: file.uri,
          createdAt: new Date().toISOString(),
        };
        setAttachments([...attachments, newAttachment]);

        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const handleAddVoiceNote = () => {
    setShowVoiceRecorder(true);
  };

  const handleVoiceNoteSave = (newVoiceNote: VoiceNote) => {
    setVoiceNote(newVoiceNote);
    setShowVoiceRecorder(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const selectedEventType = eventTypes.find((et) => et.id === typeId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-4 py-4 border-b border-border bg-surface">
          <Text className="text-xl font-bold text-foreground">
            {existingEvent ? "Edit Event" : "Add Event"}
          </Text>
          <Text className="text-sm text-muted mt-1">
            {getMonthName(monthIndex)} {year}
          </Text>
        </View>

        <ScrollView className="flex-1">
          <View className="p-4 gap-4">
            {/* Event Type Selector */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Event Type</Text>
              <View className="bg-surface border border-border rounded-lg overflow-hidden">
                <Picker
                  selectedValue={typeId}
                  onValueChange={(value: string) => setTypeId(value)}
                  style={{ height: 50 }}
                >
                  {eventTypes.map((type) => (
                    <Picker.Item
                      key={type.id}
                      label={`${type.icon} ${type.label}`}
                      value={type.id}
                    />
                  ))}
                </Picker>
              </View>
              {selectedEventType && (
                <View
                  className="mt-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: selectedEventType.color + "20" }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: selectedEventType.color }}
                  >
                    {selectedEventType.icon} {selectedEventType.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Notes</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add detailed notes about this event..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="bg-surface border border-border rounded-lg p-3 text-foreground min-h-[120px]"
              />
            </View>

            {/* Linked Spine Items */}
            {linkedSpineItems && linkedSpineItems.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  🔗 Linked Messages ({linkedSpineItems.length})
                </Text>
                <View className="bg-surface border border-border rounded-lg overflow-hidden">
                  {linkedSpineItems.map((item, index) => (
                    <View
                      key={item.id}
                      className={`p-3 ${index !== linkedSpineItems.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-xs text-muted">
                          {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                        </Text>
                        <Text className="text-xs text-muted">
                          {item.direction === 'inbound' ? '←' : '→'} {item.counterpart}
                        </Text>
                      </View>
                      <Text className="text-sm text-foreground" numberOfLines={3}>
                        {item.content_original}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text className="text-xs text-muted mt-1">
                  These messages were promoted from the spine to create this event
                </Text>
              </View>
            )}

            {/* Attachments */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Attachments</Text>
              <Pressable
                onPress={handleAddAttachment}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                className="bg-surface border border-dashed border-border rounded-lg p-4 items-center"
              >
                <Text className="text-2xl mb-1">📎</Text>
                <Text className="text-sm text-muted">Tap to add attachments</Text>
              </Pressable>

              {attachments.length > 0 && (
                <View className="mt-2 gap-2">
                  {attachments.map((attachment) => (
                    <View
                      key={attachment.id}
                      className="bg-surface border border-border rounded-lg p-3 flex-row items-center"
                    >
                      <Text className="text-lg mr-2">📄</Text>
                      <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                        {attachment.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Voice Note */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Voice Note</Text>
              {!showVoiceRecorder ? (
                <>
                  {!voiceNote ? (
                    <Pressable
                      onPress={handleAddVoiceNote}
                      style={({ pressed }) => [
                        {
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        },
                      ]}
                      className="bg-surface border border-dashed border-border rounded-lg p-4 items-center"
                    >
                      <Text className="text-2xl mb-1">🎤</Text>
                      <Text className="text-sm text-muted">Tap to record voice note</Text>
                    </Pressable>
                  ) : (
                    <AudioPlayer
                      voiceNote={voiceNote}
                      onDelete={() => setVoiceNote(undefined)}
                    />
                  )}
                </>
              ) : (
                <VoiceRecorder
                  onSave={handleVoiceNoteSave}
                  onCancel={() => setShowVoiceRecorder(false)}
                />
              )}
            </View>

            {/* Sticky Notes Section */}
            {existingEvent && (
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium text-foreground">Private Notes</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingStickyNote(undefined);
                      setShowStickyNoteEditor(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-surface border border-border"
                  >
                    <Text className="text-sm text-muted">+ Add Note</Text>
                  </TouchableOpacity>
                </View>
                
                {eventStickyNotes && eventStickyNotes.length > 0 ? (
                  <View className="gap-2">
                    {eventStickyNotes.map((stickyNote) => (
                      <TouchableOpacity
                        key={stickyNote.id}
                        onPress={() => {
                          setEditingStickyNote(stickyNote);
                          setShowStickyNoteEditor(true);
                        }}
                      >
                        <StickyNoteDisplay note={stickyNote} />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className="bg-surface border border-dashed border-border rounded-lg p-4 items-center">
                    <Text className="text-2xl mb-1">📝</Text>
                    <Text className="text-sm text-muted">No private notes yet</Text>
                    <Text className="text-xs text-muted mt-1">
                      Private notes are not included in exports by default
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="p-4 border-t border-border bg-surface gap-2">
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className="bg-primary px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-base">
              💾 Save Event
            </Text>
          </Pressable>

          <View className="flex-row gap-2">
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="flex-1 bg-background border border-border px-4 py-3 rounded-lg"
            >
              <Text className="text-foreground text-center font-medium text-base">Cancel</Text>
            </Pressable>

            {existingEvent && (
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                className="flex-1 bg-error px-4 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-medium text-base">Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Sticky Note Editor Modal */}
      {existingEvent && (
        <StickyNoteEditor
          visible={showStickyNoteEditor}
          targetType="timeline"
          targetId={existingEvent.id}
          existingNote={editingStickyNote}
          onClose={() => {
            setShowStickyNoteEditor(false);
            setEditingStickyNote(undefined);
          }}
          onSave={() => {
            setShowStickyNoteEditor(false);
            setEditingStickyNote(undefined);
          }}
        />
      )}
    </Modal>
  );
}

function getMonthName(index: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[index] || "Unknown";
}
