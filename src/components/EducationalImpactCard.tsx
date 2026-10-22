import React, { useState } from 'react';
import type {
  EducationalImpactAssessment,
  ImpactDimensionKey,
  ImpactDimension,
  ImpactLevel,
} from '../types';
import { IMPACT_DIMENSIONS } from '../utils/governance';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface EducationalImpactCardProps {
  assessment: EducationalImpactAssessment;
  onUpdateDimension: (key: ImpactDimensionKey, updates: Partial<ImpactDimension>) => void;
  onUpdateOverallNotes: (notes: string) => void;
  readOnly?: boolean;
}

const IMPACT_LEVEL_CONFIG: Record<
  ImpactLevel,
  { label: string; bg: string; color: string; border: string; desc: string }
> = {
  not_assessed: {
    label: 'Not Yet Assessed',
    bg: '#f3f4f6',
    color: '#4b5563',
    border: '#d1d5db',
    desc: 'Dimension has not yet been reviewed for educational implications.',
  },
  none: {
    label: 'None / Negligible',
    bg: '#f0fdf4',
    color: '#166534',
    border: '#bbf7d0',
    desc: 'No noticeable negative or disruptive impact on standard delivery.',
  },
  low: {
    label: 'Low Impact',
    bg: '#eff6ff',
    color: '#1e40af',
    border: '#bfdbfe',
    desc: 'Minor adjustments accommodated within normal teaching workflows.',
  },
  moderate: {
    label: 'Moderate Impact',
    bg: '#fefce8',
    color: '#854d0e',
    border: '#fef08a',
    desc: 'Noticeable changes requiring operational coordination or staff briefing.',
  },
  high: {
    label: 'High Impact',
    bg: '#fef2f2',
    color: '#991b1b',
    border: '#fecaca',
    desc: 'Significant pedagogical, resource, or structural risk requiring mitigation.',
  },
};

