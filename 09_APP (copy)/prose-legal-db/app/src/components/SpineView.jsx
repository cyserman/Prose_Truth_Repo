/**
 * Spine View Component
 * 
 * Captain's nav rail (chronological comm spine).
 * Private, navigational view for context reconstruction.
 */

import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { cleanText, extractFirstSentence } from '../lib/normalize';

export function SpineView() {
  const [comms, setComms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  
  useEffect(() => {
    loadComms();
  }, []);
  
  const loadComms = async () => {
    try {
      setLoading(true);
      const allComms = await db.comms.orderBy('timestamp').toArray();
      setComms(allComms);
    } catch (error) {
      console.error('Error loading comms:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredComms = comms.filter(comm => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        comm.content_original.toLowerCase().includes(query) ||
        comm.sender.toLowerCase().includes(query) ||
        comm.recipient.toLowerCase().includes(query)
      );
    }
    return true;
  });
  
  if (loading) {
    return <div className="p-4">Loading communication spine...</div>;
  }
  
  return (
    <div className="spine-view">
      <div className="spine-header p-4 border-b">
        <h2 className="text-lg font-semibold">Communication Spine</h2>
        <p className="text-sm text-gray-600 mt-1">
          Private chronological navigation ({filteredComms.length} entries)
        </p>
        
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
        </div>
      </div>
      
      <div className="spine-list max-h-[600px] overflow-y-auto">
        {filteredComms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No communications found. Import CSV files to build the spine.
          </div>
        ) : (
          filteredComms.map(comm => (
            <div
              key={comm.id}
              className="spine-item p-4 border-b hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium">
                  {comm.sender} → {comm.recipient}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(comm.timestamp).toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                {extractFirstSentence(comm.content_original, 150)}
              </div>
              
              {comm.exhibit_candidate && (
                <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Exhibit Candidate
                </span>
              )}
              
              <div className="text-xs text-gray-400 mt-2">
                {comm.comm_id} • {comm.source_file}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

