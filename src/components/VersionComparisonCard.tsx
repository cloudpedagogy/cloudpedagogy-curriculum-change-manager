import React, { useState } from 'react';
import type { Version } from '../types';
import { ArrowRightLeft } from 'lucide-react';

interface VersionComparisonCardProps {
  versions: Version[];
}

export const VersionComparisonCard: React.FC<VersionComparisonCardProps> = ({ versions }) => {
  const [vAId, setVAId] = useState<string>('');
  const [vBId, setVBId] = useState<string>('');

  if (versions.length < 2) {
    return (
      <div className="cp-card cp-hide-print">
        <div className="cp-card-header">
          <h2 className="cp-card-title">Version Comparison</h2>
        </div>
        <p className="text-muted mb-0">At least two versions are required comparing structural changes.</p>
      </div>
    );
  }

  const vA = versions.find(v => v.id === vAId);
  const vB = versions.find(v => v.id === vBId);

  // Helper to extract a human readable summary from generic sourceData
  const renderSourceSummary = (v: Version) => {
    if (!v.sourceData || typeof v.sourceData !== 'object') {
      return <p className="text-small text-muted">No structured data found.</p>;
    }
    
    // Naive extraction for demo purposes based on CloudPedagogy data modes
    const extracted: Array<{label: string, value: string}> = [];
    
    // Public health demo specific check
    if (v.sourceData.assessment) extracted.push({ label: 'Assessment Mode', value: String(v.sourceData.assessment) });
    if (v.sourceData.aiUsage) extracted.push({ label: 'AI Integrity Policy', value: String(v.sourceData.aiUsage) });
    if (v.sourceData.rationale) extracted.push({ label: 'Rationale', value: String(v.sourceData.rationale) });
    
    // If not matching specific demo, dump first few keys
    if (extracted.length === 0) {
      Object.keys(v.sourceData).slice(0, 5).forEach(k => {
        if (typeof v.sourceData[k] === 'string' || typeof v.sourceData[k] === 'number') {
          extracted.push({ label: k, value: String(v.sourceData[k]) });
        }
      });
    }

    return (
      <ul style={{ paddingLeft: '20px', margin: 0 }} className="text-small">
        {extracted.map((e, idx) => (
          <li key={idx} style={{ marginBottom: '4px' }}>
            <span className="semibold">{e.label}:</span> {e.value}
          </li>
        ))}
        {extracted.length === 0 && <li>Complex nested data structure.</li>}
      </ul>
    );
  };

  return (
    <div className="cp-card cp-hide-print">
      <div className="cp-card-header">
        <h2 className="cp-card-title"><ArrowRightLeft size={20} /> Version Comparison</h2>
      </div>
      
      <div className="form-row items-center mb-lg">
        <div className="form-group mb-0">
          <label>Compare Baseline (Version A)</label>
          <select value={vAId} onChange={(e) => setVAId(e.target.value)}>
            <option value="">-- Select Version --</option>
            {versions.map(v => <option key={v.id} value={v.id}>{v.title} ({v.createdAt})</option>)}
          </select>
        </div>
        <div style={{ padding: '0 var(--spacing-sm)' }} className="text-muted mt-md">VS</div>
        <div className="form-group mb-0">
          <label>Compare Target (Version B)</label>
          <select value={vBId} onChange={(e) => setVBId(e.target.value)}>
            <option value="">-- Select Version --</option>
            {versions.map(v => <option key={v.id} value={v.id}>{v.title} ({v.createdAt})</option>)}
          </select>
        </div>
      </div>

      {vA && vB && (
        <div className="list-item-box" style={{ backgroundColor: '#fff' }}>
          <div className="form-row">
            <div style={{ flex: 1, paddingRight: 'var(--spacing-md)', borderRight: '1px solid var(--color-border-default)' }}>
              <h3 className="text-small text-muted mb-sm">VERSION A</h3>
              <p className="semibold mb-xs">{vA.title}</p>
              {renderSourceSummary(vA)}
            </div>
            <div style={{ flex: 1, paddingLeft: 'var(--spacing-md)' }}>
              <h3 className="text-small text-muted mb-sm">VERSION B</h3>
              <p className="semibold mb-xs">{vB.title}</p>
              {renderSourceSummary(vB)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
