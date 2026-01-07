import { useState, useEffect } from 'react';
import { ActiveLayer, EvidenceType, VerificationStatus } from './types';
import type { EvidenceItem } from './types';
import { Layout } from './components/shared/Layout';
import { Dashboard } from './components/views/Dashboard';
import { SpineView } from './components/views/SpineView';
import { TimelineView } from './components/views/TimelineView';

// Mock data for initial testing
const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: '1',
    type: EvidenceType.INCIDENT,
    sender: 'Observation',
    content: 'The mother refused to allow visitation despite the signed agreement.',
    timestamp: '2025-12-15T15:00:00Z',
    hash: '4d8a1f32b5e9c7421a8d9e3f65b2c8d4a1f7e9b6c3d5a8e2f4b7c9d1e6a3f5b8',
    verified: true,
    verificationStatus: VerificationStatus.VERIFIED,
    isInTimeline: true,
    exhibitCode: 'Ex-A-01',
    lane: 'CUSTODY',
    tags: ['VISITATION', 'REFUSAL'],
  },
  {
    id: '2',
    type: EvidenceType.DOCUMENT,
    sender: 'Vehicle Report',
    content: 'Vehicle failure during custody exchange in Montgomery County.',
    timestamp: '2025-12-17T10:00:00Z',
    hash: '9e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    verified: true,
    verificationStatus: VerificationStatus.PENDING,
    isInTimeline: true,
    exhibitCode: 'Ex-C-04',
    lane: 'PROCEDURAL',
    tags: ['LOGISTICS', 'TRANSPORT'],
  },
  {
    id: '3',
    type: EvidenceType.COMMUNICATION,
    sender: 'Text Message - Wife',
    content: 'Wife blocked Sunday call with children as documented in call logs.',
    timestamp: '2024-12-15T19:30:00Z',
    hash: 'b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    verified: false,
    verificationStatus: VerificationStatus.PENDING,
    isInTimeline: false,
    exhibitCode: 'CUST-002',
    lane: 'COMMUNICATION',
    tags: ['BLOCKED CALL', 'INTERFERENCE'],
  },
  {
    id: '4',
    type: EvidenceType.INCIDENT,
    sender: 'Observation - Children',
    content: 'Children mentioned baby sister during visit. Statement recorded with neutral tone.',
    timestamp: '2024-06-01T14:00:00Z',
    hash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5',
    verified: false,
    verificationStatus: VerificationStatus.UNVERIFIED,
    isInTimeline: false,
    lane: 'CUSTODY',
    tags: ['CHILDREN', 'DISCLOSURE'],
  },
];

export default function App() {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>(ActiveLayer.DASHBOARD);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(MOCK_EVIDENCE);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    console.log('CaseCraft Unified - Initialized');
    console.log('Evidence items:', evidence.length);
  }, [evidence]);

  const toggleTimeline = (id: string) => {
    setEvidence(prev => prev.map(item =>
      item.id === id ? { ...item, isInTimeline: !item.isInTimeline } : item
    ));
  };

  const updateEvidence = (updated: EvidenceItem) => {
    setEvidence(prev => prev.map(item =>
      item.id === updated.id ? updated : item
    ));
  };

  const renderContent = () => {
    switch (activeLayer) {
      case ActiveLayer.DASHBOARD:
        return <Dashboard evidence={evidence} />;
      case ActiveLayer.SPINE:
        return (
          <SpineView
            evidence={evidence}
            onToggleTimeline={toggleTimeline}
            onUpdateEvidence={updateEvidence}
          />
        );
      case ActiveLayer.TIMELINE:
        return (
          <TimelineView
            evidence={evidence.filter(e => e.isInTimeline)}
            onUpdateEvidence={updateEvidence}
          />
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">{activeLayer}</h2>
            <p className="text-gray-600 mt-2">View under construction</p>
          </div>
        );
    }
  };

  return (
    <Layout
      activeLayer={activeLayer}
      setActiveLayer={setActiveLayer}
      isSidebarOpen={isSidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onImport={() => console.log('Import clicked')}
      onExport={() => console.log('Export clicked')}
      onPrint={() => window.print()}
    >
      {renderContent()}
    </Layout>
  );
}
