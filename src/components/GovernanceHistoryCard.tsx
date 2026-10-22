import React from 'react';
import type { GovernanceEvent, GovernanceEventType } from '../types';
import { History, Info, Clock } from 'lucide-react';

interface GovernanceHistoryCardProps {
  events: GovernanceEvent[];
  proposalRef: string;
}

const EVENT_TYPE_CONFIG: Record<
  GovernanceEventType,
  { label: string; bg: string; color: string; border: string }
> = {
  proposal_created: {
    label: 'Proposal Created',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
  },
  proposal_submitted: {
    label: 'Submitted for Review',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
  },
  under_review: {
    label: 'Under Committee Review',
    bg: '#fef9c3',
    color: '#854d0e',
    border: '#fef08a',
  },
  returned_for_revision: {
    label: 'Returned for Revision',
    bg: '#fef2f2',
    color: '#991b1b',
    border: '#fecaca',
  },
  review_recorded: {
    label: 'Review Recorded',
    bg: '#f5f3ff',
    color: '#6d28d9',
    border: '#ddd6fe',
  },
  decision_recorded: {
    label: 'Decision Recorded',
    bg: '#ecfdf5',
    color: '#065f46',
    border: '#a7f3d0',
  },
  proposal_approved: {
    label: 'Proposal Approved',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac',
  },
  proposal_rejected: {
    label: 'Proposal Rejected',
    bg: '#fee2e2',
    color: '#991b1b',
    border: '#fca5a5',
  },
  implementation_started: {
    label: 'Implementation Started',
    bg: '#e0f2fe',
    color: '#0369a1',
    border: '#bae6fd',
  },
  action_added: {
    label: 'Action Added',
    bg: '#f1f5f9',
    color: '#334155',
    border: '#cbd5e1',
  },
  action_updated: {
    label: 'Action Updated',
    bg: '#f8fafc',
    color: '#475569',
    border: '#e2e8f0',
  },
  action_completed: {
    label: 'Action Completed',
    bg: '#dcfce7',
    color: '#15803d',
    border: '#bbf7d0',
  },
  closure_verified: {
    label: 'Closure Verified',
    bg: '#f0fdf4',
    color: '#166534',
    border: '#86efac',
  },
  proposal_completed: {
    label: 'Proposal Completed',
    bg: '#e0e7ff',
    color: '#3730a3',
    border: '#c7d2fe',
  },
  proposal_withdrawn: {
    label: 'Proposal Withdrawn',
    bg: '#fef2f2',
    color: '#991b1b',
    border: '#fecaca',
  },
  proposal_reopened: {
    label: 'Proposal Reopened',
    bg: '#fefce8',
    color: '#854d0e',
    border: '#fef08a',
  },
};

export const GovernanceHistoryCard: React.FC<GovernanceHistoryCardProps> = ({
  events,
  proposalRef,
}) => {
  // Sort reverse chronologically
  const sortedEvents = [...(events || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="cp-card mb-lg" data-testid="governance-history-card">
      <div className="flex justify-between items-start flex-wrap gap-sm mb-md">
        <div>
          <h3 className="heading-medium mb-xs flex items-center gap-xs">
            <History size={20} color="var(--color-primary-accent, #0056b3)" />
            Governance Event History & Audit Trail
          </h3>
          <p className="text-small text-muted">
            Append-only chronological record of governance actions, committee transitions, and implementation milestones for {proposalRef}.
          </p>
        </div>

        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
          {sortedEvents.length} Events Logged
        </span>
      </div>

      {/* Local Storage Disclaimer */}
      <div
        style={{
          backgroundColor: '#fffbeb',
          borderLeft: '4px solid #f59e0b',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: '4px',
          marginBottom: 'var(--spacing-md)',
          fontSize: '0.85rem',
          color: '#92400e',
        }}
      >
        <div className="flex items-start gap-xs">
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
          <div>
            <strong>Local Audit Notice:</strong> This audit trail is securely recorded within the local client workspace. In accordance with local-first governance tools, records can be modified by individuals with direct browser storage or JSON file access. It provides traceable institutional provenance, but is not a cryptographically signed multi-tenant ledger.
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {sortedEvents.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            padding: 'var(--spacing-lg)',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          No governance events recorded yet.
        </div>
      ) : (
        <div className="flex flex-col gap-sm" data-testid="event-list">
          {sortedEvents.map((ev, index) => {
            const cfg =
              EVENT_TYPE_CONFIG[ev.eventType] || {
                label: ev.eventType.replace('_', ' '),
                bg: '#f1f5f9',
                color: '#334155',
                border: '#cbd5e1',
              };

            return (
              <div
                key={ev.id || index}
                style={{
                  border: `1px solid ${cfg.border}`,
                  borderRadius: '6px',
                  padding: '10px 14px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                data-testid={`event-item-${ev.id}`}
              >
                <div className="flex justify-between items-center flex-wrap gap-xs mb-xxs">
                  <div className="flex items-center gap-xs">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-small" style={{ fontWeight: 600, color: '#0f172a' }}>
                      {ev.actor}
                    </span>
                  </div>

                  <span
                    className="text-small text-muted flex items-center gap-xxs"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Clock size={12} />
                    {new Date(ev.timestamp).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="text-small" style={{ color: '#334155' }}>
                  {ev.description}
                </div>

                {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                  <div
                    className="mt-xxs text-small text-muted flex gap-xs flex-wrap"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {Object.entries(ev.metadata).map(([k, v]) => (
                      <span key={k} style={{ backgroundColor: '#f8fafc', padding: '1px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