export const EducationalImpactCard: React.FC<EducationalImpactCardProps> = ({
  assessment,
  onUpdateDimension,
  onUpdateOverallNotes,
  readOnly = false,
}) => {
  const [activeDimensionKey, setActiveDimensionKey] = useState<ImpactDimensionKey>('learningOutcomes');
  const [expandedAll, setExpandedAll] = useState(false);

  const dimensionKeys = Object.keys(IMPACT_DIMENSIONS) as ImpactDimensionKey[];

  // Calculate summary metrics
  const assessedCount = dimensionKeys.filter(
    (k) => assessment.dimensions[k]?.impactLevel && assessment.dimensions[k].impactLevel !== 'not_assessed'
  ).length;

  const highImpactCount = dimensionKeys.filter(
    (k) => assessment.dimensions[k]?.impactLevel === 'high'
  ).length;

  const moderateImpactCount = dimensionKeys.filter(
    (k) => assessment.dimensions[k]?.impactLevel === 'moderate'
  ).length;

  const currentDimDef = IMPACT_DIMENSIONS[activeDimensionKey];
  const currentDimData = assessment.dimensions[activeDimensionKey] || {
    key: activeDimensionKey,
    title: currentDimDef?.title || '',
    impactLevel: 'not_assessed',
    rationale: '',
    evidence: '',
    mitigation: '',
  };

  const currentLevelConfig = IMPACT_LEVEL_CONFIG[currentDimData.impactLevel || 'not_assessed'];

  return (
    <div className="cp-card mb-lg" data-testid="educational-impact-card">
      <div className="flex justify-between items-start flex-wrap gap-sm mb-md">
        <div>
          <h3 className="heading-medium mb-xs flex items-center gap-xs">
            <ShieldAlert size={20} color="var(--color-primary-accent, #0056b3)" />
            Educational Impact Assessment
          </h3>
          <p className="text-small text-muted">
            Structured appraisal across six core pedagogical dimensions to support informed educational judgement.
          </p>
        </div>

        {/* Assessment Progress Overview Badge */}
        <div className="flex items-center gap-xs flex-wrap">
          <span
            className="badge"
            style={{
              backgroundColor: assessedCount === 6 ? '#dcfce7' : '#fef3c7',
              color: assessedCount === 6 ? '#166534' : '#92400e',
              border: `1px solid ${assessedCount === 6 ? '#86efac' : '#fcd34d'}`,
              fontWeight: 600,
            }}
          >
            {assessedCount === 6 ? (
              <span className="flex items-center gap-xs">
                <CheckCircle2 size={13} /> Fully Assessed (6/6)
              </span>
            ) : (
              <span className="flex items-center gap-xs">
                <AlertTriangle size={13} /> {assessedCount} of 6 Assessed
              </span>
            )}
          </span>

          {highImpactCount > 0 && (
            <span
              className="badge"
              style={{
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                fontWeight: 600,
              }}
            >
              {highImpactCount} High Impact {highImpactCount === 1 ? 'Area' : 'Areas'}
            </span>
          )}

          {moderateImpactCount > 0 && (
            <span
              className="badge"
              style={{
                backgroundColor: '#fefce8',
                color: '#854d0e',
                border: '1px solid #fef08a',
                fontWeight: 600,
              }}
            >
              {moderateImpactCount} Moderate Impact
            </span>
          )}
        </div>
      </div>

      {/* Educational Guidance Note */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-subtle, #f8fafc)',
          borderLeft: '4px solid var(--color-primary-accent, #0056b3)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: '4px',
          marginBottom: 'var(--spacing-md)',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary, #475569)',
        }}
      >
        <div className="flex items-start gap-xs">
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#0056b3' }} />
          <div>
            <strong>Educational Governance Standard:</strong> Impact ratings do not calculate an arbitrary numerical score. They inform qualitative committee reflection. Identified high or moderate impacts should describe proposed mitigations or evidence before formal submission.
          </div>
        </div>
      </div>

      {/* Focused Dimensions Tab Selector / Overview Strip */}
      <div
        className="impact-dimension-nav flex gap-xs flex-wrap mb-md"
        style={{ borderBottom: '1px solid var(--color-border-subtle, #e2e8f0)', paddingBottom: 'var(--spacing-xs)' }}
      >
        {dimensionKeys.map((key) => {
          const dimDef = IMPACT_DIMENSIONS[key];
          const dimData = assessment.dimensions[key];
          const lvl = dimData?.impactLevel || 'not_assessed';
          const cfg = IMPACT_LEVEL_CONFIG[lvl];
          const isSelected = key === activeDimensionKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveDimensionKey(key)}
              className="cp-button-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.825rem',
                backgroundColor: isSelected ? '#1e293b' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                borderColor: isSelected ? '#0f172a' : '#cbd5e1',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
              }}
              title={dimDef.title}
              data-testid={`dimension-tab-${key}`}
            >
              <span>{dimDef.title}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cfg.bg,
                  color: isSelected ? '#ffffff' : cfg.color,
                  border: isSelected ? 'none' : `1px solid ${cfg.border}`,
                  fontWeight: 600,
                }}
              >
                {cfg.label.replace(' Impact', '').replace(' / Negligible', '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Dimension Editor / Focused Card */}
      <div
        style={{
          border: `1px solid ${currentLevelConfig.border}`,
          borderRadius: '8px',
          padding: 'var(--spacing-md)',
          backgroundColor: '#ffffff',
          marginBottom: 'var(--spacing-md)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex justify-between items-start flex-wrap gap-xs mb-sm">
          <div>
            <h4 className="heading-small mb-xxs" style={{ color: '#0f172a' }}>
              {currentDimDef?.title}
            </h4>
            <p className="text-small text-muted" style={{ margin: 0 }}>
              {currentDimDef?.description}
            </p>
          </div>

          <div className="flex items-center gap-xs">
            <span
              className="badge"
              style={{
                backgroundColor: currentLevelConfig.bg,
                color: currentLevelConfig.color,
                border: `1px solid ${currentLevelConfig.border}`,
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '4px 8px',
              }}
            >
              Current Rating: {currentLevelConfig.label}
            </span>
          </div>
        </div>

        {/* Level Selector Radio Buttons */}
        <div className="mb-md">
          <label className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
            Impact Level Assessment:
          </label>
          <div className="flex flex-wrap gap-xs">
            {(['none', 'low', 'moderate', 'high', 'not_assessed'] as ImpactLevel[]).map((lvl) => {
              const cfg = IMPACT_LEVEL_CONFIG[lvl];
              const isSelected = (currentDimData.impactLevel || 'not_assessed') === lvl;

              return (
                <button
                  key={lvl}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onUpdateDimension(activeDimensionKey, { impactLevel: lvl })}
                  style={{
                    backgroundColor: isSelected ? cfg.color : cfg.bg,
                    color: isSelected ? '#ffffff' : cfg.color,
                    border: `1px solid ${cfg.border}`,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: readOnly ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  data-testid={`level-btn-${activeDimensionKey}-${lvl}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <div className="text-small text-muted mt-xs" style={{ fontStyle: 'italic' }}>
            {currentLevelConfig.desc}
          </div>
        </div>

        {/* Dimension Rationale Field */}
        <div className="mb-md">
          <label
            htmlFor={`rationale-${activeDimensionKey}`}
            className="label-text mb-xs"
            style={{ display: 'block', fontWeight: 600 }}
          >
            Pedagogical Rationale & Implications:
          </label>
          <textarea
            id={`rationale-${activeDimensionKey}`}
            rows={3}
            className="cp-input"
            disabled={readOnly}
            placeholder={`Explain how this change affects ${currentDimDef?.title.toLowerCase()}...`}
            value={currentDimData.rationale || ''}
            onChange={(e) =>
              onUpdateDimension(activeDimensionKey, { rationale: e.target.value })
            }
          />
        </div>

        {/* Supporting Evidence and Proposed Mitigation in 2 columns */}
        <div className="grid grid-2 gap-md">
          <div>
            <label
              htmlFor={`evidence-${activeDimensionKey}`}
              className="label-text mb-xs"
              style={{ display: 'block', fontWeight: 600 }}
            >
              Evidence or Supporting Notes:
            </label>
            <textarea
              id={`evidence-${activeDimensionKey}`}
              rows={2}
              className="cp-input"
              disabled={readOnly}
              placeholder="e.g. Student survey feedback, external examiner recommendation, bench-marking..."
              value={currentDimData.evidence || ''}
              onChange={(e) =>
                onUpdateDimension(activeDimensionKey, { evidence: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor={`mitigation-${activeDimensionKey}`}
              className="label-text mb-xs"
              style={{ display: 'block', fontWeight: 600 }}
            >
              Proposed Mitigation (if Low/Moderate/High):
            </label>
            <textarea
              id={`mitigation-${activeDimensionKey}`}
              rows={2}
              className="cp-input"
              disabled={readOnly}
              placeholder="e.g. Staff training workshop, phased introduction, peer mentoring, transitional marking criteria..."
              value={currentDimData.mitigation || ''}
              onChange={(e) =>
                onUpdateDimension(activeDimensionKey, { mitigation: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Accordion Toggle for All Dimensions Overview */}
      <div className="mb-md">
        <button
          type="button"
          onClick={() => setExpandedAll(!expandedAll)}
          className="cp-button-secondary"
          style={{
            fontSize: '0.825rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {expandedAll ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {expandedAll ? 'Hide Full 6-Dimension Breakdown Table' : 'Show Full 6-Dimension Summary Table'}
        </button>

        {expandedAll && (
          <div className="mt-sm overflow-x-auto" style={{ border: '1px solid var(--color-border-subtle, #e2e8f0)', borderRadius: '6px' }}>
            <table className="cp-table" style={{ width: '100%', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-subtle, #f8fafc)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Dimension</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', width: '130px' }}>Impact Level</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Rationale</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Mitigation</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dimensionKeys.map((key) => {
                  const def = IMPACT_DIMENSIONS[key];
                  const d = assessment.dimensions[key];
                  const lvl = d?.impactLevel || 'not_assessed';
                  const cfg = IMPACT_LEVEL_CONFIG[lvl];

                  return (
                    <tr key={key}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{def.title}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            fontSize: '0.75rem',
                          }}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: d?.rationale ? '#334155' : '#94a3b8' }}>
                        {d?.rationale ? d.rationale.substring(0, 80) + (d.rationale.length > 80 ? '...' : '') : 'Not provided'}
                      </td>
                      <td style={{ padding: '8px 12px', color: d?.mitigation ? '#334155' : '#94a3b8' }}>
                        {d?.mitigation ? d.mitigation.substring(0, 60) + (d.mitigation.length > 60 ? '...' : '') : 'None'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="cp-button-link"
                          style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                          onClick={() => {
                            setActiveDimensionKey(key);
                            setExpandedAll(false);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overall Assessment Notes */}
      <div>
        <label htmlFor="overall-impact-notes" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
          Overall Pedagogical Synthesis & Additional Considerations:
        </label>
        <textarea
          id="overall-impact-notes"
          rows={2}
          className="cp-input"
          disabled={readOnly}
          placeholder="Synthesize overall findings or outline any cross-cutting implications for academic quality..."
          value={assessment.overallNotes || ''}
          onChange={(e) => onUpdateOverallNotes(e.target.value)}
        />
      </div>
    </div>
  );
};
