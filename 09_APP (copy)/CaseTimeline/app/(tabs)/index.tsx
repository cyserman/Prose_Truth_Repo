import { View, Text, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { TimelineGrid } from "@/components/timeline/TimelineGrid";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { EventEditor } from "@/components/event/EventEditor";
import { useTimeline } from "@/lib/timeline-context";
import { exportTimelineData, importTimelineData, getTimelineDataSummary } from "@/lib/export-import";

export default function HomeScreen() {
  const { state, dispatch } = useTimeline();
  const [selectedCell, setSelectedCell] = useState<{
    year: number;
    laneId: string;
    monthIndex: number;
  } | null>(null);

  const handleCellPress = (year: number, laneId: string, monthIndex: number) => {
    setSelectedCell({ year, laneId, monthIndex });
  };

  const handleExport = async () => {
    try {
      await exportTimelineData(state);
      Alert.alert("Success", "Timeline data exported successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to export timeline data");
    }
  };

  const handleImport = async () => {
    try {
      const importedData = await importTimelineData();
      if (importedData) {
        const summary = getTimelineDataSummary(importedData);
        Alert.alert(
          "Import Timeline Data",
          `This will replace all current data.\n\n${summary}\n\nContinue?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Import",
              onPress: () => {
                dispatch({ type: "IMPORT_DATA", payload: importedData });
                Alert.alert("Success", "Timeline data imported successfully");
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to import timeline data");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Timeline",
      "Are you sure you want to clear all data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => dispatch({ type: "RESET_DATA" }),
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 border-b border-border bg-surface">
          <Text className="text-2xl font-bold text-foreground">CaseTimeline</Text>
          <Text className="text-sm text-muted mt-1">Legal Timeline Board</Text>
        </View>

        {/* Toolbar */}
        <Toolbar onExport={handleExport} onImport={handleImport} />

        {/* Timeline Grid */}
        <View className="flex-1 p-4">
          <TimelineGrid onCellPress={handleCellPress} />
        </View>
      </View>

      {/* Event Editor Modal */}
      {selectedCell && (
        <EventEditor
          visible={!!selectedCell}
          year={selectedCell.year}
          laneId={selectedCell.laneId}
          monthIndex={selectedCell.monthIndex}
          existingEvent={Object.values(state.events).find(
            (e) =>
              e.year === selectedCell.year &&
              e.laneId === selectedCell.laneId &&
              e.monthIndex === selectedCell.monthIndex
          )}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </ScreenContainer>
  );
}
