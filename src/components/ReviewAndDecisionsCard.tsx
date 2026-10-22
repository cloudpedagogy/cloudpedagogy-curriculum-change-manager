import React, { useState } from 'react';
import type {
  ChangeProposal,
  GovernanceReview,
  GovernanceDecision,
  DecisionOutcome,
  ProposalStatus,
} from '../types';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { checkTransitionEligibility } from '../utils/governance';

interface ReviewAndDecisionsCardProps {
  proposal: ChangeProposal;
  onAddReview: (review: Omit<GovernanceReview, 'id'>) => void;
  onRecordDecision: (
    decision: Omit<GovernanceDecision, 'id'>
  ) => { success: boolean; message?: string } | void;
  onTransitionStatus: (
    newStatus: ProposalStatus,
    actor: string,
    reason?: string
  ) => { success: boolean; message?: string };
}

export const ReviewAndDecisionsCard: React.FC<ReviewAndDecisionsCardProps> = ({
  proposal,
  onAddReview,
  onRecordDecision,
  onTransitionStatus,
}) => {
  // Tabs within this card: Reviews, Decisions, and Lifecycle Actions
  const [subTab, setSubTab] = useState<'reviews' | 'decisions' | 'lifecycle'>('lifecycle');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [reviewFindings, setReviewFindings] = useState('');
  const [reviewRecommendations, setReviewRecommendations] = useState('');
  const [reviewRevisionRequests, setReviewRevisionRequests] = useState('');
  const [reviewConditions, setReviewConditions] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Decision form state
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [decisionOutcome, setDecisionOutcome] = useState<DecisionOutcome>('approved');
  const [decisionMaker, setDecisionMaker] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [decisionConditions, setDecisionConditions] = useState('');
  const [decisionVersionRef, setDecisionVersionRef] = useState('');
  const [decisionError, setDecisionError] = useState('');

  // Transition form state
  const [transitionActor, setTransitionActor] = useState(proposal.ownerName || 'Governance Lead');
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionError, setTransitionError] = useState('');
  const [transitionSuccess, setTransitionSuccess] = useState('');

  // Pre-condition checking for current status
  const submitCheck = checkTransitionEligibility(proposal, 'submitted');
  const reviewCheck = checkTransitionEligibility(proposal, 'under_review');
  const approveCheck = checkTransitionEligibility(proposal, 'approved');
  const rejectCheck = checkTransitionEligibility(proposal, 'rejected');
  const returnCheck = checkTransitionEligibility(proposal, 'draft');
  const implementCheck = checkTransitionEligibility(proposal, 'in_implementation');

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewerName.trim()) {
      setReviewError('Reviewer name is required.');
      return;
    }
    if (!reviewFindings.trim()) {
      setReviewError('Review findings are required.');
      return;
    }

    onAddReview({
      reviewerName: reviewerName.trim(),
      reviewerRole: reviewerRole.trim() || undefined,
      reviewDate: new Date().toISOString().split('T')[0],
      findings: reviewFindings.trim(),
      recommendations: reviewRecommendations.trim() || 'Approved subject to standard quality oversight.',
      revisionRequests: reviewRevisionRequests.trim() || undefined,
      conditions: reviewConditions.trim() || undefined,
    });

    // Reset form
    setReviewerName('');
    setReviewerRole('');
    setReviewFindings('');
    setReviewRecommendations('');
    setReviewRevisionRequests('');
    setReviewConditions('');
    setShowReviewForm(false);
  };

  const handleRecordDecision = (e: React.FormEvent) => {
    e.preventDefault();
    setDecisionError('');

    if (proposal.status !== 'under_review') {
      setDecisionError('Formal decisions can only be recorded when proposal is under committee review.');
      return;
    }

    if (!decisionMaker.trim()) {
      setDecisionError('Decision-maker name or body is required.');
      return;
    }
    if (!decisionRationale.trim()) {
      setDecisionError('Formal decision rationale is required.');
      return;
    }

    const res = onRecordDecision({
      outcome: decisionOutcome,
      decisionMaker: decisionMaker.trim(),
      decisionDate: new Date().toISOString().split('T')[0],
      decisionRationale: decisionRationale.trim(),
      conditions: decisionConditions.trim() || undefined,
      targetSnapshotId: decisionVersionRef.trim() || undefined,
    });

    if (res && !res.success) {
      setDecisionError(res.message || 'Failed to record decision.');
      return;
    }

    // Reset form
    setDecisionMaker('');
    setDecisionRationale('');
    setDecisionConditions('');
    setDecisionVersionRef('');
    setShowDecisionForm(false);
  };

  const handleExecuteTransition = (targetStatus: ProposalStatus) => {
    setTransitionError('');
    setTransitionSuccess('');

    if (!transitionActor.trim()) {
      setTransitionError('Please identify the recorded actor for this governance action.');
      return;
    }

    const res = onTransitionStatus(targetStatus, transitionActor.trim(), transitionReason.trim() || undefined);
    if (!res.success) {
      setTransitionError(res.message || `Failed to transition to ${targetStatus}`);
    } else {
      setTransitionSuccess(`Proposal successfully transitioned to ${targetStatus.replace('_', ' ').toUpperCase()}`);
      setTransitionReason('');
      setTimeout(() => setTransitionSuccess(''), 4000);
    }
  };

  return (
    <div className="cp-card mb-lg" data-testid="review-decisions-card">
      <div className="flex justify-between items-start flex-wrap gap-sm mb-md">
        <div>
          <h3 className="heading-medium mb-xs flex items-center gap-xs">
            <ShieldCheck size={20} color="var(--color-primary-accent, #0056b3)" />
            Formal Review, Decisions & Governance Lifecycle
          </h3>
          <p className="text-small text-muted">
            Manage stage progression, record committee reviews, and preserve immutable decision logs.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-xs">
          <span
            className="badge"
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor:
                proposal.status === 'approved'
                  ? '#dcfce7'
                  : proposal.status === 'in_implementation'
                  ? '#dbeafe'
                  : proposal.status === 'completed'
                  ? '#e0e7ff'
                  : proposal.status === 'rejected'
                  ? '#fee2e2'
                  : proposal.status === 'under_review'
                  ? '#fef3c7'
                  : '#f1f5f9',
              color:
                proposal.status === 'approved'
                  ? '#166534'
                  : proposal.status === 'in_implementation'
                  ? '#1e40af'
                  : proposal.status === 'completed'
                  ? '#3730a3'
                  : proposal.status === 'rejected'
                  ? '#991b1b'
                  : proposal.status === 'under_review'
                  ? '#92400e'
                  : '#475569',
              border: '1px solid currentColor',
            }}
          >
            CURRENT STATUS: {proposal.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Subtab navigation */}
      <div className="flex gap-xs mb-md" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setSubTab('lifecycle')}
          className="cp-button-secondary"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            backgroundColor: subTab === 'lifecycle' ? '#1e293b' : '#ffffff',
            color: subTab === 'lifecycle' ? '#ffffff' : '#334155',
            fontWeight: subTab === 'lifecycle' ? 600 : 500,
          }}
          data-testid="tab-lifecycle"
        >
          Lifecycle Controls
        </button>

        <button
          type="button"
          onClick={() => setSubTab('reviews')}
          className="cp-button-secondary"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            backgroundColor: subTab === 'reviews' ? '#1e293b' : '#ffffff',
            color: subTab === 'reviews' ? '#ffffff' : '#334155',
            fontWeight: subTab === 'reviews' ? 600 : 500,
          }}
          data-testid="tab-reviews"
        >
          Committee Reviews ({proposal.reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setSubTab('decisions')}
          className="cp-button-secondary"
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            backgroundColor: subTab === 'decisions' ? '#1e293b' : '#ffffff',
            color: subTab === 'decisions' ? '#ffffff' : '#334155',
            fontWeight: subTab === 'decisions' ? 600 : 500,
          }}
          data-testid="tab-decisions"
        >
          Formal Decisions ({proposal.decisions.length})
        </button>
      </div>

      {/* SUBTAB 1: LIFECYCLE CONTROLS */}
      {subTab === 'lifecycle' && (
        <div>
          {/* Notification Messages */}
          {transitionError && (
            <div
              className="mb-md"
              style={{
                backgroundColor: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                color: '#991b1b',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
              }}
              data-testid="transition-error"
            >
              <strong>Cannot proceed:</strong> {transitionError}
            </div>
          )}

          {transitionSuccess && (
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
              data-testid="transition-success"
            >
              {transitionSuccess}
            </div>
          )}

          {/* Actor & Reason Input Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <h4 className="heading-small mb-xs" style={{ fontSize: '0.9rem' }}>
              Governance Action Context
            </h4>
            <div className="grid grid-2 gap-md">
              <div>
                <label htmlFor="transition-actor" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Recorded Actor / Committee Chair:
                </label>
                <input
                  id="transition-actor"
                  type="text"
                  className="cp-input"
                  placeholder="e.g. Dr. Eleanor Vance (Chair, QA Board)"
                  value={transitionActor}
                  onChange={(e) => setTransitionActor(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="transition-reason" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Contextual Note / Reason for Action:
                </label>
                <input
                  id="transition-reason"
                  type="text"
                  className="cp-input"
                  placeholder="e.g. Submitting for autumn review cycle; meeting quorum"
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contextual Action Buttons depending on current state */}
          <div
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: 'var(--spacing-md)',
              backgroundColor: '#ffffff',
            }}
          >
            <h4 className="heading-small mb-sm">Available Validated Stage Transitions</h4>

            <div className="flex flex-wrap gap-sm">
              {/* Draft -> Submitted */}
              {proposal.status === 'draft' && (
                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    className="cp-button-primary"
                    disabled={!submitCheck.allowed}
                    onClick={() => handleExecuteTransition('submitted')}
                    title={submitCheck.allowed ? 'Submit proposal for formal governance review' : submitCheck.reason}
                    data-testid="btn-submit-proposal"
                  >
                    Submit for Review
                  </button>
                  {!submitCheck.allowed && (
                    <span className="text-small text-muted flex items-center gap-xxs" style={{ color: '#b91c1c' }}>
                      <AlertCircle size={14} /> {submitCheck.reason}
                    </span>
                  )}
                </div>
              )}

              {/* Submitted -> Under Review */}
              {proposal.status === 'submitted' && (
                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    className="cp-button-primary"
                    disabled={!reviewCheck.allowed}
                    onClick={() => handleExecuteTransition('under_review')}
                    title="Move status to Under Review"
                    data-testid="btn-start-review"
                  >
                    Begin Committee Review
                  </button>
                </div>
              )}

              {/* Under Review -> Return to Draft */}
              {proposal.status === 'under_review' && (
                <button
                  type="button"
                  className="cp-button-secondary"
                  disabled={!returnCheck.allowed}
                  onClick={() => handleExecuteTransition('draft')}
                  title="Return to Draft for revision based on committee requests"
                  data-testid="btn-return-revision"
                >
                  <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Return for Revision (Draft)
                </button>
              )}

              {/* Under Review -> Approved (requires decision) */}
              {proposal.status === 'under_review' && (
                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    className="cp-button-primary"
                    disabled={!approveCheck.allowed}
                    onClick={() => handleExecuteTransition('approved')}
                    style={{ backgroundColor: '#15803d', borderColor: '#166534' }}
                    title={approveCheck.allowed ? 'Confirm Proposal Approval' : approveCheck.reason}
                    data-testid="btn-approve-proposal"
                  >
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Approve Proposal
                  </button>
                  {!approveCheck.allowed && (
                    <span className="text-small" style={{ color: '#b91c1c' }}>
                      <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {approveCheck.reason}
                    </span>
                  )}
                </div>
              )}

              {/* Under Review -> Rejected */}
              {proposal.status === 'under_review' && (
                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    className="cp-button-danger"
                    disabled={!rejectCheck.allowed}
                    onClick={() => handleExecuteTransition('rejected')}
                    title={rejectCheck.allowed ? 'Confirm Proposal Rejection' : rejectCheck.reason}
                    data-testid="btn-reject-proposal"
                  >
                    <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Reject Proposal
                  </button>
                  {!rejectCheck.allowed && (
                    <span className="text-small" style={{ color: '#b91c1c' }}>
                      <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {rejectCheck.reason}
                    </span>
                  )}
                </div>
              )}

              {/* Approved -> In Implementation */}
              {proposal.status === 'approved' && (
                <button
                  type="button"
                  className="cp-button-primary"
                  disabled={!implementCheck.allowed}
                  onClick={() => handleExecuteTransition('in_implementation')}
                  style={{ backgroundColor: '#1d4ed8' }}
                  data-testid="btn-start-implementation"
                >
                  Begin Implementation Tracking
                </button>
              )}

              {/* In Implementation -> Note to check closure */}
              {proposal.status === 'in_implementation' && (
                <div className="text-small text-muted" style={{ padding: '6px 0' }}>
                  Implementation is active. Navigate to the <strong>Implementation Plan</strong> tab to track actions and complete closure verification.
                </div>
              )}

              {/* Withdrawal (From Draft, Submitted, or Under Review) */}
              {(proposal.status === 'draft' || proposal.status === 'submitted' || proposal.status === 'under_review') && (
                <button
                  type="button"
                  className="cp-button-secondary"
                  onClick={() => {
                    if (window.confirm('Are you sure you wish to withdraw this proposal? It will remain in historical records.')) {
                      handleExecuteTransition('withdrawn');
                    }
                  }}
                  style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                  data-testid="btn-withdraw-proposal"
                >
                  Withdraw Proposal
                </button>
              )}

              {/* Reopen from Rejected or Withdrawn */}
              {(proposal.status === 'rejected' || proposal.status === 'withdrawn') && (
                <button
                  type="button"
                  className="cp-button-secondary"
                  onClick={() => handleExecuteTransition('draft')}
                  data-testid="btn-reopen-proposal"
                >
                  Reopen as Draft (Amendable)
                </button>
              )}
            </div>

            {/* Hint for approved/under_review to record decision */}
            {proposal.status === 'under_review' && !approveCheck.allowed && (
              <div
                className="mt-sm text-small"
                style={{ backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '4px', color: '#1e40af' }}
              >
                Tip: Switch to the <strong>Formal Decisions</strong> subtab above to record an "Approved" or "Rejected" committee outcome before finalizing the transition.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: COMMITTEE REVIEWS */}
      {subTab === 'reviews' && (
        <div>
          <div className="flex justify-between items-center mb-md">
            <h4 className="heading-small" style={{ margin: 0 }}>
              Recorded Committee & Peer Reviews
            </h4>
            <button
              type="button"
              className="cp-button-primary"
              style={{ fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowReviewForm(!showReviewForm)}
              data-testid="btn-add-review-toggle"
            >
              <PlusCircle size={14} />
              {showReviewForm ? 'Cancel' : 'Record New Review'}
            </button>
          </div>

          {/* New Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleCreateReview}
              style={{
                border: '1px solid #93c5fd',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)',
              }}
              data-testid="review-form"
            >
              <h5 className="heading-small mb-sm" style={{ color: '#1e3a8a' }}>
                Add Formal Committee / Peer Review Record
              </h5>

              {reviewError && (
                <div
                  className="mb-sm"
                  style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {reviewError}
                </div>
              )}

              <div className="grid grid-2 gap-md mb-sm">
                <div>
                  <label htmlFor="rev-name" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Reviewer Name: *
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    className="cp-input"
                    placeholder="e.g. Prof. Marcus Thorne"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="rev-role" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Reviewer Role / Committee:
                  </label>
                  <input
                    id="rev-role"
                    type="text"
                    className="cp-input"
                    placeholder="e.g. External Reviewer, Chair of Academic Quality"
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-sm">
                <label htmlFor="rev-findings" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Findings & Assessment: *
                </label>
                <textarea
                  id="rev-findings"
                  rows={3}
                  required
                  className="cp-input"
                  placeholder="Detail academic appraisal, alignment with standards, and pedagogical soundness..."
                  value={reviewFindings}
                  onChange={(e) => setReviewFindings(e.target.value)}
                />
              </div>

              <div className="grid grid-2 gap-md mb-sm">
                <div>
                  <label htmlFor="rev-recs" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Recommendations:
                  </label>
                  <textarea
                    id="rev-recs"
                    rows={2}
                    className="cp-input"
                    placeholder="e.g. Recommend approval subject to staff guidance session..."
                    value={reviewRecommendations}
                    onChange={(e) => setReviewRecommendations(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="rev-revisions" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Requests for Revision (if returning):
                  </label>
                  <textarea
                    id="rev-revisions"
                    rows={2}
                    className="cp-input"
                    placeholder="Required edits before approval..."
                    value={reviewRevisionRequests}
                    onChange={(e) => setReviewRevisionRequests(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-md">
                <label htmlFor="rev-conditions" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Optional Conditions:
                </label>
                <input
                  id="rev-conditions"
                  type="text"
                  className="cp-input"
                  placeholder="e.g. Provide exemplar assignment before start of semester"
                  value={reviewConditions}
                  onChange={(e) => setReviewConditions(e.target.value)}
                />
              </div>

              <div className="flex gap-xs">
                <button type="submit" className="cp-button-primary" data-testid="btn-save-review">
                  Save Review Record
                </button>
                <button
                  type="button"
                  className="cp-button-secondary"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of reviews */}
          {proposal.reviews.length === 0 ? (
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
              No formal reviews recorded yet. Click "Record New Review" to add committee or peer findings.
            </div>
          ) : (
            <div className="flex flex-col gap-sm" data-testid="review-list">
              {proposal.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#ffffff',
                  }}
                  data-testid={`review-item-${rev.id}`}
                >
                  <div className="flex justify-between items-start flex-wrap gap-xs mb-xs">
                    <div>
                      <strong>{rev.reviewerName}</strong>
                      {rev.reviewerRole && (
                        <span className="text-small text-muted ml-xs">({rev.reviewerRole})</span>
                      )}
                    </div>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {rev.reviewDate}
                    </span>
                  </div>

                  <div className="mb-xs text-small" style={{ color: '#1e293b' }}>
                    <strong>Findings:</strong> {rev.findings}
                  </div>

                  {rev.recommendations && (
                    <div className="mb-xs text-small" style={{ color: '#166534' }}>
                      <strong>Recommendations:</strong> {rev.recommendations}
                    </div>
                  )}

                  {rev.revisionRequests && (
                    <div className="mb-xs text-small" style={{ color: '#991b1b' }}>
                      <strong>Revision Required:</strong> {rev.revisionRequests}
                    </div>
                  )}

                  {rev.conditions && (
                    <div className="text-small" style={{ color: '#854d0e' }}>
                      <strong>Conditions:</strong> {rev.conditions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: FORMAL DECISIONS */}
      {subTab === 'decisions' && (
        <div>
          <div className="flex justify-between items-center mb-md">
            <div>
              <h4 className="heading-small" style={{ margin: 0 }}>
                Formal Governance Decision Records
              </h4>
              <p className="text-small text-muted" style={{ margin: 0 }}>
                Decisions are append-only historical records and cannot be silently overwritten.
              </p>
            </div>

            <button
              type="button"
              className="cp-button-primary"
              style={{ fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowDecisionForm(!showDecisionForm)}
              disabled={proposal.status !== 'under_review'}
              title={
                proposal.status !== 'under_review'
                  ? 'Formal decisions can only be recorded when the proposal is Under Review'
                  : undefined
              }
              data-testid="btn-add-decision-toggle"
            >
              <PlusCircle size={14} />
              {showDecisionForm ? 'Cancel' : 'Record Formal Decision'}
            </button>
          </div>

          {/* Decision Authoring Form */}
          {showDecisionForm && (
            <form
              onSubmit={handleRecordDecision}
              style={{
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-md)',
              }}
              data-testid="decision-form"
            >
              <h5 className="heading-small mb-sm" style={{ color: '#0f172a' }}>
                Record Formal Decision
              </h5>

              {decisionError && (
                <div
                  className="mb-sm"
                  style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {decisionError}
                </div>
              )}

              <div className="grid grid-2 gap-md mb-sm">
                <div>
                  <label htmlFor="dec-outcome" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Decision Outcome: *
                  </label>
                  <select
                    id="dec-outcome"
                    className="cp-input"
                    value={decisionOutcome}
                    onChange={(e) => setDecisionOutcome(e.target.value as DecisionOutcome)}
                    data-testid="select-decision-outcome"
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="returned_for_revision">Returned for Revision</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dec-maker" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Decision Maker / Committee: *
                  </label>
                  <input
                    id="dec-maker"
                    type="text"
                    required
                    className="cp-input"
                    placeholder="e.g. Faculty Academic Board / Board of Studies"
                    value={decisionMaker}
                    onChange={(e) => setDecisionMaker(e.target.value)}
                    data-testid="input-decision-maker"
                  />
                </div>
              </div>

              <div className="mb-sm">
                <label htmlFor="dec-rationale" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                  Formal Decision Rationale: *
                </label>
                <textarea
                  id="dec-rationale"
                  rows={3}
                  required
                  className="cp-input"
                  placeholder="Record justification, committee vote, or reasons for approval / rejection..."
                  value={decisionRationale}
                  onChange={(e) => setDecisionRationale(e.target.value)}
                  data-testid="textarea-decision-rationale"
                />
              </div>

              <div className="grid grid-2 gap-md mb-md">
                <div>
                  <label htmlFor="dec-conditions" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Conditions Attached to Decision:
                  </label>
                  <input
                    id="dec-conditions"
                    type="text"
                    className="cp-input"
                    placeholder="e.g. Subject to external examiner concurrence"
                    value={decisionConditions}
                    onChange={(e) => setDecisionConditions(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="dec-version" className="label-text mb-xs" style={{ display: 'block', fontWeight: 600 }}>
                    Target Version Snapshot Reference:
                  </label>
                  <input
                    id="dec-version"
                    type="text"
                    className="cp-input"
                    placeholder="e.g. Version 1.1 / Assessment Design Final"
                    value={decisionVersionRef}
                    onChange={(e) => setDecisionVersionRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-xs">
                <button type="submit" className="cp-button-primary" data-testid="btn-save-decision">
                  Save Decision Record
                </button>
                <button
                  type="button"
                  className="cp-button-secondary"
                  onClick={() => setShowDecisionForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Historical Decisions List */}
          {proposal.decisions.length === 0 ? (
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
              No formal governance decisions recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-sm" data-testid="decision-list">
              {proposal.decisions.map((dec, idx) => {
                const isApproved = dec.outcome === 'approved';
                const isRejected = dec.outcome === 'rejected';

                return (
                  <div
                    key={dec.id}
                    style={{
                      border: `1px solid ${isApproved ? '#86efac' : isRejected ? '#fca5a5' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      padding: 'var(--spacing-md)',
                      backgroundColor: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#ffffff',
                    }}
                    data-testid={`decision-item-${dec.id}`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-xs mb-xs">
                      <div className="flex items-center gap-xs">
                        <span title="Immutable decision record">
                          <Lock size={14} color="#64748b" />
                        </span>
                        <strong>
                          {dec.decisionMaker} — Decision #{idx + 1}
                        </strong>
                        <span
                          className="badge"
                          style={{
                            fontWeight: 700,
                            backgroundColor: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                            color: isApproved ? '#166534' : isRejected ? '#991b1b' : '#92400e',
                          }}
                        >
                          {dec.outcome.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="badge" style={{ backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1' }}>
                        {dec.decisionDate}
                      </span>
                    </div>

                    <div className="text-small mb-xs" style={{ color: '#0f172a' }}>
                      <strong>Rationale:</strong> {dec.decisionRationale}
                    </div>

                    {dec.conditions && (
                      <div className="text-small mb-xs" style={{ color: '#854d0e' }}>
                        <strong>Conditions Attached:</strong> {dec.conditions}
                      </div>
                    )}

                    {dec.targetSnapshotId && (
                      <div className="text-small text-muted">
                        <strong>Snapshot Reference:</strong> {dec.targetSnapshotId}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
