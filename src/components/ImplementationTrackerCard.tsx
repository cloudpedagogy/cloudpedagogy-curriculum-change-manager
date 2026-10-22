import React, { useState } from 'react';
import type {
  ChangeProposal,
  ImplementationAction,
  ActionStatus,
  ProposalClosure,
} from '../types';
import {
  ListChecks,
  PlusCircle,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import { checkTransitionEligibility } from '../utils/governance';

interface ImplementationTrackerCardProps {
  proposal: ChangeProposal;
  onAddAction: (action: Omit<ImplementationAction, 'id'>) => void;
  onUpdateAction: (id: string, updates: Partial<ImplementationAction>) => void;
  onDeleteAction: (id: string) => void;
  onVerifyAndClose: (closure: ProposalClosure) => {
    success: boolean;
    message?: string;
  };
  onReopen?: (actor: string, reason: string) => {
    success: boolean;
    message?: string;
  };
}

const ACTION_STATUS_CONFIG: Record<
  ActionStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  not_started: {
    label: 'Not Started',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1',
  },
  in_progress: {
    label: 'In Progress',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
  },
  blocked: {
    label: 'Blocked',
    bg: '#fef2f2',
    color: '#b91c1c',
    border: '#fecaca',
  },
  completed: {
    label: 'Completed',
    bg: '#f0fdf4',
    color: '#15803d',
    border: '#bbf7d0',
  },
};

