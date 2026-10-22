import React, { useRef } from 'react';
import type { ChangeProposal } from '../types';
import { FileText, Copy, Printer } from 'lucide-react';

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

  return (
    <div className="cp-card">
      <div className="cp-card-header cp-hide-print">
        <div>
          <h2 className="cp-card-title">
            <FileText size={20} /> Curriculum Change Summary Report
          </h2>
          <p className="text-small text-muted mb-0">
            Audit-ready overview for Quality Assurance, Board of Studies, or External Examiner review
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
        <div
          style={{
            borderBottom: '2px solid var(--color-border-strong)',
            paddingBottom: '12px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <span className="badge" style={{ marginBottom: '6px' }}>{proposal.ref} &middot; {proposal.category.toUpperCase().replace('_', ' ')}</span>
            <h1 style={{ margin: '4px 0 6px 0', fontSize: '1.5rem' }}>{proposal.title}</h1>
            <p className="text-small text-muted mb-0">
              Proposer: {proposal.ownerName || 'Unassigned'} {proposal.ownerRole ? `(${proposal.ownerRole})` : ''} &middot; Status: <strong>{proposal.status.toUpperCase()}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-small text-muted mb-xs">Created: {new Date(proposal.createdAt).toLocaleDateString()}</p>
            {proposal.targetDate && (
              <p className="text-small text-muted mb-0">Target: {proposal.targetDate}</p>
            )}
          </div>
        </div>

        {/* Section 1: Curriculum Context */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            1. Curriculum Context
          </h3>
          <div className="form-row" style={{ marginBottom: '8px' }}>
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
            2. Proposed Change & Rationale
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

        {/* Section 3: Version History */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            3. Version Snapshots & Comparison
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

        {/* Section 4: Documented Change Log */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            4. Documented Change Log Entries
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

        {/* Section 5: Institutional Governance & Notes */}
        <section>
          <h3 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
            5. Governance & Institutional Notes
          </h3>
          <p className="mb-xs">
            <strong>Reviewer / QA Notes:</strong> {proposal.institutionalNotes.reviewerNotes || 'None'}
          </p>
          {proposal.institutionalNotes.aiInvolvement && (
            <p className="mb-xs">
              <strong>AI Involvement:</strong> {proposal.institutionalNotes.aiInvolvement}
            </p>
          )}
          {proposal.institutionalNotes.risksConcerns && (
            <p className="mb-xs">
              <strong>Risks / Concerns:</strong> {proposal.institutionalNotes.risksConcerns}
            </p>
          )}
          {proposal.institutionalNotes.assumptions && (
            <p className="mb-xs">
              <strong>Assumptions:</strong> {proposal.institutionalNotes.assumptions}
            </p>
          )}
          {proposal.institutionalNotes.capabilityNotes && (
            <p className="mb-xs">
              <strong>Capability & Governance Reflection:</strong>{' '}
              {proposal.institutionalNotes.capabilityNotes}
            </p>
          )}
          {proposal.institutionalNotes.generalNotes && (
            <p className="mb-0">
              <strong>General Considerations:</strong> {proposal.institutionalNotes.generalNotes}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
