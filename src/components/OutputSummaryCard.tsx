import React, { useRef } from 'react';
import type { ChangeProposal, ImpactDimensionKey } from '../types';
import { FileText, Copy, Printer } from 'lucide-react';
import { IMPACT_DIMENSIONS } from '../utils/governance';

interface OutputSummaryCardProps {
  proposal: ChangeProposal;
}

export const OutputSummaryCard: React.FC<OutputSummaryCardProps> = ({ proposal }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (contentRef.current) {
      const textToCopy = contentRef.current.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => alert('Summary report copied to clipboard.'))
        .catch((err) => {
          console.error('Clipboard copy failed', err);
          alert('Failed to copy to clipboard.');
        });
    }
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
        <div className="flex gap-sm">
          <button type="button" className="cp-button-secondary" onClick={handleCopy}>
            <Copy size={16} /> Copy Text
          </button>
          <button type="button" className="cp-button-primary" onClick={handlePrint}>
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
          style={{
            borderBottom: '2px solid var(--color-border-strong)',
            paddingBottom: '12px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span className="badge" style={{ marginBottom: '6px' }}>
              {proposal.ref} &middot; {proposal.category.toUpperCase().replace('_', ' ')}
            </span>
            <h1 style={{ margin: '4px 0 6px 0', fontSize: '1.5rem' }}>{proposal.title}</h1>
            <p className="text-small text-muted mb-0">
              Proposer: {proposal.ownerName || 'Unassigned'} {proposal.ownerRole ? `(${proposal.ownerRole})` : ''} &middot; Status:{' '}
              <strong style={{ textTransform: 'uppercase' }}>{proposal.status.replace('_', ' ')}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-small text-muted mb-xs">Created: {new Date(proposal.createdAt).toLocaleDateString()}</p>
            {proposal.targetDate && (
              <p className="text-small text-muted mb-0">Target Implementation: {proposal.targetDate}</p>
            )}
          </div>
        </div>

        {/* Local Governance Notice */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '20px',
            fontSize: '0.825rem',
            color: '#475569',
          }}
        >
          <strong>Governance Notice:</strong> This report represents a locally documented proposal dossier maintained via the CloudPedagogy Curriculum Change Manager. Formal validity requires adherence to institutional committee terms of reference.
        </div>

        {/* Section 1: Curriculum Context */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            1. Curriculum Context
          </h3>
          <div className="grid grid-2 gap-md" style={{ marginBottom: '8px' }}>
            <p className="mb-xs">
              <strong>Programme:</strong> {proposal.context.programmeName || 'Not specified'}
            </p>
            <p className="mb-xs">
              <strong>Module:</strong> {proposal.context.moduleName || 'Not specified'} (Level: {proposal.context.level || 'Not specified'})
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
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            2. Proposed Change & Educational Rationale
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <p className="semibold mb-xs">Proposed Change:</p>
            <p className="text-small" style={{ whiteSpace: 'pre-wrap' }}>
              {proposal.proposedChange || 'No specific modification description provided.'}
            </p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p className="semibold mb-xs">Educational Rationale:</p>
            <p className="text-small" style={{ whiteSpace: 'pre-wrap' }}>
              {proposal.rationale || 'No rationale documented.'}
            </p>
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
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            3. Educational Impact Assessment Findings
          </h3>
          <table className="cp-table" style={{ width: '100%', fontSize: '0.85rem', marginBottom: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Dimension</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', width: '130px' }}>Impact Level</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Rationale & Evidence</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {dimKeys.map((key) => {
                const def = IMPACT_DIMENSIONS[key];
                const data = proposal.impactAssessment?.dimensions?.[key];
                const lvl = data?.impactLevel || 'not_assessed';

                return (
                  <tr key={key}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{def.title}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        {lvl.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {data?.rationale || 'No specific rationale recorded.'}
                      {data?.evidence && (
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                          Evidence: {data.evidence}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {data?.mitigation || 'None proposed'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {proposal.impactAssessment?.overallNotes && (
            <p className="text-small" style={{ fontStyle: 'italic', color: '#334155' }}>
              <strong>Overall Pedagogical Synthesis:</strong> {proposal.impactAssessment.overallNotes}
            </p>
          )}
        </section>

        {/* Section 4: Formal Committee Reviews */}
        <section style={{ marginBottom: '24px' }}>
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
        <section style={{ marginBottom: '24px' }}>
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
                    {dec.decisionDate} &mdash; Decision: <span className="badge" style={{ textTransform: 'uppercase' }}>{dec.outcome.replace('_', ' ')}</span> by {dec.decisionMaker}
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
        <section style={{ marginBottom: '24px' }}>
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
                        {act.status.replace('_', ' ')}
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

        {/* Section 7: Version Snapshots & Comparisons */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            7. Version Snapshots & Comparison
          </h3>
          {proposal.versions.length === 0 ? (
            <p className="text-small text-muted">No design versions attached to this proposal.</p>
          ) : (
            <ul style={{ paddingLeft: '20px' }}>
              {proposal.versions.map((v) => (
                <li key={v.id} style={{ marginBottom: '8px' }}>
                  <strong>{v.title}</strong> ({v.createdAt}) &mdash; Source: <span className="badge">{v.sourceType}</span>
                  <p className="text-small text-muted mb-0">{v.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 8: Documented Change Log */}
        <section style={{ marginBottom: '24px' }}>
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
        <section>
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
                      {ev.eventType.replace('_', ' ')}
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
