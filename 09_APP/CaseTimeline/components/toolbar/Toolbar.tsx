import { View, Text, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useTimeline } from "@/lib/timeline-context";
import { Picker } from "@react-native-picker/picker";

const ZOOM_OPTIONS = [2, 3, 6, 12] as const;
const YEARS = [2023, 2024, 2025, 2026, 2027, 2028];

interface ToolbarProps {
  onExport?: () => void;
  onImport?: () => void;
  onReset?: () => void;
}

export function Toolbar({ onExport, onImport, onReset }: ToolbarProps) {
  const { state, dispatch } = useTimeline();
  const { zoomLevel, selectedYear } = state;

  const handleZoomChange = (level: 2 | 3 | 6 | 12) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch({ type: "SET_ZOOM_LEVEL", payload: level });
  };

  const handleYearChange = (year: number) => {
    dispatch({ type: "SET_SELECTED_YEAR", payload: year });
  };

  return (
    <View className="bg-surface border-b border-border px-4 py-3">
      {/* Zoom Controls */}
      <View className="mb-3">
        <Text className="text-xs font-medium text-muted mb-2">Zoom (months)</Text>
        <View className="flex-row gap-2">
          {ZOOM_OPTIONS.map((level) => (
            <Pressable
              key={level}
              onPress={() => handleZoomChange(level)}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className={`px-4 py-2 rounded-lg border ${
                zoomLevel === level
                  ? "bg-primary border-primary"
                  : "bg-background border-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  zoomLevel === level ? "text-white" : "text-foreground"
                }`}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Year Selector */}
      <View>
        <Text className="text-xs font-medium text-muted mb-2">Year</Text>
        <View className="bg-background border border-border rounded-lg overflow-hidden">
          <Picker
            selectedValue={selectedYear}
            onValueChange={(value: number) => handleYearChange(value)}
            style={{ height: 50 }}
          >
            {YEARS.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Action Buttons */}
      {(onExport || onImport || onReset) && (
        <View className="flex-row gap-2 mt-3">
          {onExport && (
            <Pressable
              onPress={onExport}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="flex-1 bg-primary px-4 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-medium text-sm">Export</Text>
            </Pressable>
          )}
          {onImport && (
            <Pressable
              onPress={onImport}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="flex-1 bg-background border border-border px-4 py-3 rounded-lg"
            >
              <Text className="text-foreground text-center font-medium text-sm">Import</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
