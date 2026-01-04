import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { TimelineState } from "@/types/timeline";
import { Alert } from "react-native";

/**
 * Export timeline data to JSON file
 */
export async function exportTimelineData(state: TimelineState): Promise<void> {
  try {
    const jsonData = JSON.stringify(state, null, 2);
    const fileName = `casetimeline-export-${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: "utf8",
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Export Timeline Data",
        UTI: "public.json",
      });
    } else {
      Alert.alert("Success", `Data exported to ${fileName}`);
    }
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export timeline data");
  }
}

/**
 * Import timeline data from JSON file
 */
export async function importTimelineData(): Promise<TimelineState | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: "utf8",
    });

    const data = JSON.parse(content) as TimelineState;

    // Validate imported data structure
    if (!validateTimelineState(data)) {
      throw new Error("Invalid timeline data format");
    }

    return data;
  } catch (error) {
    console.error("Import error:", error);
    throw new Error("Failed to import timeline data");
  }
}

/**
 * Validate timeline state structure
 */
function validateTimelineState(data: any): data is TimelineState {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.lanes) &&
    Array.isArray(data.eventTypes) &&
    typeof data.events === "object" &&
    typeof data.selectedYear === "number" &&
    typeof data.zoomLevel === "number"
  );
}

/**
 * Generate a summary of timeline data for preview
 */
export function getTimelineDataSummary(state: TimelineState): string {
  const eventCount = Object.keys(state.events).length;
  const laneCount = state.lanes.length;
  const years = new Set(Object.values(state.events).map((e) => e.year));
  const yearRange = years.size > 0 ? `${Math.min(...years)}-${Math.max(...years)}` : "N/A";

  return `Events: ${eventCount} | Lanes: ${laneCount} | Years: ${yearRange}`;
}
