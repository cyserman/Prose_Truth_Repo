import { Text, View, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Event } from "@/types/timeline";
import { cn } from "@/lib/utils";

interface TimelineCellProps {
  event?: Event;
  onPress: () => void;
}

export function TimelineCell({ event, onPress }: TimelineCellProps) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      className="min-w-[100px] border-r border-b border-border p-3"
    >
      {event ? (
        <View className="flex-row items-center justify-center gap-2 flex-wrap">
          {event.typeId && (
            <Text className="text-lg">{getEventIcon(event.typeId)}</Text>
          )}
          {event.note && (
            <Text className="text-xs">📝</Text>
          )}
          {event.attachments.length > 0 && (
            <Text className="text-xs">📁</Text>
          )}
          {event.voiceNote && (
            <Text className="text-xs">🎤</Text>
          )}
          {/* Show link icon if event has spine references */}
          {event.source_refs && event.source_refs.length > 0 && (
            <Text className="text-xs">🔗</Text>
          )}
        </View>
      ) : (
        <Text className="text-center text-xs text-muted">+ Add</Text>
      )}
    </Pressable>
  );
}

function getEventIcon(typeId: string): string {
  const icons: Record<string, string> = {
    filing: "📎",
    court: "⚖️",
    child_support: "👶",
    exhibit: "🧾",
    deadline: "⏰",
    meeting: "🤝",
  };
  return icons[typeId] || "❔";
}
