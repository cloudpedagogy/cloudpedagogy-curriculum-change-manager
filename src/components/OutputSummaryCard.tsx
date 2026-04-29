import React, { useRef } from 'react';
import type { AppState } from '../types';
import { FileText, Copy, Printer } from 'lucide-react';

interface OutputSummaryCardProps {
  state: AppState;
}

export const OutputSummaryCard: React.FC<OutputSummaryCardProps> = ({ state }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (contentRef.current) {
      const textToCopy = contentRef.current.innerText;
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Summary copied to clipboard'))
        .catch(err => {
          console.error("Clipboard copy failed", err);
          alert('Failed to copy to clipboard.');
        });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getVersionTitle = (id: string) => {
    return state.versions.find(v => v.id === id)?.title || id;
  };

  return (
    <div className="cp-card">
      <div className="cp-card-header cp-hide-print">
        <h2 className="cp-card-title"><FileText size={20} /> Output Summary Report</h2>
        <div className="flex gap-sm">
          <button className="cp-button-secondary" onClick={handleCopy}>
            <Copy size={16} /> Copy Text
          </button>
          <button className="cp-button-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div ref={contentRef} className="output-content" style={{ padding: 'var(--spacing-md)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff' }}>
        
        <h1 style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: '8px', marginBottom: '16px' }}>Curriculum Change Report</h1>
        
        <section style={{ marginBottom: '24px' }}>
          <h3>Context</h3>
          <p className="mb-xs"><strong>Programme:</strong> {state.meta.programmeName || 'Not specified'}</p>
          <p className="mb-xs"><strong>Module:</strong> {state.meta.moduleName || 'Not specified'}</p>
          <p className="mb-xs"><strong>Level:</strong> {state.meta.level || 'Not specified'} | <strong>Department:</strong> {state.meta.department || 'Not specified'}</p>
          <p className="text-small text-muted mb-0 mt-sm">Last Generated: {new Date(state.lastUpdated).toLocaleString()}</p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3>Version History Overview</h3>
          {state.versions.length === 0 ? (
            <p>No versions recorded.</p>
          ) : (
            <ul style={{ paddingLeft: '20px' }}>
              {state.versions.map(v => (
                <li key={v.id} style={{ marginBottom: '8px' }}>
                  <strong>{v.title}</strong> ({v.createdAt}) - Source: {v.sourceType}
                  <p className="text-small text-muted mb-0">{v.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3>Documented Changes & Rationale</h3>
          {state.changeLog.length === 0 ? (
            <p>No changes logged.</p>
          ) : (
            <div className="flex-col gap-sm">
              {state.changeLog.map(entry => (
                <div key={entry.id} style={{ borderLeft: '3px solid var(--color-border-strong)', paddingLeft: '12px', marginBottom: '16px' }}>
                  <p className="semibold mb-xs">{entry.date}: {entry.changeSummary}</p>
                  <p className="text-small mb-xs"><strong>Rationale:</strong> {entry.rationale}</p>
                  <p className="text-small mb-xs"><strong>Impact:</strong> {entry.impact}</p>
                  {entry.versionId && <p className="text-small text-muted mb-0">Linked Reference: {getVersionTitle(entry.versionId)}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3>Review Notes & Governance</h3>
          <p className="mb-xs"><strong>General Review:</strong> {state.institutionalNotes.reviewerNotes || 'None'}</p>
          {state.institutionalNotes.aiInvolvement && (
            <p className="mb-xs"><strong>AI Involvement:</strong> {state.institutionalNotes.aiInvolvement}</p>
          )}
          {state.institutionalNotes.risksConcerns && (
            <p className="mb-xs"><strong>Risks / Concerns:</strong> {state.institutionalNotes.risksConcerns}</p>
          )}
          {state.institutionalNotes.assumptions && (
            <p className="mb-xs"><strong>Assumptions:</strong> {state.institutionalNotes.assumptions}</p>
          )}
          {state.institutionalNotes.capabilityNotes && (
            <p className="mb-xs"><strong>Capability:</strong> {state.institutionalNotes.capabilityNotes}</p>
          )}
          <p className="mb-0"><strong>Additional Notes:</strong> {state.institutionalNotes.generalNotes || 'None'}</p>
        </section>
      </div>

    </div>
  );
};
