import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { importAppCloseCSV } from '@/lib/csv-parser';
import { db, sourceFileExists, bulkInsertSpineItems } from '@/lib/spine-db';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

export default function ImportScreen() {
  const colors = useColors();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    messagesImported: number;
    duplicatesSkipped: number;
    errors: string[];
    sourceFileId?: string;
  } | null>(null);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportResult(null);

      let content: string;
      let filename: string;

      if (Platform.OS === 'web') {
        // For web, use HTML file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,text/csv';
        
        const file = await new Promise<File>((resolve, reject) => {
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              resolve(file);
            } else {
              reject(new Error('No file selected'));
            }
          };
          input.oncancel = () => reject(new Error('File selection canceled'));
          input.click();
        });

        filename = file.name;
        
        // Read file using FileReader
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else {
        // For native platforms, use DocumentPicker
        const result = await DocumentPicker.getDocumentAsync({
          type: 'text/csv',
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          setIsImporting(false);
          return;
        }

        const file = result.assets[0];
        filename = file.name;

        // Read file content using expo-file-system
        content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: 'utf8',
        });
      }

      // Parse and import
      const parseResult = await importAppCloseCSV(content, filename);

      if (!parseResult.success) {
        setImportResult({
          success: false,
          messagesImported: 0,
          duplicatesSkipped: 0,
          errors: parseResult.errors,
        });
        setIsImporting(false);
        return;
      }

      // Check if source file already exists
      const exists = await sourceFileExists(parseResult.source_file.file_hash);
      if (exists) {
        Alert.alert(
          'File Already Imported',
          'This file has already been imported. Re-importing will skip duplicate messages.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: async () => {
                await performImport(parseResult);
              },
            },
          ]
        );
        setIsImporting(false);
        return;
      }

      await performImport(parseResult);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        messagesImported: 0,
        duplicatesSkipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
      setIsImporting(false);
    }
  };

  const performImport = async (parseResult: Awaited<ReturnType<typeof importAppCloseCSV>>) => {
    try {
      setIsImporting(true);

      // Save source file to database
      await db.sources.add(parseResult.source_file);

      // Bulk insert spine items with duplicate checking
      const insertResult = await bulkInsertSpineItems(
        parseResult.spine_items,
        parseResult.source_file.id
      );

      setImportResult({
        success: true,
        messagesImported: insertResult.inserted,
        duplicatesSkipped: insertResult.skipped,
        errors: [],
        sourceFileId: parseResult.source_file.id,
      });
    } catch (error) {
      console.error('Database insert error:', error);
      setImportResult({
        success: false,
        messagesImported: 0,
        duplicatesSkipped: 0,
        errors: [error instanceof Error ? error.message : 'Database error'],
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Import Text Logs
          </Text>
          <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            Import CSV files from AppClose or other sources. Files are hash-fingerprinted to prevent duplicates.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleImport}
          disabled={isImporting}
          className="bg-blue-500 rounded-lg p-4 items-center mb-4"
          style={{
            backgroundColor: isImporting ? colors.border : colors.tint,
            opacity: isImporting ? 0.6 : 1,
          }}
        >
          {isImporting ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-semibold">Importing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">Select CSV File</Text>
          )}
        </TouchableOpacity>

        {importResult && (
          <View
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: importResult.success ? '#10B981' : '#EF4444',
            }}
          >
            <Text className="text-white font-semibold text-lg mb-2">
              {importResult.success ? 'Import Successful' : 'Import Failed'}
            </Text>

            {importResult.success && (
              <View className="mb-2">
                <Text className="text-white">
                  Messages imported: {importResult.messagesImported}
                </Text>
                {importResult.duplicatesSkipped > 0 && (
                  <Text className="text-white">
                    Duplicates skipped: {importResult.duplicatesSkipped}
                  </Text>
                )}
              </View>
            )}

            {importResult.errors.length > 0 && (
              <View className="mt-2">
                <Text className="text-white font-semibold mb-1">Errors:</Text>
                {importResult.errors.map((error, index) => (
                  <Text key={index} className="text-white text-sm">
                    • {error}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colors.card }}>
          <Text className="font-semibold mb-2" style={{ color: colors.text }}>
            Import Instructions
          </Text>
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
            1. Export your text messages/conversations as CSV
          </Text>
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
            2. Ensure CSV has columns: Date, Time, Sender, Recipient, Message, Platform
          </Text>
          <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
            3. Tap "Select CSV File" and choose your file
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            4. Wait for import to complete (may take a few seconds for large files)
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

