/**
 * Case Store
 * 
 * App state + persistence keys using React hooks.
 * Manages case-level state and UI preferences.
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { CASE_INFO } from '../constants/anchors';

const LS_KEY = 'PROSE_LEGAL_DB_V3';

/**
 * Safe JSON parse with fallback
 */
function safeJsonParse(str: string, fallback: any): any {
  try {
    const v = JSON.parse(str);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Case store hook
 */
export function useCaseStore() {
  // Case metadata
  const [caseName, setCaseName] = useState(CASE_INFO.name);
  const [court, setCourt] = useState(CASE_INFO.jurisdiction);
  const [matter, setMatter] = useState(CASE_INFO.matter);
  
  // UI state
  const [printMode, setPrintMode] = useState(false);
  const [printPolicy, setPrintPolicy] = useState('original'); // 'original' | 'neutral'
  
  // Database state
  const [dbReady, setDbReady] = useState(false);
  const [stats, setStats] = useState({
    scans: 0,
    comms: 0,
    events: 0,
    exhibits: 0,
  });
  
  // Initialize database
  useEffect(() => {
    db.open()
      .then(() => {
        setDbReady(true);
        loadStats();
      })
      .catch(err => {
        console.error('Database initialization error:', err);
      });
  }, []);
  
  // Load stats from database
  const loadStats = useCallback(async () => {
    if (!dbReady) return;
    
    try {
      const [scans, comms, events, exhibits] = await Promise.all([
        db.scans.count(),
        db.comms.count(),
        db.timeline_events.count(),
        db.exhibits.count(),
      ]);
      
      setStats({ scans, comms, events, exhibits });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [dbReady]);
  
  // Refresh stats
  useEffect(() => {
    if (dbReady) {
      loadStats();
    }
  }, [dbReady, loadStats]);
  
  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const data = safeJsonParse(saved, {});
      if (data.caseName) setCaseName(data.caseName);
      if (data.court) setCourt(data.court);
      if (data.matter) setMatter(data.matter);
      if (data.printPolicy) setPrintPolicy(data.printPolicy);
    }
  }, []);
  
  // Save to localStorage
  useEffect(() => {
    const data = {
      caseName,
      court,
      matter,
      printPolicy,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [caseName, court, matter, printPolicy]);
  
  return {
    // Case metadata
    caseName,
    setCaseName,
    court,
    setCourt,
    matter,
    setMatter,
    
    // UI state
    printMode,
    setPrintMode,
    printPolicy,
    setPrintPolicy,
    
    // Database state
    dbReady,
    stats,
    refreshStats: loadStats,
  };
}

