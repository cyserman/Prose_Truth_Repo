import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, searchSpineItems, getSpineItemsByDateRange, getSpineItemsByCounterpart } from '@/lib/spine-db';
import { SpineItem, MessageCategory } from '@/types/spine';
import { useColors } from '@/hooks/use-colors';
import { format } from 'date-fns';

interface SpineViewerProps {
  onSelectItems?: (items: SpineItem[]) => void;
  selectionMode?: boolean;
}

export function SpineViewer({ onSelectItems, selectionMode = false }: SpineViewerProps) {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterCounterpart, setFilterCounterpart] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<MessageCategory | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState<string | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get all spine items (will be filtered)
  const allItems = useLiveQuery(() => db.spine.orderBy('timestamp').toArray(), []);

  // Filter spine items based on search and filters
  const filteredItems = React.useMemo(() => {
    if (!allItems) return [];

    let items = [...allItems];

    // Search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.content_original.toLowerCase().includes(lowerQuery) ||
          item.sender.toLowerCase().includes(lowerQuery) ||
          item.recipient.toLowerCase().includes(lowerQuery) ||
          item.counterpart.toLowerCase().includes(lowerQuery)
      );
    }

    // Counterpart filter
    if (filterCounterpart) {
      items = items.filter(item => item.counterpart === filterCounterpart);
    }

    // Category filter
    if (filterCategory) {
      items = items.filter(item => item.category === filterCategory);
    }

    // Date range filter
    if (dateRangeStart) {
      items = items.filter(item => item.timestamp >= dateRangeStart);
    }
    if (dateRangeEnd) {
      items = items.filter(item => item.timestamp <= dateRangeEnd);
    }

    return items;
  }, [allItems, searchQuery, filterCounterpart, filterCategory, dateRangeStart, dateRangeEnd]);

  // Get unique counterparts for filter
  const counterparts = React.useMemo(() => {
    if (!allItems) return [];
    const unique = new Set(allItems.map(item => item.counterpart));
    return Array.from(unique).sort();
  }, [allItems]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Force re-query
    await db.spine.toArray();
    setIsRefreshing(false);
  }, []);

  const toggleSelection = (itemId: string) => {
    if (!selectionMode) return;

    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);

    if (onSelectItems) {
      const selected = filteredItems.filter(item => newSelection.has(item.id));
      onSelectItems(selected);
    }
  };

  const renderItem = ({ item }: { item: SpineItem }) => {
    const isSelected = selectedItems.has(item.id);
    const date = new Date(item.timestamp);
    const categoryColors: Record<MessageCategory, string> = {
      [MessageCategory.ACCESS_DENIED]: '#EF4444',
      [MessageCategory.FINANCIAL_STRAIN]: '#F59E0B',
      [MessageCategory.HOT_READ_REACTIVE]: '#EC4899',
      [MessageCategory.SCHEDULE_CHANGE]: '#3B82F6',
      [MessageCategory.EMERGENCY]: '#EF4444',
      [MessageCategory.LEGAL_THREAT]: '#8B5CF6',
      [MessageCategory.DOCUMENT_REQUEST]: '#10B981',
      [MessageCategory.COMMUNICATION]: '#6B7280',
      [MessageCategory.OTHER]: '#9CA3AF',
    };

    return (
      <TouchableOpacity
        onPress={() => toggleSelection(item.id)}
        onLongPress={() => toggleSelection(item.id)}
        className="p-4 mb-2 rounded-lg border"
        style={{
          backgroundColor: isSelected ? colors.tint + '20' : colors.card,
          borderColor: isSelected ? colors.tint : colors.border,
          borderWidth: isSelected ? 2 : 1,
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
              {format(date, 'MMM d, yyyy h:mm a')}
            </Text>
            <Text className="font-semibold" style={{ color: colors.text }}>
              {item.direction === 'inbound' ? '←' : '→'} {item.counterpart}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <View
              className="px-2 py-1 rounded"
              style={{ backgroundColor: categoryColors[item.category] + '20' }}
            >
              <Text className="text-xs" style={{ color: categoryColors[item.category] }}>
                {item.category.replace('_', ' ')}
              </Text>
            </View>
            {item.is_call && (
              <View className="px-2 py-1 rounded bg-blue-100">
                <Text className="text-xs text-blue-600">Call</Text>
              </View>
            )}
          </View>
        </View>
        <Text
          className="text-sm"
          style={{ color: colors.text }}
          numberOfLines={3}
        >
          {item.content_original}
        </Text>
        {item.is_call && item.call_duration && (
          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
            Duration: {Math.floor(item.call_duration / 60)}m {item.call_duration % 60}s
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!allItems) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text className="mt-4" style={{ color: colors.textSecondary }}>
          Loading spine items...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Search and Filters */}
      <View className="p-4 border-b" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <TextInput
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="p-3 rounded-lg mb-3"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          placeholderTextColor={colors.textSecondary}
        />

        {/* Counterpart Filter */}
        {counterparts.length > 0 && (
          <View className="mb-2">
            <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
              Counterpart:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                onPress={() => setFilterCounterpart(null)}
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: filterCounterpart === null ? colors.tint : colors.background,
                }}
              >
                <Text
                  className="text-xs"
                  style={{
                    color: filterCounterpart === null ? 'white' : colors.text,
                  }}
                >
                  All
                </Text>
              </TouchableOpacity>
              {counterparts.slice(0, 5).map(counterpart => (
                <TouchableOpacity
                  key={counterpart}
                  onPress={() => setFilterCounterpart(counterpart)}
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: filterCounterpart === counterpart ? colors.tint : colors.background,
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color: filterCounterpart === counterpart ? 'white' : colors.text,
                    }}
                  >
                    {counterpart}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Category Filter */}
        <View>
          <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
            Category:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              onPress={() => setFilterCategory(null)}
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: filterCategory === null ? colors.tint : colors.background,
              }}
            >
              <Text
                className="text-xs"
                style={{
                  color: filterCategory === null ? 'white' : colors.text,
                }}
              >
                All
              </Text>
            </TouchableOpacity>
            {Object.values(MessageCategory).slice(0, 5).map(category => (
              <TouchableOpacity
                key={category}
                onPress={() => setFilterCategory(category)}
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: filterCategory === category ? colors.tint : colors.background,
                }}
              >
                <Text
                  className="text-xs"
                  style={{
                    color: filterCategory === category ? 'white' : colors.text,
                  }}
                >
                  {category.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Results Count */}
      <View className="px-4 py-2 border-b" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {filteredItems.length} message{filteredItems.length !== 1 ? 's' : ''}
          {allItems.length !== filteredItems.length && ` of ${allItems.length} total`}
        </Text>
      </View>

      {/* Spine Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.tint} />
        }
        contentContainerStyle={{ padding: 16 }}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate item height
          offset: 120 * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-lg mb-2" style={{ color: colors.text }}>
              No messages found
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {allItems.length === 0
                ? 'Import a CSV file to get started'
                : 'Try adjusting your filters'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

