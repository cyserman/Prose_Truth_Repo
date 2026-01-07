/**
 * Intake Queue Component
 * 
 * 06_SCANS/INBOX workflow mirror.
 * Shows pending scans and allows processing.
 */

import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { importAppCloseCSV } from '../lib/importers/appcloseImporter';
import { buildCommSpine, saveCommSpine } from '../lib/spine/commSpineBuilder';

export function IntakeQueue() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  
  useEffect(() => {
    loadScans();
  }, []);
  
  const loadScans = async () => {
    try {
      setLoading(true);
      const allScans = await db.scans.orderBy('imported_at').reverse().toArray();
      setScans(allScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImporting(true);
      
      // Import AppClose CSV
      const entries = await importAppCloseCSV(file);
      
      // Build comm spine
      const spineEntries = await buildCommSpine(entries, file.name);
      
      // Save to database
      await saveCommSpine(spineEntries);
      
      alert(`Imported ${spineEntries.length} communication entries`);
      await loadScans();
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset file input
    }
  };
  
  if (loading) {
    return <div className="p-4">Loading intake queue...</div>;
  }
  
  return (
    <div className="intake-queue">
      <div className="intake-header p-4 border-b">
        <h2 className="text-lg font-semibold">Intake Queue</h2>
        <p className="text-sm text-gray-600 mt-1">
          Process files from 06_SCANS/INBOX
        </p>
        
        <div className="mt-4">
          <label className="block mb-2 text-sm font-medium">
            Import AppClose CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            disabled={importing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {importing && <div className="mt-2 text-sm text-gray-600">Importing...</div>}
        </div>
      </div>
      
      <div className="scans-list">
        {scans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No scans imported yet. Upload CSV files to begin.
          </div>
        ) : (
          scans.map(scan => (
            <div key={scan.id} className="scan-item p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{scan.filename}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Imported: {new Date(scan.imported_at).toLocaleString()}
                  </div>
                  {scan.date_range_start && (
                    <div className="text-xs text-gray-500 mt-1">
                      Date range: {scan.date_range_start} to {scan.date_range_end || 'present'}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {scan.scan_id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

