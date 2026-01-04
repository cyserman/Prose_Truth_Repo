import { View, Text, Pressable, Platform, Alert } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useAudioRecorder, AudioModule, RecordingStatus } from "expo-audio";
import { VoiceNote, generateId } from "@/types/timeline";

interface VoiceRecorderProps {
  onSave: (voiceNote: VoiceNote) => void;
  onCancel: () => void;
}

/**
 * Full-featured Voice Recorder Component with expo-audio
 */
export function VoiceRecorder({ onSave, onCancel }: VoiceRecorderProps) {
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const recorder = useAudioRecorder({
    extension: ".m4a",
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    android: {
      extension: ".m4a",
      outputFormat: "mpeg4",
      audioEncoder: "aac",
      sampleRate: 44100,
    },
    ios: {
      extension: ".m4a",
      audioQuality: 127,
      sampleRate: 44100,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  });

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        setHasPermission(permission.granted);
        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please grant microphone access in your device settings to record audio."
          );
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    })();
  }, []);

  // Update duration during recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (recorder.isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recorder.isRecording]);

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Microphone access is required to record audio");
      return;
    }

    try {
      await recorder.record();
      setDuration(0);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const pauseRecording = async () => {
    try {
      await recorder.pause();
      setIsPaused(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Failed to pause recording:", error);
    }
  };

  const resumeRecording = async () => {
    try {
      await recorder.record();
      setIsPaused(false);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Failed to resume recording:", error);
    }
  };

  const stopAndSave = async () => {
    try {
      await recorder.stop();
      setIsPaused(false);

      const uri = recorder.uri;
      if (uri) {
        const voiceNote: VoiceNote = {
          id: generateId(),
          duration,
          localUri: uri,
          createdAt: new Date().toISOString(),
        };

        onSave(voiceNote);

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert("Error", "No recording found");
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to save recording");
    }
  };

  const cancelRecording = async () => {
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
      setDuration(0);
      onCancel();
    } catch (error) {
      console.error("Failed to cancel recording:", error);
      onCancel();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRecordingStatus = (): string => {
    if (recorder.isRecording && !isPaused) return "Recording...";
    if (isPaused) return "Paused";
    return "Ready";
  };

  return (
    <View className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <View className="items-center mb-4">
        <Text className="text-lg font-semibold text-foreground mb-2">Voice Recorder</Text>
        
        {/* Status and Duration */}
        <View className="items-center">
          <View className="flex-row items-center gap-2 mb-1">
            {recorder.isRecording && (
              <View className="w-3 h-3 bg-error rounded-full" />
            )}
            <Text className="text-sm text-muted">{getRecordingStatus()}</Text>
          </View>
          <Text className="text-3xl font-mono text-foreground font-bold">
            {formatDuration(duration)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="gap-2">
        {!recorder.isRecording && !isPaused && (
          // Start Recording Button
          <Pressable
            onPress={startRecording}
            disabled={!hasPermission}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: hasPermission ? 1 : 0.5,
              },
            ]}
            className="bg-error px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-base">
              🎤 Start Recording
            </Text>
          </Pressable>
        )}

        {recorder.isRecording && (
          // Pause Button
          <Pressable
            onPress={pauseRecording}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className="bg-warning px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-base">
              ⏸ Pause
            </Text>
          </Pressable>
        )}

        {isPaused && (
          // Resume Button
          <Pressable
            onPress={resumeRecording}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className="bg-error px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-base">
              ▶️ Resume
            </Text>
          </Pressable>
        )}

        {(recorder.isRecording || isPaused) && (
          // Stop & Save Button
          <Pressable
            onPress={stopAndSave}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className="bg-success px-4 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-base">
              ⏹ Stop & Save
            </Text>
          </Pressable>
        )}

        {/* Cancel Button */}
        <Pressable
          onPress={cancelRecording}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
          className="bg-background border border-border px-4 py-3 rounded-lg"
        >
          <Text className="text-foreground text-center font-medium text-base">Cancel</Text>
        </Pressable>
      </View>

      {/* Permission Warning */}
      {!hasPermission && (
        <View className="mt-3 p-3 bg-warning/20 rounded-lg border border-warning">
          <Text className="text-sm text-center text-foreground">
            ⚠️ Microphone permission required
          </Text>
        </View>
      )}
    </View>
  );
}
