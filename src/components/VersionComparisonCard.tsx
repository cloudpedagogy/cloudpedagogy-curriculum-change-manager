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
        <p className="text-muted mb-0">
          At least two versions are required in this proposal to compare structural changes side-by-side.
        </p>
      </div>
    );
  }

  const vA = versions.find((v) => v.id === vAId) || (versions.length >= 2 ? versions[0] : undefined);
  const vB = versions.find((v) => v.id === vBId) || (versions.length >= 2 ? versions[1] : undefined);

  // Generic and resilient source data summary extractor
  const renderSourceSummary = (v: Version) => {
    if (!v.sourceData || typeof v.sourceData !== 'object' || Object.keys(v.sourceData).length === 0) {
      return (
        <div className="text-small text-muted">
          <p className="mb-xs"><em>No structured snapshot data attached.</em></p>
          {v.notes && <p className="mb-0"><strong>Notes:</strong> {v.notes}</p>}
        </div>
      );
    }

    const extracted: Array<{ label: string; value: string }> = [];
    const data = v.sourceData;

    // Check common educational snapshot keys flexibly
    const keyMap: Record<string, string> = {
      assessmentMode: 'Assessment Mode',
      assessment: 'Assessment Mode',
      weighting: 'Weighting',
      aiUsage: 'AI Integrity Policy',
      aiPolicy: 'AI Policy',
      rationale: 'Educational Rationale',
      codebasePortfolio: 'Code Portfolio',
      collaborativePipeline: 'Collaborative Pipeline',
      oralViva: 'Oral Viva',
      examWeight: 'Exam Weighting',
      courseworkWeight: 'Coursework Weighting',
    };

    Object.keys(data).forEach((k) => {
      const label = keyMap[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      const val = data[k];
      if (typeof val === 'string' || typeof val === 'number') {
        extracted.push({ label, value: String(val) });
      } else if (Array.isArray(val)) {
        extracted.push({ label, value: val.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join('; ') });
      }
    });

    return (
      <div>
        <ul style={{ paddingLeft: '18px', margin: 0 }} className="text-small">
          {extracted.map((e, idx) => (
            <li key={idx} style={{ marginBottom: '6px' }}>
              <span className="semibold">{e.label}:</span> {e.value}
            </li>
          ))}
          {extracted.length === 0 && <li>Complex nested data structure.</li>}
        </ul>
        {v.notes && (
          <p className="text-small text-muted mt-sm mb-0">
            <strong>Notes:</strong> {v.notes}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="cp-card cp-hide-print">
      <div className="cp-card-header">
        <h2 className="cp-card-title">
          <ArrowRightLeft size={20} /> Version Comparison
        </h2>
        <span className="text-small text-muted">Select any two snapshots to compare side-by-side</span>
      </div>

      <div className="form-row items-center mb-lg">
        <div className="form-group mb-0">
          <label htmlFor="compare-baseline-select">Compare Baseline (Version A)</label>
          <select
            id="compare-baseline-select"
            value={vA?.id || ''}
            onChange={(e) => setVAId(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.createdAt}) [{v.sourceType}]
              </option>
            ))}
          </select>
        </div>
        <div style={{ padding: '0 var(--spacing-sm)' }} className="text-muted mt-md semibold">
          VS
        </div>
        <div className="form-group mb-0">
          <label htmlFor="compare-target-select">Compare Target (Version B)</label>
          <select
            id="compare-target-select"
            value={vB?.id || ''}
            onChange={(e) => setVBId(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.createdAt}) [{v.sourceType}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {vA && vB && (
        <div className="list-item-box" style={{ backgroundColor: '#fff' }}>
          <div className="form-row">
            <div
              style={{
                flex: 1,
                paddingRight: 'var(--spacing-md)',
                borderRight: '1px solid var(--color-border-default)',
              }}
            >
              <div className="flex items-center gap-xs mb-xs">
                <span className="badge">BASELINE (A)</span>
                <span className="text-small text-muted">{vA.sourceType}</span>
              </div>
              <h3 className="semibold mb-xs" style={{ fontSize: '1rem' }}>{vA.title}</h3>
              <p className="text-small text-muted mb-sm">{vA.description} &middot; {vA.createdAt}</p>
              {renderSourceSummary(vA)}
            </div>
            <div style={{ flex: 1, paddingLeft: 'var(--spacing-md)' }}>
              <div className="flex items-center gap-xs mb-xs">
                <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  TARGET (B)
                </span>
                <span className="text-small text-muted">{vB.sourceType}</span>
              </div>
              <h3 className="semibold mb-xs" style={{ fontSize: '1rem' }}>{vB.title}</h3>
              <p className="text-small text-muted mb-sm">{vB.description} &middot; {vB.createdAt}</p>
              {renderSourceSummary(vB)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
