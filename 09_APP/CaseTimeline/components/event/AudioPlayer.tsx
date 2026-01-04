import { View, Text, Pressable, Platform } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useAudioPlayer, AudioModule } from "expo-audio";
import { VoiceNote } from "@/types/timeline";

interface AudioPlayerProps {
  voiceNote: VoiceNote;
  onDelete?: () => void;
}

/**
 * Audio Player Component for Voice Note Playback
 */
export function AudioPlayer({ voiceNote, onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const player = useAudioPlayer(voiceNote.localUri);

  // Update current time during playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && player) {
      interval = setInterval(() => {
        setCurrentTime(player.currentTime);
        
        // Check if playback finished
        if (player.currentTime >= voiceNote.duration) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, player, voiceNote.duration]);

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const stop = () => {
    player.pause();
    player.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];

    player.playbackRate = newSpeed;
    setPlaybackSpeed(newSpeed);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    if (voiceNote.duration === 0) return 0;
    return (currentTime / voiceNote.duration) * 100;
  };

  return (
    <View className="bg-surface border border-border rounded-lg p-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">🎤</Text>
          <Text className="text-sm font-medium text-foreground">Voice Note</Text>
        </View>
        {onDelete && (
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text className="text-lg">🗑️</Text>
          </Pressable>
        )}
      </View>

      {/* Progress Bar */}
      <View className="mb-3">
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-muted">{formatTime(currentTime)}</Text>
          <Text className="text-xs text-muted">{formatTime(voiceNote.duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-between">
        {/* Play/Pause Button */}
        <Pressable
          onPress={togglePlayPause}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
          className="bg-primary px-4 py-2 rounded-lg flex-1 mr-2"
        >
          <Text className="text-white text-center font-semibold">
            {isPlaying ? "⏸ Pause" : "▶️ Play"}
          </Text>
        </Pressable>

        {/* Stop Button */}
        <Pressable
          onPress={stop}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
          className="bg-background border border-border px-4 py-2 rounded-lg mr-2"
        >
          <Text className="text-foreground text-center font-semibold">⏹</Text>
        </Pressable>

        {/* Speed Button */}
        <Pressable
          onPress={changeSpeed}
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
          className="bg-background border border-border px-3 py-2 rounded-lg"
        >
          <Text className="text-foreground text-center font-semibold text-sm">
            {playbackSpeed}x
          </Text>
        </Pressable>
      </View>

      {/* Recording Info */}
      <View className="mt-2 pt-2 border-t border-border">
        <Text className="text-xs text-muted text-center">
          Recorded {new Date(voiceNote.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
