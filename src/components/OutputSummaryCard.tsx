import React, { useRef, useState, useMemo } from 'react';
import type { ChangeProposal, ImpactDimensionKey } from '../types';
import { FileText, Copy, Printer, Check, AlertTriangle, CheckCircle2, History, Layers } from 'lucide-react';
import { IMPACT_DIMENSIONS } from '../utils/governance';
import { diffCurriculumSnapshots } from '../utils/comparison';
import { generateMarkdownDossier } from '../utils/dossier';

interface OutputSummaryCardProps {
  proposal: ChangeProposal;
}

export const OutputSummaryCard: React.FC<OutputSummaryCardProps> = ({ proposal }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute baseline to latest version comparison if at least 2 versions exist
  const snapshotComparison = useMemo(() => {
    if (!proposal.versions || proposal.versions.length < 2) {
      return null;
    }
    const baseline = proposal.versions[0];
    const latest = proposal.versions[proposal.versions.length - 1];
    return {
      baseline,
      latest,
      result: diffCurriculumSnapshots(baseline.sourceData, latest.sourceData),
    };
  }, [proposal.versions]);

  // Completeness inspection
  const missingItems = useMemo(() => {
    const items: string[] = [];
    if (!proposal.context.programmeName) items.push('Programme name not specified in Curriculum Context');
    if (!proposal.context.moduleName) items.push('Module name not specified in Curriculum Context');
    if (!proposal.proposedChange?.trim()) items.push('Proposed change description missing');
    if (!proposal.rationale?.trim()) items.push('Educational rationale missing');

    const dimKeys = Object.keys(IMPACT_DIMENSIONS) as ImpactDimensionKey[];
    const unassessed = dimKeys.filter((k) => {
      const dim = proposal.impactAssessment?.dimensions?.[k];
      return !dim || dim.impactLevel === 'not_assessed';
    });
    if (unassessed.length > 0) {
      items.push(`Educational Impact Assessment incomplete (${unassessed.length} of ${dimKeys.length} dimensions unassessed)`);
    }

    if (!proposal.decisions || proposal.decisions.length === 0) {
      if (['approved', 'in_implementation', 'completed', 'rejected'].includes(proposal.status)) {
        items.push(`Proposal status is ${proposal.status} but no formal decision record is attached`);
      }
    }

    if (proposal.status === 'completed' && !proposal.closure) {
      items.push('Proposal marked Completed without recorded closure sign-off verification');
    }

    return items;
  }, [proposal]);

  const handleCopy = () => {
    const md = generateMarkdownDossier(proposal);
    navigator.clipboard
      .writeText(md)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error('Clipboard copy failed', err);
        // Fallback to innerText if clipboard API fails
        if (contentRef.current) {
          navigator.clipboard.writeText(contentRef.current.innerText);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      });
  };

  const handlePrint = () => {
    window.print();
  };

  const getVersionTitle = (id: string) => {
    return proposal.versions.find((v) => v.id === id)?.title || id;
  };

  const dimKeys = Object.keys(IMPACT_DIMENSIONS) as ImpactDimensionKey[];

  return (
    <div className="cp-card" data-testid="output-summary-card">
      <div className="cp-card-header cp-hide-print">
        <div>
          <h2 className="cp-card-title">
            <FileText size={20} /> Curriculum Change Governance & Summary Report
          </h2>
          <p className="text-small text-muted mb-0">
            Comprehensive audit-ready dossier for Quality Assurance, Board of Studies, and Implementation Tracking
          </p>
        </div>
        <div className="flex gap-sm items-center">
          {copied && (
            <span
              className="badge"
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                border: '1px solid #86efac',
                padding: '4px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Check size={14} /> Dossier copied to clipboard
            </span>
          )}
          <button
            type="button"
            className="cp-button-secondary"
            onClick={handleCopy}
            data-testid="btn-copy-summary"
            title="Copy structured Markdown dossier to clipboard"
          >
            <Copy size={16} /> Copy Text
          </button>
          <button
            type="button"
            className="cp-button-primary"
            onClick={handlePrint}
            data-testid="btn-print-summary"
            title="Print dossier or save as PDF"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className="output-content"
        style={{
          padding: 'var(--spacing-md)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#fff',
        }}
      >
        {/* Header Block */}
        <div
          className="dossier-section"
          style={{
            borderBottom: '2px solid var(--color-border-strong)',
            paddingBottom: '14px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div className="flex items-center gap-xs mb-xs flex-wrap">
              <span className="badge" style={{ backgroundColor: '#0f172a', color: '#fff', fontWeight: 700 }}>
                {proposal.ref}
              </span>
              <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                {proposal.category.toUpperCase().replace(/_/g, ' ')}
              </span>
              <span
                className="badge"
                style={{
                  backgroundColor:
                    proposal.status === 'approved'
                      ? '#dcfce7'
                      : proposal.status === 'rejected'
                      ? '#fee2e2'
                      : proposal.status === 'completed'
                      ? '#e0e7ff'
                      : '#fef3c7',
                  color:
                    proposal.status === 'approved'
                      ? '#166534'
                      : proposal.status === 'rejected'
                      ? '#991b1b'
                      : proposal.status === 'completed'
                      ? '#3730a3'
                      : '#92400e',
                  fontWeight: 700,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                STATUS: {proposal.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <h1 style={{ margin: '4px 0 6px 0', fontSize: '1.6rem', fontWeight: 700 }}>{proposal.title}</h1>
            <p className="text-small text-muted mb-0">
              Proposer: <strong>{proposal.ownerName || 'Unassigned'}</strong>{' '}
              {proposal.ownerRole ? `(${proposal.ownerRole})` : ''} &middot; Programme:{' '}
              <strong>{proposal.context.programmeName || 'Unspecified'}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-small text-muted mb-xs">
              Created: <strong>{new Date(proposal.createdAt).toLocaleDateString()}</strong>
            </p>
            {proposal.targetDate && (
              <p className="text-small text-muted mb-0">
                Target Implementation: <strong>{proposal.targetDate}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Local Governance Notice */}
        <div
          className="dossier-section"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#334155',
            lineHeight: 1.5,
          }}
        >
          <strong>Governance Notice:</strong> This dossier represents a local academic proposal record maintained via the
          CloudPedagogy Curriculum Change Manager. Formal institutional validity requires ratification by the competent
          institutional committee (such as Board of Studies or Academic Standards Committee) according to institutional
          regulations. CCM supports audit trails and decision recording but does not independently authenticate institutional
          approval.
        </div>

        {/* Audit Completeness Status Callout */}
        <div
          className="dossier-section"
          style={{
            backgroundColor: missingItems.length === 0 ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${missingItems.length === 0 ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '24px',
            fontSize: '0.85rem',
          }}
          data-testid="audit-completeness-callout"
        >
          <div className="flex items-center gap-xs mb-xs">
            {missingItems.length === 0 ? (
              <>
                <CheckCircle2 size={16} color="#16a34a" />
                <strong style={{ color: '#166534' }}>Audit Dossier Status: Fully Documented</strong>
              </>
            ) : (
              <>
                <AlertTriangle size={16} color="#d97706" />
                <strong style={{ color: '#92400e' }}>
                  Audit Completeness Notice: {missingItems.length} Missing or Incomplete Requirement
                  {missingItems.length === 1 ? '' : 's'}
                </strong>
              </>
            )}
          </div>
          {missingItems.length === 0 ? (
            <p className="text-small mb-0" style={{ color: '#166534' }}>
              All core governance sections (curriculum context, educational rationale, impact assessment dimensions, and formal records) contain recorded entries.
            </p>
          ) : (
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', color: '#92400e', fontSize: '0.8rem' }}>
              {missingItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section 1: Curriculum Context */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            1. Curriculum Context
          </h3>
          <div className="grid grid-2 gap-md" style={{ marginBottom: '8px' }}>
            <p className="mb-xs">
              <strong>Programme:</strong>{' '}
              {proposal.context.programmeName ? (
                proposal.context.programmeName
              ) : (
                <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                  Incomplete: Unspecified
                </span>
              )}
            </p>
            <p className="mb-xs">
              <strong>Module:</strong>{' '}
              {proposal.context.moduleName ? (
                proposal.context.moduleName
              ) : (
                <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                  Incomplete: Unspecified
                </span>
              )}{' '}
              (Level: {proposal.context.level || 'Not specified'})
            </p>
          </div>
          <p className="mb-xs">
            <strong>Department / Faculty:</strong> {proposal.context.department || 'Not specified'}
          </p>
          {proposal.context.currentSituation && (
            <p className="text-small mt-xs mb-0">
              <strong>Current Situation:</strong> {proposal.context.currentSituation}
            </p>
          )}
        </section>

        {/* Section 2: Proposal Description & Rationale */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            2. Proposed Change & Educational Rationale
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <p className="semibold mb-xs">Proposed Change:</p>
            {proposal.proposedChange ? (
              <p className="text-small" style={{ whiteSpace: 'pre-wrap' }}>
                {proposal.proposedChange}
              </p>
            ) : (
              <p className="text-small" style={{ color: '#dc2626', fontStyle: 'italic' }}>
                [Incomplete: No specific modification description provided.]
              </p>
            )}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p className="semibold mb-xs">Educational Rationale:</p>
            {proposal.rationale ? (
              <p className="text-small" style={{ whiteSpace: 'pre-wrap' }}>
                {proposal.rationale}
              </p>
            ) : (
              <p className="text-small" style={{ color: '#dc2626', fontStyle: 'italic' }}>
                [Incomplete: No pedagogical rationale documented.]
              </p>
            )}
          </div>
          {proposal.intendedBenefits && (
            <div style={{ marginBottom: '12px' }}>
              <p className="semibold mb-xs">Intended Outcomes & Benefits:</p>
              <p className="text-small">{proposal.intendedBenefits}</p>
            </div>
          )}
          {proposal.affectedComponents && (
            <div>
              <p className="semibold mb-xs">Affected Curriculum Components:</p>
              <p className="text-small">{proposal.affectedComponents}</p>
            </div>
          )}
        </section>

        {/* Section 3: Educational Impact Assessment Findings */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            3. Educational Impact Assessment Findings
          </h3>
          <table className="cp-table" style={{ width: '100%', fontSize: '0.85rem', marginBottom: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Dimension</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', width: '140px' }}>Impact Level</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Rationale & Evidence</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {dimKeys.map((key) => {
                const def = IMPACT_DIMENSIONS[key];
                const data = proposal.impactAssessment?.dimensions?.[key];
                const lvl = data?.impactLevel || 'not_assessed';
                const isNotAssessed = lvl === 'not_assessed';

                return (
                  <tr key={key}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{def.title}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span
                        className="badge"
                        style={{
                          textTransform: 'capitalize',
                          backgroundColor: isNotAssessed ? '#fee2e2' : undefined,
                          color: isNotAssessed ? '#991b1b' : undefined,
                        }}
                      >
                        {lvl.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {data?.rationale || (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No specific rationale recorded</span>
                      )}
                      {data?.evidence && (
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                          Evidence: {data.evidence}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {data?.mitigation || <span style={{ color: '#94a3b8' }}>None proposed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {proposal.impactAssessment?.overallNotes ? (
            <p className="text-small" style={{ fontStyle: 'italic', color: '#334155' }}>
              <strong>Overall Pedagogical Synthesis:</strong> {proposal.impactAssessment.overallNotes}
            </p>
          ) : (
            <p className="text-small text-muted" style={{ fontStyle: 'italic' }}>
              [Overall pedagogical synthesis not recorded.]
            </p>
          )}
        </section>

        {/* Section 4: Formal Committee Reviews */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            4. Committee & Peer Reviews
          </h3>
          {proposal.reviews?.length === 0 ? (
            <p className="text-small text-muted">No formal reviews recorded.</p>
          ) : (
            <div className="flex-col gap-sm">
              {proposal.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    borderLeft: '3px solid #3b82f6',
                    paddingLeft: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <p className="semibold mb-xs">
                    {rev.reviewDate} &mdash; {rev.reviewerName} {rev.reviewerRole ? `(${rev.reviewerRole})` : ''}
                  </p>
                  <p className="text-small mb-xs">
                    <strong>Findings:</strong> {rev.findings}
                  </p>
                  {rev.recommendations && (
                    <p className="text-small mb-xs" style={{ color: '#166534' }}>
                      <strong>Recommendations:</strong> {rev.recommendations}
                    </p>
                  )}
                  {rev.conditions && (
                    <p className="text-small mb-0" style={{ color: '#854d0e' }}>
                      <strong>Conditions:</strong> {rev.conditions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Formal Governance Decisions */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            5. Formal Governance Decisions
          </h3>
          {proposal.decisions?.length === 0 ? (
            <p className="text-small text-muted">No formal decisions recorded yet.</p>
          ) : (
            <div className="flex-col gap-sm">
              {proposal.decisions.map((dec) => (
                <div
                  key={dec.id}
                  style={{
                    borderLeft: `4px solid ${
                      dec.outcome === 'approved' ? '#22c55e' : dec.outcome === 'rejected' ? '#ef4444' : '#f59e0b'
                    }`,
                    paddingLeft: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <p className="semibold mb-xs">
                    {dec.decisionDate} &mdash; Decision:{' '}
                    <span
                      className="badge"
                      style={{
                        textTransform: 'uppercase',
                        backgroundColor:
                          dec.outcome === 'approved'
                            ? '#dcfce7'
                            : dec.outcome === 'rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          dec.outcome === 'approved'
                            ? '#166534'
                            : dec.outcome === 'rejected'
                            ? '#991b1b'
                            : '#92400e',
                        fontWeight: 700,
                      }}
                    >
                      {dec.outcome.replace(/_/g, ' ')}
                    </span>{' '}
                    by <strong>{dec.decisionMaker}</strong>
                  </p>
                  <p className="text-small mb-xs">
                    <strong>Rationale:</strong> {dec.decisionRationale}
                  </p>
                  {dec.conditions && (
                    <p className="text-small mb-xs" style={{ color: '#854d0e' }}>
                      <strong>Approval Conditions:</strong> {dec.conditions}
                    </p>
                  )}
                  {dec.targetSnapshotId && (
                    <p className="text-small text-muted mb-0">
                      <strong>Target Snapshot:</strong> {dec.targetSnapshotId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 6: Implementation Plan & Action Status */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            6. Implementation Tracking
          </h3>
          {proposal.implementationActions?.length === 0 ? (
            <p className="text-small text-muted">No implementation actions recorded.</p>
          ) : (
            <table className="cp-table" style={{ width: '100%', fontSize: '0.85rem', marginBottom: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Responsible</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px' }}>Completion Evidence</th>
                </tr>
              </thead>
              <tbody>
                {proposal.implementationActions.map((act) => (
                  <tr key={act.id}>
                    <td style={{ padding: '6px 8px' }}>{act.title}</td>
                    <td style={{ padding: '6px 8px' }}>{act.assignee}</td>
                    <td style={{ padding: '6px 8px' }}>{act.dueDate || '—'}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        {act.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>{act.completionEvidence || act.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Closure Sign-off block */}
          {proposal.closure && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                padding: '10px 14px',
                marginTop: '12px',
              }}
            >
              <p className="semibold mb-xs" style={{ color: '#166534' }}>
                Implementation Closure Verified
              </p>
              <p className="text-small mb-xs" style={{ color: '#15803d' }}>
                <strong>Signed Off By:</strong> {proposal.closure.verifiedBy} on {proposal.closure.verifiedDate}
              </p>
              <p className="text-small mb-0" style={{ color: '#166534' }}>
                <strong>Verification Basis:</strong> {proposal.closure.verifiedBasis}
              </p>
              {proposal.closure.closureNotes && (
                <p className="text-small mt-xxs mb-0 text-muted">
                  <strong>Notes:</strong> {proposal.closure.closureNotes}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Section 7: Version Snapshots & Comparison Summary */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            7. Version Snapshots & Comparison Summary
          </h3>
          {proposal.versions.length === 0 ? (
            <p className="text-small text-muted">No design versions attached to this proposal.</p>
          ) : (
            <div>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                {proposal.versions.map((v) => (
                  <li key={v.id} style={{ marginBottom: '8px' }}>
                    <strong>{v.title}</strong> ({v.createdAt}) &mdash; Source: <span className="badge">{v.sourceType}</span>
                    <p className="text-small text-muted mb-0">{v.description}</p>
                  </li>
                ))}
              </ul>

              {/* Embedded Version Comparison Summary */}
              {snapshotComparison ? (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '12px 14px',
                  }}
                  data-testid="dossier-version-comparison-summary"
                >
                  <div className="flex items-center justify-between mb-xs flex-wrap gap-xs">
                    <span className="semibold text-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <History size={15} /> Snapshot Comparison: Baseline ({snapshotComparison.baseline.title}) vs Latest ({snapshotComparison.latest.title})
                    </span>
                    <div className="flex gap-xs">
                      <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>
                        {snapshotComparison.result.summary.totalChanges} Total Changes
                      </span>
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                        +{snapshotComparison.result.summary.addedCount} Added
                      </span>
                      <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        -{snapshotComparison.result.summary.removedCount} Removed
                      </span>
                      <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                        ~{snapshotComparison.result.summary.modifiedCount} Modified
                      </span>
                    </div>
                  </div>

                  {snapshotComparison.result.changes.length === 0 ? (
                    <p className="text-small text-muted mb-0">
                      Snapshots are structurally identical; no field changes detected.
                    </p>
                  ) : (
                    <div>
                      <p className="text-small text-muted mb-xs">
                        Key recorded modifications between baseline and proposed curriculum snapshot:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem' }}>
                        {snapshotComparison.result.changes.slice(0, 8).map((c, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{c.label}:</strong>{' '}
                            {c.type === 'added' ? (
                              <span style={{ color: '#166534' }}>Added ({c.newDisplay})</span>
                            ) : c.type === 'removed' ? (
                              <span style={{ color: '#991b1b' }}>Removed ({c.oldDisplay})</span>
                            ) : (
                              <span>
                                Changed from <span style={{ textDecoration: 'line-through' }}>{c.oldDisplay}</span> to{' '}
                                <strong>{c.newDisplay}</strong>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {snapshotComparison.result.changes.length > 8 && (
                        <p className="text-small text-muted mt-xs mb-0">
                          ... and {snapshotComparison.result.changes.length - 8} more field changes (inspect full side-by-side diff in Stage 4: Snapshots & Log).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '0.825rem',
                    color: '#64748b',
                  }}
                >
                  <Layers size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  Single version snapshot attached ({proposal.versions[0]?.title || 'v1'}). Baseline version comparison
                  requires at least two snapshots to compute changes.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 8: Documented Change Log */}
        <section className="dossier-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            8. Documented Change Log Entries
          </h3>
          {proposal.changeLog.length === 0 ? (
            <p className="text-small text-muted">No discrete changes logged.</p>
          ) : (
            <div className="flex-col gap-sm">
              {proposal.changeLog.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderLeft: '3px solid var(--color-border-strong)',
                    paddingLeft: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <p className="semibold mb-xs">
                    {entry.date}: {entry.changeSummary}
                  </p>
                  {entry.rationale && (
                    <p className="text-small mb-xs">
                      <strong>Rationale:</strong> {entry.rationale}
                    </p>
                  )}
                  {entry.impact && (
                    <p className="text-small mb-xs">
                      <strong>Impact:</strong> {entry.impact}
                    </p>
                  )}
                  {entry.versionId && (
                    <p className="text-small text-muted mb-0">
                      Linked Reference: {getVersionTitle(entry.versionId)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 9: Governance Event Audit Timeline */}
        <section className="dossier-section">
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            9. Governance Event History & Audit Trail
          </h3>
          {proposal.events?.length === 0 ? (
            <p className="text-small text-muted">No governance events logged.</p>
          ) : (
            <div className="flex-col gap-xs">
              {proposal.events.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '0.825rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <div>
                    <span className="badge mr-xs" style={{ fontSize: '0.75rem' }}>
                      {ev.eventType.replace(/_/g, ' ')}
                    </span>
                    <strong>{ev.actor}:</strong> {ev.description}
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {new Date(ev.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
