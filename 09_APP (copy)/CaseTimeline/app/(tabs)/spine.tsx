import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { SpineViewer } from '@/components/spine/SpineViewer';
import { PromoteToTimeline } from '@/components/spine/PromoteToTimeline';
import { SpineItem } from '@/types/spine';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';

export default function SpineScreen() {
  const colors = useColors();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SpineItem[]>([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const handleSelectItems = (items: SpineItem[]) => {
    setSelectedItems(items);
    if (items.length > 0) {
      setSelectionMode(true);
    } else {
      setSelectionMode(false);
    }
  };

  const handleCreateEvent = () => {
    if (selectedItems.length > 0) {
      setShowPromoteModal(true);
    }
  };

  const handlePromoteSuccess = () => {
    setSelectedItems([]);
    setSelectionMode(false);
    setShowPromoteModal(false);
  };

  return (
    <ScreenContainer>
      <SpineViewer
        onSelectItems={handleSelectItems}
        selectionMode={selectionMode}
      />
      
      {/* Selection Mode Bar */}
      {selectionMode && (
        <View
          className="absolute bottom-0 left-0 right-0 p-4 border-t flex-row justify-between items-center"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectedItems([]);
              setSelectionMode(false);
            }}
            className="px-4 py-2"
          >
            <Text style={{ color: colors.text }}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={{ color: colors.text }}>
            {selectedItems.length} selected
          </Text>
          
          <TouchableOpacity
            onPress={handleCreateEvent}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.tint }}
            disabled={selectedItems.length === 0}
          >
            <Text className="text-white font-semibold">Create Event</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Promote Modal */}
      <PromoteToTimeline
        visible={showPromoteModal}
        selectedItems={selectedItems}
        onClose={() => setShowPromoteModal(false)}
        onSuccess={handlePromoteSuccess}
      />
    </ScreenContainer>
  );
}