export const ImplementationTrackerCard: React.FC<ImplementationTrackerCardProps> = ({
  proposal,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  onVerifyAndClose,
  onReopen,
}) => {
  // New action form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Editing existing action
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Closure modal / form state
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [closureSignee, setClosureSignee] = useState(proposal.ownerName || '');
  const [closureRole, setClosureRole] = useState(proposal.ownerRole || 'Implementation Lead');
  const [closureBasis, setClosureBasis] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [closureConfirmed, setClosureConfirmed] = useState(false);
  const [closureError, setClosureError] = useState('');
  const [closureSuccess, setClosureSuccess] = useState('');

  // Reopening completed proposal state
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenActor, setReopenActor] = useState(proposal.ownerName || '');
  const [reopenReason, setReopenReason] = useState('');
  const [reopenError, setReopenError] = useState('');

  const actions = proposal.implementationActions || [];
  const completedCount = actions.filter((a) => a.status === 'completed').length;
  const blockedCount = actions.filter((a) => a.status === 'blocked').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = actions.filter(
    (a) => a.status !== 'completed' && a.dueDate && a.dueDate < todayStr
  ).length;

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Action title/description is required.');
      return;
    }
    if (!assignee.trim()) {
      setFormError('Assignee / responsible person is required.');
      return;
    }

    onAddAction({
      title: title.trim(),
      assignee: assignee.trim(),
      dueDate: dueDate || undefined,
      status: 'not_started',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAssignee('');
    setDueDate('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleToggleComplete = (action: ImplementationAction) => {
    if (action.status === 'completed') {
      onUpdateAction(action.id, {
        status: 'in_progress',
        completedAt: undefined,
      });
    } else {
      onUpdateAction(action.id, {
        status: 'completed',
        completedAt: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReopenError('');

    if (!reopenActor.trim()) {
      setReopenError('Actor name is required to reopen proposal.');
      return;
    }
    if (!reopenReason.trim()) {
      setReopenError('A justification / reason is required to reopen proposal.');
      return;
    }

    if (onReopen) {
      const res = onReopen(reopenActor.trim(), reopenReason.trim());
      if (res && !res.success) {
        setReopenError(res.message || 'Failed to reopen proposal.');
        return;
      }
      setShowReopenForm(false);
      setReopenReason('');
    }
  };

  const handleClosureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClosureError('');
    setClosureSuccess('');

    if (!closureSignee.trim()) {
      setClosureError('Name of the verifying officer is required.');
      return;
    }
    if (!closureBasis.trim()) {
      setClosureError('Basis of completion verification is required.');
      return;
    }
    if (actions.length === 0 && !closureNotes.trim()) {
      setClosureError(
        'Zero-action implementation plans require deliberate closure notes explaining why no operational actions were necessary.'
      );
      return;
    }
    if (!closureConfirmed) {
      setClosureError('You must confirm that all curriculum changes have been verified.');
      return;
    }

    const res = onVerifyAndClose({
      verifiedBy: `${closureSignee.trim()} (${closureRole.trim()})`,
      verifiedDate: new Date().toISOString().split('T')[0],
      verifiedBasis: closureBasis.trim(),
      closureNotes: closureNotes.trim() || 'Verified all planned implementation actions.',
    });

    if (!res.success) {
      setClosureError(res.message || 'Failed to complete proposal closure.');
    } else {
      setClosureSuccess('Proposal has been successfully closed and marked as Completed!');
      setShowClosureForm(false);
    }
  };

  const completionCheck = checkTransitionEligibility(proposal, 'completed');

  return (
    <div className="cp-card mb-lg" data-testid="implementation-tracker-card">
      <div className="flex justify-between items-start flex-wrap gap-sm mb-md">
        <div>
          <h3 className="heading-medium mb-xs flex items-center gap-xs">
            <ListChecks size={20} color="var(--color-primary-accent, #0056b3)" />
            Implementation Action Tracking & Closure
          </h3>
          <p className="text-small text-muted">
            Track operational execution of approved changes, assign responsibilities, and record formal sign-off.
          </p>
        </div>

        {/* Action metrics overview */}
        <div className="flex items-center gap-xs flex-wrap">
          <span
            className="badge"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 600,
            }}
          >
            {completedCount} of {actions.length} Completed
          </span>

          {blockedCount > 0 && (
            <span
              className="badge"
              style={{
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                fontWeight: 600,
              }}
            >
              {blockedCount} Blocked
            </span>
          )}

          {overdueCount > 0 && (
            <span
              className="badge"
              style={{
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fda4af',
                fontWeight: 600,
              }}
            >
              {overdueCount} Overdue
            </span>
          )}
        </div>
      </div>

      {/* Closure Record Banner if already completed */}
      {proposal.closure && (
        <div
          className="mb-md"
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: 'var(--spacing-md)',
          }}
          data-testid="closure-record-banner"
        >
          <div className="flex items-center gap-xs mb-xs" style={{ color: '#166534', fontWeight: 700 }}>
            <CheckCircle2 size={18} />
            Proposal Completed & Verified Closed
          </div>
          <div className="text-small" style={{ color: '#15803d' }}>
            <strong>Verified By:</strong> {proposal.closure.verifiedBy} on {proposal.closure.verifiedDate}
          </div>
          <div className="text-small mt-xxs" style={{ color: '#166534' }}>
            <strong>Verification Basis:</strong> {proposal.closure.verifiedBasis}
          </div>
          {proposal.closure.closureNotes && (
            <div className="text-small mt-xxs text-muted">
              <strong>Notes:</strong> {proposal.closure.closureNotes}
            </div>
          )}

          {proposal.status === 'completed' && onReopen && (
            <div className="mt-sm pt-xs" style={{ borderTop: '1px solid #bbf7d0' }}>
              {!showReopenForm ? (
                <button
                  type="button"
                  className="cp-button-secondary"
                  style={{ fontSize: '0.8rem', padding: '4px 10px', borderColor: '#166534', color: '#166534' }}
                  onClick={() => setShowReopenForm(true)}
                  data-testid="btn-reopen-completed"
                >
                  Reopen Implementation Plan
                </button>
              ) : (
                <form
                  onSubmit={handleReopenSubmit}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: 'var(--spacing-sm)',
                    marginTop: 'var(--spacing-xs)',
                  }}
                  data-testid="reopen-completed-form"
                >
                  <h6 className="heading-small mb-xs" style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                    Reopen Proposal for Implementation
                  </h6>
                  {reopenError && <div className="mb-xs text-small" style={{ color: '#b91c1c' }}>{reopenError}</div>}
                  <div className="grid grid-2 gap-xs mb-xs">
                    <div>
                      <label className="label-text mb-xxs" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                        Officer Name: *
                      </label>
                      <input
                        type="text"
                        required
                        className="cp-input"
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        placeholder="e.g. Dr. Eleanor Vance"
                        value={reopenActor}
                        onChange={(e) => setReopenActor(e.target.value)}
                        data-testid="input-reopen-actor"
                      />
                    </div>
                    <div>
                      <label className="label-text mb-xxs" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>
                        Reopening Rationale: *
                      </label>
                      <input
                        type="text"
                        required
                        className="cp-input"
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        placeholder="e.g. Action required for new lab rubric"
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        data-testid="input-reopen-reason"
                      />
                    </div>
                  </div>
                  <div className="flex gap-xs">
                    <button
                      type="submit"
                      className="cp-button-primary"
                      style={{ fontSize: '0.8rem', padding: '4px 10px', backgroundColor: '#d97706', borderColor: '#b45309' }}
                      data-testid="btn-confirm-reopen"
                    >
                      Confirm Reopen
                    </button>
                    <button
                      type="button"
                      className="cp-button-secondary"
                      style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      onClick={() => setShowReopenForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {proposal.status === 'completed' && (
        <div
          className="mb-md text-small"
          style={{
            backgroundColor: '#f8fafc',
            borderLeft: '4px solid #64748b',
            color: '#475569',
            padding: '8px 12px',
            borderRadius: '4px',
          }}
          data-testid="completed-locked-notice"
        >
          <strong>Proposal Formally Completed:</strong> Implementation actions and closure evidence are locked as historical records. To modify actions, deliberately reopen the proposal above.
        </div>
      )}

      {/* Notification banner */}
      {closureSuccess && (
        <div
          className="mb-md"
          style={{
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #22c55e',
            color: '#166534',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
        >
          {closureSuccess}
        </div>
      )}

      {/* Action Header and Add Button */}
      <div className="flex justify-between items-center mb-md">
        <h4 className="heading-small" style={{ margin: 0 }}>
          Action Items ({actions.length})
        </h4>

        <div className="flex gap-xs">
          <button
            type="button"
            className="cp-button-primary"
            style={{ fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={proposal.status === 'completed'}
            data-testid="btn-add-action-toggle"
          >
            <PlusCircle size={14} />
            {showAddForm ? 'Cancel' : 'Add Action Item'}
          </button>
        </div>
      </div>

      {/* Add Action Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateAction}
          style={{
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)',
          }}
          data-testid="add-action-form"
        >
          <h5 className="heading-small mb-sm" style={{ color: '#0f172a' }}>
            New Implementation Action
          </h5>

          {formError && (
            <div className="mb-sm" style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
              {formError}
            </div>
          )}

          <div className="mb-sm">
            <label htmlFor="action-desc" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
              Action Title / Task: *
            </label>
            <textarea
              id="action-desc"
              rows={2}
              required
              className="cp-input"
              placeholder="e.g. Update module syllabus and assessment rubric in the VLE / LMS..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-action-desc"
            />
          </div>

          <div className="grid grid-2 gap-md mb-sm">
            <div>
              <label htmlFor="action-resp" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                Responsible Person / Assignee: *
              </label>
              <input
                id="action-resp"
                type="text"
                required
                className="cp-input"
                placeholder="e.g. Dr. Eleanor Vance (Module Lead)"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                data-testid="input-action-resp"
              />
            </div>

            <div>
              <label htmlFor="action-due" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                Due Date (Optional):
              </label>
              <input
                id="action-due"
                type="date"
                className="cp-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                data-testid="input-action-due"
              />
            </div>
          </div>

          <div className="mb-md">
            <label htmlFor="action-notes" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
              Initial Notes / Instructions:
            </label>
            <input
              id="action-notes"
              type="text"
              className="cp-input"
              placeholder="e.g. Coordinate with departmental learning technologist"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-xs">
            <button type="submit" className="cp-button-primary" data-testid="btn-save-action">
              Save Action
            </button>
            <button
              type="button"
              className="cp-button-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Action list */}
      {actions.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            padding: 'var(--spacing-lg)',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#64748b',
            marginBottom: 'var(--spacing-md)',
          }}
          data-testid="empty-actions-notice"
        >
          No implementation actions created yet. Curriculum changes should outline key operational tasks before closure.
        </div>
      ) : (
        <div className="flex flex-col gap-sm mb-lg" data-testid="action-list">
          {actions.map((act) => {
            const isEditing = editingActionId === act.id;
            const cfg = ACTION_STATUS_CONFIG[act.status];
            const isOverdue = act.status !== 'completed' && act.dueDate && act.dueDate < todayStr;

            return (
              <div
                key={act.id}
                style={{
                  border: `1px solid ${isOverdue ? '#fca5a5' : cfg.border}`,
                  borderRadius: '8px',
                  padding: 'var(--spacing-md)',
                  backgroundColor: act.status === 'completed' ? '#fcfdfc' : '#ffffff',
                }}
                data-testid={`action-item-${act.id}`}
              >
                {isEditing ? (
                  // Inline Edit Form
                  <div>
                    <div className="mb-xs">
                      <label className="label-text mb-xxs" style={{ display: 'block', fontWeight: 600 }}>
                        Title / Task:
                      </label>
                      <input
                        type="text"
                        className="cp-input"
                        value={act.title}
                        onChange={(e) => onUpdateAction(act.id, { title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-3 gap-sm mb-xs">
                      <div>
                        <label className="label-text mb-xxs" style={{ display: 'block', fontWeight: 600 }}>
                          Assignee:
                        </label>
                        <input
                          type="text"
                          className="cp-input"
                          value={act.assignee}
                          onChange={(e) =>
                            onUpdateAction(act.id, { assignee: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="label-text mb-xxs" style={{ display: 'block', fontWeight: 600 }}>
                          Status:
                        </label>
                        <select
                          className="cp-input"
                          value={act.status}
                          onChange={(e) =>
                            onUpdateAction(act.id, { status: e.target.value as ActionStatus })
                          }
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-text mb-xxs" style={{ display: 'block', fontWeight: 600 }}>
                          Due Date:
                        </label>
                        <input
                          type="date"
                          className="cp-input"
                          value={act.dueDate || ''}
                          onChange={(e) => onUpdateAction(act.id, { dueDate: e.target.value || undefined })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-2 gap-sm mb-sm">
                      <div>
                        <label className="label-text mb-xxs" style={{ display: 'block', fontWeight: 600 }}>
                          Progress Notes:
                        </label>
                        <input
                          type="text"
                          className="cp-input"
                          value={act.notes || ''}
                          onChange={(e) => onUpdateAction(act.id, { notes: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="label-text mb-xxs" style={{ display: 'block', fontWeight: 600 }}>
                          Completion Evidence / Note:
                        </label>
                        <input
                          type="text"
                          className="cp-input"
                          value={act.completionEvidence || ''}
                          onChange={(e) => onUpdateAction(act.id, { completionEvidence: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-xs">
                      <button
                        type="button"
                        className="cp-button-primary"
                        style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        onClick={() => setEditingActionId(null)}
                      >
                        Done Editing
                      </button>
                    </div>
                  </div>
                ) : (
                  // Regular Display Row
                  <div>
                    <div className="flex justify-between items-start flex-wrap gap-xs mb-xs">
                      <div className="flex items-start gap-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(act)}
                          disabled={proposal.status === 'completed'}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: proposal.status === 'completed' ? 'default' : 'pointer',
                            padding: 0,
                            marginTop: '2px',
                            color: act.status === 'completed' ? '#15803d' : '#94a3b8',
                          }}
                          title={act.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
                          data-testid={`btn-toggle-action-${act.id}`}
                        >
                          {act.status === 'completed' ? <CheckSquare size={18} /> : <div style={{ width: 16, height: 16, border: '2px solid #94a3b8', borderRadius: '3px' }} />}
                        </button>
                        <div>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              textDecoration: act.status === 'completed' ? 'line-through' : 'none',
                            }}
                          >
                            {act.title}
                          </span>
                        </div>
                      </div>

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

                        {isOverdue && (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: '#fef2f2',
                              color: '#b91c1c',
                              fontSize: '0.75rem',
                              border: '1px solid #fca5a5',
                              fontWeight: 700,
                            }}
                          >
                            OVERDUE
                          </span>
                        )}

                        {proposal.status !== 'completed' && (
                          <div className="flex gap-xxs ml-xs">
                            <button
                              type="button"
                              className="cp-button-secondary"
                              style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                              onClick={() => setEditingActionId(act.id)}
                              title="Edit action"
                              data-testid={`btn-edit-action-${act.id}`}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              className="cp-button-secondary"
                              style={{ padding: '2px 6px', fontSize: '0.75rem', color: '#b91c1c' }}
                              onClick={() => onDeleteAction(act.id)}
                              title="Delete action"
                              data-testid={`btn-delete-action-${act.id}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-md text-small text-muted flex-wrap">
                      <span className="flex items-center gap-xxs">
                        <User size={13} /> {act.assignee}
                      </span>
                      {act.dueDate && (
                        <span className="flex items-center gap-xxs" style={{ color: isOverdue ? '#b91c1c' : undefined }}>
                          <Calendar size={13} /> Due: {act.dueDate}
                        </span>
                      )}
                      {act.completedAt && (
                        <span className="flex items-center gap-xxs" style={{ color: '#15803d' }}>
                          <CheckCircle2 size={13} /> Completed: {act.completedAt}
                        </span>
                      )}
                    </div>

                    {act.notes && (
                      <div className="mt-xs text-small" style={{ color: '#475569', fontStyle: 'italic' }}>
                        Note: {act.notes}
                      </div>
                    )}

                    {act.completionEvidence && (
                      <div className="mt-xxs text-small" style={{ color: '#15803d' }}>
                        Evidence: {act.completionEvidence}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Proposal Closure Section */}
      <div
        style={{
          borderTop: '2px solid #e2e8f0',
          paddingTop: 'var(--spacing-md)',
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-xs mb-sm">
          <div>
            <h4 className="heading-small" style={{ margin: 0 }}>
              Implementation Closure Verification
            </h4>
            <p className="text-small text-muted" style={{ margin: 0 }}>
              Formally close the proposal when all actions are verified as complete.
            </p>
          </div>

          {proposal.status === 'in_implementation' && (
            <button
              type="button"
              className="cp-button-primary"
              style={{ backgroundColor: '#166534', borderColor: '#15803d' }}
              onClick={() => setShowClosureForm(!showClosureForm)}
              data-testid="btn-open-closure-form"
            >
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {showClosureForm ? 'Cancel Verification' : 'Verify & Complete Proposal'}
            </button>
          )}
        </div>

        {/* Warning if ineligible for closure */}
        {proposal.status === 'in_implementation' && !completionCheck.allowed && (
          <div
            className="mb-sm text-small"
            style={{
              backgroundColor: '#fffbeb',
              borderLeft: '4px solid #f59e0b',
              color: '#b45309',
              padding: '8px 12px',
              borderRadius: '4px',
            }}
          >
            <strong>Prerequisite:</strong> {completionCheck.reason}
          </div>
        )}

        {/* Closure Form */}
        {showClosureForm && (
          <form
            onSubmit={handleClosureSubmit}
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: 'var(--spacing-md)',
              marginTop: 'var(--spacing-sm)',
            }}
            data-testid="closure-verification-form"
          >
            <h5 className="heading-small mb-sm" style={{ color: '#14532d' }}>
              Record Formal Implementation Closure Sign-Off
            </h5>

            {closureError && (
              <div className="mb-sm" style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
                {closureError}
              </div>
            )}

            <div className="grid grid-2 gap-md mb-sm">
              <div>
                <label htmlFor="closure-signee" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Verifying Officer Name: *
                </label>
                <input
                  id="closure-signee"
                  type="text"
                  required
                  className="cp-input"
                  placeholder="e.g. Dr. Eleanor Vance"
                  value={closureSignee}
                  onChange={(e) => setClosureSignee(e.target.value)}
                  data-testid="input-closure-signee"
                />
              </div>

              <div>
                <label htmlFor="closure-role" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Role / Institutional Capacity:
                </label>
                <input
                  id="closure-role"
                  type="text"
                  className="cp-input"
                  placeholder="e.g. Module Leader / Programme Director"
                  value={closureRole}
                  onChange={(e) => setClosureRole(e.target.value)}
                  data-testid="input-closure-role"
                />
              </div>
            </div>

            <div className="mb-sm">
              <label htmlFor="closure-basis" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                Verification Basis & Evidence Source: *
              </label>
              <textarea
                id="closure-basis"
                rows={2}
                required
                className="cp-input"
                placeholder="Describe how completion was checked (e.g. Verified updated VLE module shell, confirmed handbook publication)..."
                value={closureBasis}
                onChange={(e) => setClosureBasis(e.target.value)}
                data-testid="textarea-closure-basis"
              />
            </div>

            <div className="mb-sm">
              <label htmlFor="closure-notes" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                Closure Notes / Operational Justification: {actions.length === 0 ? '* (Required for zero-action plans)' : ''}
              </label>
              <input
                id="closure-notes"
                type="text"
                required={actions.length === 0}
                className="cp-input"
                placeholder={
                  actions.length === 0
                    ? 'State operational rationale why no specific implementation actions were required...'
                    : 'e.g. Verified on live LMS shell; students notified via announcement'
                }
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                data-testid="input-closure-notes"
              />
            </div>

            <div className="mb-md">
              <label className="flex items-center gap-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={closureConfirmed}
                  onChange={(e) => setClosureConfirmed(e.target.checked)}
                  data-testid="checkbox-closure-confirm"
                />
                <span className="text-small" style={{ fontWeight: 600, color: '#14532d' }}>
                  I confirm that all planned implementation actions have been reviewed and this curriculum change is operational.
                </span>
              </label>
            </div>

            <div className="flex gap-xs">
              <button
                type="submit"
                className="cp-button-primary"
                style={{ backgroundColor: '#15803d', borderColor: '#166534' }}
                data-testid="btn-confirm-closure"
              >
                Sign Off & Close Proposal
              </button>
              <button
                type="button"
                className="cp-button-secondary"
                onClick={() => setShowClosureForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
