/**
 * Export Panel Component
 * 
 * Export bundles (CSV, JSON, ZIP)
 */

import { useState } from 'react';
import { downloadText, downloadTruthRepoBundle } from '../lib/exports';
import { exportExhibitsIndex, exportCommSpine, exportTimeline, exportDatabaseJSON } from '../lib/exports';

export function ExportPanel() {
  const [exporting, setExporting] = useState(false);
  
  const handleExportCSV = async (type: string) => {
    try {
      setExporting(true);
      let csv: string;
      let filename: string;
      
      switch (type) {
        case 'exhibits':
          csv = await exportExhibitsIndex();
          filename = 'exhibits_index.csv';
          break;
        case 'spine':
          csv = await exportCommSpine();
          filename = 'comm_spine.csv';
          break;
        case 'timeline':
          csv = await exportTimeline();
          filename = 'master_timeline.csv';
          break;
        default:
          throw new Error('Unknown export type');
      }
      
      downloadText(filename, csv);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const json = await exportDatabaseJSON();
      downloadText('database_dump.json', json);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportBundle = async () => {
    try {
      setExporting(true);
      await downloadTruthRepoBundle();
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="export-panel p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Export Data</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => handleExportCSV('exhibits')}
          disabled={exporting}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Export Exhibits Index (CSV)
        </button>
        
        <button
          onClick={() => handleExportCSV('spine')}
          disabled={exporting}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Export Comm Spine (CSV)
        </button>
        
        <button
          onClick={() => handleExportCSV('timeline')}
          disabled={exporting}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Export Timeline (CSV)
        </button>
        
        <button
          onClick={handleExportJSON}
          disabled={exporting}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Export Database (JSON)
        </button>
        
        <button
          onClick={handleExportBundle}
          disabled={exporting}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 font-semibold"
        >
          Export Truth Repo Bundle (ZIP)
        </button>
      </div>
      
      {exporting && (
        <div className="mt-4 text-sm text-gray-600">Exporting...</div>
      )}
    </div>
  );
}

