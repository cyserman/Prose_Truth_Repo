/**
 * Dry-Run Validation Script
 * 
 * Validates that the system can rebuild from files:
 * 1. Import CSV → save to database
 * 2. Export database state to JSON
 * 3. Delete database
 * 4. Re-import CSV
 * 5. Export database state to JSON again
 * 6. Compare: should be identical
 * 
 * Usage:
 *   tsx scripts/dry-run-validation.ts <path-to-csv-file>
 */

import * as fs from 'fs';
import * as path from 'path';
import { importAppCloseCSV } from '../lib/csv-parser';
import { db, bulkInsertSpineItems, clearAllData } from '../lib/spine-db';

async function main() {
  const csvPath = process.argv[2];
  
  if (!csvPath) {
    console.error('Usage: tsx scripts/dry-run-validation.ts <path-to-csv-file>');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log('🧪 Starting Dry-Run Validation...\n');
  console.log(`📁 CSV File: ${csvPath}\n`);

  try {
    // Step 1: Read CSV file
    console.log('Step 1: Reading CSV file...');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const filename = path.basename(csvPath);
    console.log(`✅ Read ${csvContent.length} characters\n`);

    // Step 2: Parse CSV
    console.log('Step 2: Parsing CSV...');
    const parseResult = await importAppCloseCSV(csvContent, filename);
    console.log(`✅ Parsed ${parseResult.spine_items.length} messages`);
    console.log(`   Source File ID: ${parseResult.source_file.id}`);
    console.log(`   File Hash: ${parseResult.source_file.file_hash.substring(0, 16)}...\n`);

    // Step 3: Import to database (first time)
    console.log('Step 3: Importing to database (first time)...');
    await clearAllData();
    await db.sources.add(parseResult.source_file);
    const insertResult1 = await bulkInsertSpineItems(
      parseResult.spine_items,
      parseResult.source_file.id
    );
    console.log(`✅ Imported ${insertResult1.inserted} messages`);
    console.log(`   Skipped ${insertResult1.skipped} duplicates\n`);

    // Step 4: Export database state (first export)
    console.log('Step 4: Exporting database state (first export)...');
    const spineItems1 = await db.spine.orderBy('timestamp').toArray();
    const sourceFiles1 = await db.sources.toArray();
    const export1 = {
      source_files: sourceFiles1,
      spine_items: spineItems1.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        content_original: item.content_original,
        counterpart: item.counterpart,
        category: item.category,
      })),
    };
    console.log(`✅ Exported ${spineItems1.length} messages\n`);

    // Step 5: Clear database
    console.log('Step 5: Clearing database...');
    await clearAllData();
    const countAfterClear = await db.spine.count();
    console.log(`✅ Database cleared (${countAfterClear} items remaining)\n`);

    // Step 6: Re-import CSV
    console.log('Step 6: Re-importing CSV...');
    await db.sources.add(parseResult.source_file);
    const insertResult2 = await bulkInsertSpineItems(
      parseResult.spine_items,
      parseResult.source_file.id
    );
    console.log(`✅ Re-imported ${insertResult2.inserted} messages`);
    console.log(`   Skipped ${insertResult2.skipped} duplicates\n`);

    // Step 7: Export database state (second export)
    console.log('Step 7: Exporting database state (second export)...');
    const spineItems2 = await db.spine.orderBy('timestamp').toArray();
    const sourceFiles2 = await db.sources.toArray();
    const export2 = {
      source_files: sourceFiles2,
      spine_items: spineItems2.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        content_original: item.content_original,
        counterpart: item.counterpart,
        category: item.category,
      })),
    };
    console.log(`✅ Exported ${spineItems2.length} messages\n`);

    // Step 8: Compare exports
    console.log('Step 8: Comparing exports...');
    const export1Json = JSON.stringify(export1, null, 2);
    const export2Json = JSON.stringify(export2, null, 2);

    if (export1Json === export2Json) {
      console.log('✅ VALIDATION PASSED: Exports are identical\n');
      console.log('📊 Results:');
      console.log(`   Messages in export 1: ${export1.spine_items.length}`);
      console.log(`   Messages in export 2: ${export2.spine_items.length}`);
      console.log(`   Source files match: ${export1.source_files.length === export2.source_files.length}`);
      console.log('\n✅ System can rebuild from files successfully!');
      process.exit(0);
    } else {
      console.log('❌ VALIDATION FAILED: Exports differ\n');
      console.log('📊 Differences:');
      console.log(`   Messages in export 1: ${export1.spine_items.length}`);
      console.log(`   Messages in export 2: ${export2.spine_items.length}`);
      
      // Find differences
      const ids1 = new Set(export1.spine_items.map(item => item.id));
      const ids2 = new Set(export2.spine_items.map(item => item.id));
      const missingIn2 = Array.from(ids1).filter(id => !ids2.has(id));
      const extraIn2 = Array.from(ids2).filter(id => !ids1.has(id));
      
      if (missingIn2.length > 0) {
        console.log(`   Missing in export 2: ${missingIn2.length} items`);
      }
      if (extraIn2.length > 0) {
        console.log(`   Extra in export 2: ${extraIn2.length} items`);
      }
      
      console.log('\n❌ System cannot rebuild from files correctly!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Validation failed with error:');
    console.error(error);
    process.exit(1);
  }
}

main();

