import React, { useState, useMemo } from 'react';
import type { Version } from '../types';
import {
  ArrowRightLeft,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { diffCurriculumSnapshots, type DiffType } from '../utils/comparison';

interface VersionComparisonCardProps {
  versions: Version[];
}

export const VersionComparisonCard: React.FC<VersionComparisonCardProps> = ({ versions }) => {
  const [vAId, setVAId] = useState<string>('');
  const [vBId, setVBId] = useState<string>('');
  const [filterType, setFilterType] = useState<DiffType | 'all'>('all');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  // Pick baseline and target versions
  const vA = versions.find((v) => v.id === vAId) || versions[0];
  const vB = versions.find((v) => v.id === vBId) || versions[1] || versions[0];

  // Compute generic deep comparison without mutation
  const comparison = useMemo(() => {
    if (!vA || !vB || versions.length < 2) return null;
    return diffCurriculumSnapshots(vA.sourceData, vB.sourceData, {
      baselineId: vA.id,
      targetId: vB.id,
    });
  }, [vA, vB, versions.length]);

  const filteredChanges = useMemo(() => {
    if (!comparison) return [];
    if (filterType === 'all') return comparison.changes;
    return comparison.changes.filter((c) => c.type === filterType);
  }, [comparison, filterType]);

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  if (versions.length < 2) {
    return (
      <div className="cp-card cp-hide-print" data-testid="version-comparison-card">
        <div className="cp-card-header">
          <h2 className="cp-card-title flex items-center gap-xs">
            <ArrowRightLeft size={20} /> Version Comparison
          </h2>
        </div>
        <p className="text-muted mb-0">
          At least two curriculum version snapshots are required in this proposal to perform structural comparison.
        </p>
      </div>
    );
  }


  return (
    <div className="cp-card cp-hide-print" data-testid="version-comparison-card">
      <div className="cp-card-header">
        <div>
          <h2 className="cp-card-title flex items-center gap-xs">
            <ArrowRightLeft size={20} /> Curriculum Snapshot Comparison
          </h2>
          <p className="text-small text-muted mb-0">
            Generic structural comparison between any two version snapshots. Detects additions, removals, and modifications without treating key ordering as differences.
          </p>
        </div>
      </div>

      {/* Selector controls */}
      <div className="form-row items-center mb-lg">
        <div className="form-group mb-0">
          <label htmlFor="compare-baseline-select" style={{ fontWeight: 600 }}>
            Baseline Version (A):
          </label>
          <select
            id="compare-baseline-select"
            className="cp-input"
            value={vA.id}
            onChange={(e) => setVAId(e.target.value)}
            data-testid="select-compare-a"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({new Date(v.createdAt).toLocaleDateString()}) [{v.sourceType}]
              </option>
            ))}
          </select>
        </div>

        <div
          style={{ padding: '0 var(--spacing-sm)', textAlign: 'center' }}
          className="text-muted mt-md semibold"
        >
          COMPARED WITH
        </div>

        <div className="form-group mb-0">
          <label htmlFor="compare-target-select" style={{ fontWeight: 600 }}>
            Target Version (B):
          </label>
          <select
            id="compare-target-select"
            className="cp-input"
            value={vB.id}
            onChange={(e) => setVBId(e.target.value)}
            data-testid="select-compare-b"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({new Date(v.createdAt).toLocaleDateString()}) [{v.sourceType}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Snapshot Header summary */}
      <div className="grid grid-2 gap-md mb-md">
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: 'var(--spacing-md)',
          }}
        >
          <div className="flex items-center gap-xs mb-xs">
            <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
              BASELINE (A)
            </span>
            <span className="text-small text-muted">{vA.sourceType}</span>
          </div>
          <h3 className="semibold mb-xs" style={{ fontSize: '1rem', margin: 0 }}>
            {vA.title}
          </h3>
          <p className="text-small text-muted mb-0">
            {vA.description || 'No description provided.'} &middot; {new Date(vA.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            padding: 'var(--spacing-md)',
          }}
        >
          <div className="flex items-center gap-xs mb-xs">
            <span className="badge" style={{ backgroundColor: '#bae6fd', color: '#0369a1' }}>
              TARGET (B)
            </span>
            <span className="text-small text-muted">{vB.sourceType}</span>
          </div>
          <h3 className="semibold mb-xs" style={{ fontSize: '1rem', margin: 0 }}>
            {vB.title}
          </h3>
          <p className="text-small text-muted mb-0">
            {vB.description || 'No description provided.'} &middot; {new Date(vB.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Comparison Metrics Bar */}
      {comparison && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            marginBottom: 'var(--spacing-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
          data-testid="comparison-metrics-bar"
        >
          <div className="flex items-center gap-sm">
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Diff Summary:</span>
            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }} data-testid="summary-total-changes">
              {comparison.summary.totalChanges} Total Changes
            </span>
            <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }} data-testid="summary-added">
              +{comparison.summary.addedCount} Added
            </span>
            <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }} data-testid="summary-removed">
              -{comparison.summary.removedCount} Removed
            </span>
            <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }} data-testid="summary-modified">
              ~{comparison.summary.modifiedCount} Modified
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-xs" role="group" aria-label="Filter changes by type">
            {(['all', 'added', 'removed', 'modified'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: filterType === t ? '#000000' : '#cbd5e1',
                  backgroundColor: filterType === t ? '#0f172a' : '#ffffff',
                  color: filterType === t ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  fontWeight: filterType === t ? 600 : 400,
                  textTransform: 'capitalize',
                }}
                data-testid={`filter-pill-${t}`}
              >
                {t === 'all' ? 'Show All' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Changes List */}
      {comparison && comparison.changes.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '6px',
            padding: 'var(--spacing-lg)',
            textAlign: 'center',
            color: '#64748b',
          }}
          data-testid="comparison-no-changes"
        >
          <CheckCircle2 size={24} color="#15803d" style={{ marginBottom: '8px' }} />
          <p className="semibold mb-xs" style={{ color: '#1e293b' }}>
            No Structural Differences Detected
          </p>
          <p className="text-small text-muted mb-0">
            Selected snapshots contain identical curriculum properties (independent of JSON key ordering).
          </p>
        </div>
      ) : (
        <div className="flex-col gap-sm" data-testid="comparison-changes-list">
          {filteredChanges.length === 0 ? (
            <div className="text-center text-muted text-small p-md">
              No changes match the selected filter &quot;{filterType}&quot;.
            </div>
          ) : (
            filteredChanges.map((change) => {
              const isExpanded = !!expandedPaths[change.path];
              const isAdded = change.type === 'added';
              const isRemoved = change.type === 'removed';
              const isModified = change.type === 'modified';

              const badgeColor = isAdded ? '#166534' : isRemoved ? '#991b1b' : '#92400e';
              const badgeBg = isAdded ? '#dcfce7' : isRemoved ? '#fee2e2' : '#fef3c7';

              return (
                <div
                  key={change.path}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${badgeColor}`,
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                  }}
                  data-testid={`diff-item-${change.path}`}
                >
                  <div className="flex justify-between items-center flex-wrap gap-xs mb-xs">
                    <div className="flex items-center gap-xs">
                      {isAdded && <PlusCircle size={15} color="#166534" />}
                      {isRemoved && <MinusCircle size={15} color="#991b1b" />}
                      {isModified && <AlertCircle size={15} color="#92400e" />}

                      <span
                        className="badge"
                        style={{
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        {change.type}
                      </span>

                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                        {change.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-xs">
                      <span className="text-small text-muted" style={{ fontFamily: 'monospace' }}>
                        {change.path}
                      </span>
                      <button
                        type="button"
                        className="cp-button-link"
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        onClick={() => toggleExpand(change.path)}
                        title="Toggle full details"
                        data-testid={`btn-toggle-diff-${change.path}`}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Value diff row */}
                  <div className="grid grid-2 gap-sm text-small">
                    <div
                      style={{
                        backgroundColor: isRemoved || isModified ? '#fff1f2' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isRemoved || isModified ? '#fecaca' : '#e2e8f0',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        color: isRemoved ? '#991b1b' : '#334155',
                      }}
                    >
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>
                        Baseline (A):
                      </strong>
                      <div
                        style={{
                          marginTop: '2px',
                          textDecoration: isRemoved ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                        }}
                      >
                        {change.oldDisplay}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: isAdded || isModified ? '#f0fdf4' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isAdded || isModified ? '#bbf7d0' : '#e2e8f0',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        color: isAdded ? '#166534' : '#334155',
                      }}
                    >
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>
                        Target (B):
                      </strong>
                      <div style={{ marginTop: '2px', wordBreak: 'break-word' }}>
                        {change.newDisplay}
                      </div>
                    </div>
                  </div>

                  {/* Detailed expandable JSON inspection if toggled */}
                  {isExpanded && (
                    <div
                      className="mt-xs pt-xs"
                      style={{ borderTop: '1px dashed #e2e8f0', fontSize: '0.8rem' }}
                    >
                      <div className="grid grid-2 gap-sm">
                        <div>
                          <span className="text-muted">Raw Baseline:</span>
                          <pre
                            style={{
                              margin: '4px 0 0',
                              padding: '6px',
                              backgroundColor: '#f1f5f9',
                              borderRadius: '4px',
                              maxHeight: '120px',
                              overflow: 'auto',
                            }}
                          >
                            {JSON.stringify(change.oldValue, null, 2) || '(undefined)'}
                          </pre>
                        </div>
                        <div>
                          <span className="text-muted">Raw Target:</span>
                          <pre
                            style={{
                              margin: '4px 0 0',
                              padding: '6px',
                              backgroundColor: '#f1f5f9',
                              borderRadius: '4px',
                              maxHeight: '120px',
                              overflow: 'auto',
                            }}
                          >
                            {JSON.stringify(change.newValue, null, 2) || '(undefined)'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
