import { View, ScrollView, Text } from "react-native";
import { useTimeline } from "@/lib/timeline-context";
import { TimelineCell } from "./TimelineCell";
import { getEventKey } from "@/types/timeline";
import { useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface TimelineGridProps {
  onCellPress: (year: number, laneId: string, monthIndex: number) => void;
}

export function TimelineGrid({ onCellPress }: TimelineGridProps) {
  const { state } = useTimeline();
  const { lanes, events, selectedYear, zoomLevel } = state;

  const visibleMonths = MONTHS.slice(0, zoomLevel);

  return (
    <View className="flex-1 border border-border rounded-lg overflow-hidden bg-surface">
      {/* Header Row */}
      <View className="flex-row border-b border-border bg-background">
        <View className="w-[140px] px-3 py-3 border-r border-border justify-center">
          <Text className="font-semibold text-sm text-foreground">Role</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {visibleMonths.map((month, index) => (
              <View
                key={index}
                className="min-w-[100px] px-3 py-3 border-r border-border justify-center items-center"
              >
                <Text className="font-semibold text-sm text-muted">{month}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Lane Rows */}
      <ScrollView>
        {lanes
          .sort((a, b) => a.order - b.order)
          .map((lane) => (
            <View key={lane.id} className="flex-row border-b border-border">
              {/* Lane Title */}
              <View className="w-[140px] px-3 py-4 border-r border-border justify-center bg-surface">
                <Text className="font-medium text-sm text-foreground" numberOfLines={2}>
                  {lane.title}
                </Text>
              </View>

              {/* Cells */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {visibleMonths.map((_, monthIndex) => {
                    const eventKey = getEventKey(selectedYear, lane.id, monthIndex);
                    const event = Object.values(events).find(
                      (e) => e.year === selectedYear && e.laneId === lane.id && e.monthIndex === monthIndex
                    );

                    return (
                      <TimelineCell
                        key={monthIndex}
                        event={event}
                        onPress={() => onCellPress(selectedYear, lane.id, monthIndex)}
                      />
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
