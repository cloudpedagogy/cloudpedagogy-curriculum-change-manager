import React, { useState } from 'react';
import type {
  ChangeProposal,
  ChangeCategory,
  Version,
  ChangeLogEntry,
  ProposalStatus,
  ImpactDimensionKey,
  ImpactDimension,
  GovernanceReview,
  GovernanceDecision,
  ImplementationAction,
  ProposalClosure,
} from '../types';
import { VersionManagementCard } from './VersionManagementCard';
import { VersionComparisonCard } from './VersionComparisonCard';
import { ChangeLogCard } from './ChangeLogCard';
import { OutputSummaryCard } from './OutputSummaryCard';
import { EducationalImpactCard } from './EducationalImpactCard';
import { ReviewAndDecisionsCard } from './ReviewAndDecisionsCard';
import { ImplementationTrackerCard } from './ImplementationTrackerCard';
import { GovernanceHistoryCard } from './GovernanceHistoryCard';
import {
  FileText,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  History,
  CheckCircle,
  ShieldAlert,
  ListChecks,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface ProposalEditorProps {
  proposal: ChangeProposal;
  onUpdateProposal: (updates: Partial<ChangeProposal>) => void;
  onAddVersion: (v: Version) => void;
  onUpdateVersion: (v: Version) => void;
  onRemoveVersion: (id: string) => void;
  onUpdateChangeLog: (entries: ChangeLogEntry[]) => void;
  // Batch 2 governance handlers
  onTransitionStatus: (
    newStatus: ProposalStatus,
    actor: string,
    reason?: string
  ) => { success: boolean; message?: string };
  onUpdateImpactDimension: (
    key: ImpactDimensionKey,
    updates: Partial<ImpactDimension>
  ) => void;
  onUpdateOverallImpactNotes: (notes: string) => void;
  onAddReview: (review: Omit<GovernanceReview, 'id'>) => void;
  onRecordDecision: (
    decision: Omit<GovernanceDecision, 'id'>
  ) => { success: boolean; message?: string } | void;
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

export type EditorTab =
  | 'basics'
  | 'context'
  | 'rationale'
  | 'versions'
  | 'impact'
  | 'governance'
  | 'implementation'
  | 'notes'
  | 'history'
  | 'summary';

const STATUS_GUIDANCE: Record<ProposalStatus, { label: string; bg: string; color: string; border: string; nextAction: string; targetTab: EditorTab }> = {
  draft: {
    label: 'Draft',
    bg: '#f1f5f9',
    color: '#334155',
    border: '#cbd5e1',
    nextAction: 'Complete proposal details and Educational Impact Assessment, then Submit for Review.',
    targetTab: 'impact',
  },
  submitted: {
    label: 'Submitted',
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
    nextAction: 'Ready for committee assignment. Advance to "Under Review" or record initial reviewer findings.',
    targetTab: 'governance',
  },
  under_review: {
    label: 'Under Review',
    bg: '#fef9c3',
    color: '#854d0e',
    border: '#fef08a',
    nextAction: 'Committee review active. Record reviewer recommendations and author formal governance decision.',
    targetTab: 'governance',
  },
  approved: {
    label: 'Approved',
    bg: '#dcfce7',
    color: '#166534',
    border: '#86efac',
    nextAction: 'Proposal approved by committee. Initialize implementation actions and begin operational rollout.',
    targetTab: 'implementation',
  },
  in_implementation: {
    label: 'In Implementation',
    bg: '#dbeafe',
    color: '#1e40af',
    border: '#bfdbfe',
    nextAction: 'Execution active. Complete all operational action items and record final closure verification sign-off.',
    targetTab: 'implementation',
  },
  completed: {
    label: 'Completed',
    bg: '#e0e7ff',
    color: '#3730a3',
    border: '#c7d2fe',
    nextAction: 'Proposal fully implemented and closed with verified sign-off. Historical governance record preserved.',
    targetTab: 'summary',
  },
  rejected: {
    label: 'Rejected',
    bg: '#fee2e2',
    color: '#991b1b',
    border: '#fca5a5',
    nextAction: 'Proposal formally rejected by governance committee. Historical record preserved; can be reopened if revised.',
    targetTab: 'governance',
  },
  withdrawn: {
    label: 'Withdrawn',
    bg: '#f1f5f9',
    color: '#64748b',
    border: '#cbd5e1',
    nextAction: 'Proposal withdrawn by proposer. Historical record preserved; can be reopened as draft if desired.',
    targetTab: 'history',
  },
};

export const ProposalEditor: React.FC<ProposalEditorProps> = ({
  proposal,
  onUpdateProposal,
  onAddVersion,
  onUpdateVersion,
  onRemoveVersion,
  onUpdateChangeLog,
  onTransitionStatus,
  onUpdateImpactDimension,
  onUpdateOverallImpactNotes,
  onAddReview,
  onRecordDecision,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  onVerifyAndClose,
  onReopen,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('basics');

  const tabs: Array<{ id: EditorTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'basics', label: '1. Basic Details', icon: <FileText size={16} /> },
    { id: 'context', label: '2. Curriculum Context', icon: <Compass size={16} /> },
    { id: 'rationale', label: '3. Change & Rationale', icon: <Sparkles size={16} /> },
    { id: 'versions', label: '4. Snapshots & Log', icon: <History size={16} /> },
    { id: 'impact', label: '5. Educational Impact', icon: <ShieldAlert size={16} /> },
    { id: 'governance', label: '6. Review & Decisions', icon: <ShieldCheck size={16} />, badge: proposal.decisions.length },
    { id: 'implementation', label: '7. Implementation Plan', icon: <ListChecks size={16} />, badge: proposal.implementationActions.length },
    { id: 'notes', label: '8. Governance Notes', icon: <FileCheck size={16} /> },
    { id: 'history', label: '9. Governance History', icon: <History size={16} />, badge: proposal.events.length },
    { id: 'summary', label: '10. Output Summary', icon: <CheckCircle size={16} /> },
  ];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const handleContextChange = (field: string, value: string) => {
    onUpdateProposal({
      context: {
        ...proposal.context,
        [field]: value,
      },
    });
  };

  const handleInstitutionalNotesChange = (field: string, value: string) => {
    onUpdateProposal({
      institutionalNotes: {
        ...proposal.institutionalNotes,
        [field]: value,
      },
    });
  };

  const statusInfo = STATUS_GUIDANCE[proposal.status] || STATUS_GUIDANCE.draft;

  return (
    <div className="proposal-editor-container" data-testid="proposal-editor">
      {/* Proposal Header Banner */}
      <div
        className="cp-card cp-hide-print"
        style={{
          borderBottom: '2px solid var(--color-border-strong)',
          marginBottom: 'var(--spacing-md)',
          backgroundColor: '#fff',
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-sm">
          <div>
            <div className="flex items-center gap-xs mb-xs flex-wrap">
              <span className="badge" style={{ backgroundColor: '#000', color: '#fff' }}>
                {proposal.ref}
              </span>
              <span
                className="badge"
                style={{
                  backgroundColor: statusInfo.bg,
                  color: statusInfo.color,
                  border: `1px solid ${statusInfo.border}`,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                STATUS: {statusInfo.label.toUpperCase()}
              </span>
              <span className="text-small text-muted">
                Last updated: {new Date(proposal.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', margin: '4px 0' }}>{proposal.title}</h1>
            <p className="text-small text-muted mb-0">
              {proposal.context.programmeName ? `${proposal.context.programmeName} &middot; ` : ''}
              {proposal.context.moduleName ? `${proposal.context.moduleName} &middot; ` : ''}
              Proposer: {proposal.ownerName || 'Unassigned'} {proposal.ownerRole ? `(${proposal.ownerRole})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              className="cp-button-secondary"
              onClick={() => setActiveTab('summary')}
              title="Preview Printable Report"
              data-testid="btn-view-summary-report"
            >
              <FileText size={16} /> View Report
            </button>
          </div>
        </div>

        {/* Lifecycle Status & Obvious Next Action Callout Strip */}
        <div
          style={{
            backgroundColor: statusInfo.bg,
            border: `1px solid ${statusInfo.border}`,
            borderRadius: '6px',
            padding: '8px 14px',
            marginTop: 'var(--spacing-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
          data-testid="status-guidance-bar"
        >
          <div className="flex items-center gap-xs">
            <span style={{ fontWeight: 700, color: statusInfo.color, fontSize: '0.85rem' }}>
              Governance Guidance:
            </span>
            <span style={{ color: statusInfo.color, fontSize: '0.85rem' }}>
              {statusInfo.nextAction}
            </span>
          </div>

          <button
            type="button"
            className="cp-button-link"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: statusInfo.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
            }}
            onClick={() => setActiveTab(statusInfo.targetTab)}
            data-testid="btn-guidance-jump"
          >
            Take action now <ChevronRight size={14} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div
          className="flex gap-xs mt-md"
          style={{
            borderTop: '1px solid var(--color-border-default)',
            paddingTop: 'var(--spacing-sm)',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--color-primary-accent, #0056b3)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                data-testid={`tab-${tab.id}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && Number(tab.badge) > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontWeight: 700,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Basic Details */}
      {activeTab === 'basics' && (
        <div className="cp-card cp-hide-print mb-lg">
          <h2 className="cp-card-title mb-md">
            <FileText size={20} /> Stage 1: Proposal Basic Information
          </h2>

          <div className="form-group mb-md">
            <label htmlFor="proposal-title">Proposal Title *</label>
            <input
              id="proposal-title"
              type="text"
              value={proposal.title}
              onChange={(e) => onUpdateProposal({ title: e.target.value })}
              placeholder="e.g. Master of Public Health — AI Integrity & Assessment Redesign"
              className="cp-input"
              data-testid="input-proposal-title"
            />
          </div>

          <div className="form-row mb-md">
            <div className="form-group">
              <label htmlFor="proposal-category">Change Category</label>
              <select
                id="proposal-category"
                value={proposal.category}
                onChange={(e) => onUpdateProposal({ category: e.target.value as ChangeCategory })}
                className="cp-input"
                data-testid="select-proposal-category"
              >
                <option value="minor_amendment">Minor Amendment (Module Level)</option>
                <option value="major_modification">Major Modification (Programme Level)</option>
                <option value="ai_guidance_update">AI Guidance & Integrity Update</option>
                <option value="assessment_redesign">Assessment Structure Redesign</option>
                <option value="learning_outcomes">Learning Outcomes Revision</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="proposal-owner-name">Proposer / Responsible Person *</label>
              <input
                id="proposal-owner-name"
                type="text"
                value={proposal.ownerName}
                onChange={(e) => onUpdateProposal({ ownerName: e.target.value })}
                placeholder="e.g. Dr. Eleanor Vance"
                className="cp-input"
                data-testid="input-proposal-owner"
              />
            </div>
          </div>

          <div className="form-row mb-md">
            <div className="form-group">
              <label htmlFor="proposal-owner-role">Proposer Role / Capacity</label>
              <input
                id="proposal-owner-role"
                type="text"
                value={proposal.ownerRole || ''}
                onChange={(e) => onUpdateProposal({ ownerRole: e.target.value })}
                placeholder="e.g. Module Leader / Programme Director"
                className="cp-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="proposal-target-date">Target Implementation Date</label>
              <input
                id="proposal-target-date"
                type="date"
                value={proposal.targetDate || ''}
                onChange={(e) => onUpdateProposal({ targetDate: e.target.value })}
                className="cp-input"
              />
            </div>
          </div>

          <div className="flex justify-end mt-md">
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Curriculum Context <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Context */}
      {activeTab === 'context' && (
        <div className="cp-card cp-hide-print mb-lg">
          <h2 className="cp-card-title mb-md">
            <Compass size={20} /> Stage 2: Curriculum Context
          </h2>

          <div className="form-row mb-md">
            <div className="form-group">
              <label htmlFor="context-prog">Programme Name</label>
              <input
                id="context-prog"
                type="text"
                value={proposal.context.programmeName}
                onChange={(e) => handleContextChange('programmeName', e.target.value)}
                placeholder="e.g. Master of Public Health (MPH)"
                className="cp-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="context-module">Module Name</label>
              <input
                id="context-module"
                type="text"
                value={proposal.context.moduleName}
                onChange={(e) => handleContextChange('moduleName', e.target.value)}
                placeholder="e.g. Health Policy Analysis (HPA-701)"
                className="cp-input"
              />
            </div>
          </div>

          <div className="form-row mb-md">
            <div className="form-group">
              <label htmlFor="context-level">Academic Level</label>
              <input
                id="context-level"
                type="text"
                value={proposal.context.level}
                onChange={(e) => handleContextChange('level', e.target.value)}
                placeholder="e.g. Postgraduate (Level 7) / Undergraduate (Level 5)"
                className="cp-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="context-dept">Department / Faculty</label>
              <input
                id="context-dept"
                type="text"
                value={proposal.context.department}
                onChange={(e) => handleContextChange('department', e.target.value)}
                placeholder="e.g. School of Public Health"
                className="cp-input"
              />
            </div>
          </div>

          <div className="form-group mb-md">
            <label htmlFor="context-situation">Current Curriculum Situation</label>
            <textarea
              id="context-situation"
              value={proposal.context.currentSituation || ''}
              onChange={(e) => handleContextChange('currentSituation', e.target.value)}
              placeholder="Describe the current baseline delivery, student challenges, or issues prompting this change..."
              rows={3}
              className="cp-input"
            />
          </div>

          <div className="flex justify-between items-center mt-md">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Basic Details
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Change & Rationale <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Change & Rationale */}
      {activeTab === 'rationale' && (
        <div className="cp-card cp-hide-print mb-lg">
          <h2 className="cp-card-title mb-md">
            <Sparkles size={20} /> Stage 3: Proposed Modification & Educational Rationale
          </h2>

          <div className="form-group mb-md">
            <label htmlFor="proposal-change-desc">
              Proposed Change Description <span className="text-muted">(What is changing?)</span>
            </label>
            <textarea
              id="proposal-change-desc"
              value={proposal.proposedChange}
              onChange={(e) => onUpdateProposal({ proposedChange: e.target.value })}
              placeholder="Detail the specific alterations to syllabus, assessment briefs, weighting, or teaching format..."
              rows={3}
              className="cp-input"
              data-testid="textarea-proposed-change"
            />
          </div>

          <div className="form-group mb-md">
            <label htmlFor="proposal-rationale">
              Educational Rationale <span className="text-muted">(Why is this change necessary?)</span>
            </label>
            <textarea
              id="proposal-rationale"
              value={proposal.rationale}
              onChange={(e) => onUpdateProposal({ rationale: e.target.value })}
              placeholder="Explain the pedagogical justification, student feedback evidence, or professional alignment..."
              rows={3}
              className="cp-input"
              data-testid="textarea-rationale"
            />
          </div>

          <div className="form-group mb-md">
            <label htmlFor="proposal-benefits">
              Intended Benefits & Learning Outcomes
            </label>
            <textarea
              id="proposal-benefits"
              value={proposal.intendedBenefits}
              onChange={(e) => onUpdateProposal({ intendedBenefits: e.target.value })}
              placeholder="What improvements in student engagement, clarity, or capability are expected?"
              rows={2}
              className="cp-input"
            />
          </div>

          <div className="form-group mb-md">
            <label htmlFor="proposal-affected">Affected Curriculum Components</label>
            <input
              id="proposal-affected"
              type="text"
              value={proposal.affectedComponents}
              onChange={(e) => onUpdateProposal({ affectedComponents: e.target.value })}
              placeholder="e.g. Assessment 1 Brief, Rubric Criterion 3, Learning Outcome LO-2"
              className="cp-input"
            />
          </div>

          <div className="flex justify-between items-center mt-md">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Curriculum Context
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Snapshots & Log <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Snapshots & Log */}
      {activeTab === 'versions' && (
        <div>
          <VersionManagementCard
            versions={proposal.versions}
            onAddVersion={onAddVersion}
            onUpdateVersion={onUpdateVersion}
            onRemoveVersion={onRemoveVersion}
          />

          <VersionComparisonCard versions={proposal.versions} />

          <ChangeLogCard
            changeLog={proposal.changeLog}
            versions={proposal.versions}
            onChangeLogUpdate={onUpdateChangeLog}
          />

          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Change & Rationale
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Educational Impact <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Educational Impact (Batch 2 New Feature) */}
      {activeTab === 'impact' && (
        <div>
          <EducationalImpactCard
            assessment={proposal.impactAssessment}
            onUpdateDimension={onUpdateImpactDimension}
            onUpdateOverallNotes={onUpdateOverallImpactNotes}
            readOnly={proposal.status === 'completed' || proposal.status === 'rejected'}
          />

          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Snapshots & Log
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Review & Decisions <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Review & Decisions (Batch 2 New Feature) */}
      {activeTab === 'governance' && (
        <div>
          <ReviewAndDecisionsCard
            proposal={proposal}
            onAddReview={onAddReview}
            onRecordDecision={onRecordDecision}
            onTransitionStatus={onTransitionStatus}
          />

          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Educational Impact
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Implementation Plan <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 7: Implementation Plan (Batch 2 New Feature) */}
      {activeTab === 'implementation' && (
        <div>
          <ImplementationTrackerCard
            proposal={proposal}
            onAddAction={onAddAction}
            onUpdateAction={onUpdateAction}
            onDeleteAction={onDeleteAction}
            onVerifyAndClose={onVerifyAndClose}
            onReopen={onReopen}
          />

          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Review & Decisions
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Governance Notes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 8: Governance Notes (Retained from Batch 1) */}
      {activeTab === 'notes' && (
        <div className="cp-card cp-hide-print mb-lg">
          <h2 className="cp-card-title mb-md">
            <FileCheck size={20} /> Stage 8: Institutional Governance Notes & Context
          </h2>

          <div className="form-group mb-md">
            <label htmlFor="notes-qa-reviewer">QA / Approver Committee Notes</label>
            <textarea
              id="notes-qa-reviewer"
              value={proposal.institutionalNotes.reviewerNotes}
              onChange={(e) => handleInstitutionalNotesChange('reviewerNotes', e.target.value)}
              placeholder="Record approval committee notes, conditions, or recommendations..."
              rows={2}
              className="cp-input"
            />
          </div>

          <div className="form-group mb-md">
            <label htmlFor="notes-ai-involvement">
              AI Involvement in Curriculum Design <span className="text-muted">(Optional)</span>
            </label>
            <textarea
              id="notes-ai-involvement"
              value={proposal.institutionalNotes.aiInvolvement || ''}
              onChange={(e) => handleInstitutionalNotesChange('aiInvolvement', e.target.value)}
              placeholder="How was AI involved in researching or evaluating this curriculum change process?"
              rows={2}
              className="cp-input"
            />
          </div>

          <div className="form-row mb-md">
            <div className="form-group">
              <label htmlFor="notes-risks">
                Risks / Concerns <span className="text-muted">(Optional)</span>
              </label>
              <textarea
                id="notes-risks"
                value={proposal.institutionalNotes.risksConcerns || ''}
                onChange={(e) => handleInstitutionalNotesChange('risksConcerns', e.target.value)}
                placeholder="Identify any pedagogical or operational risks..."
                rows={2}
                className="cp-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes-assumptions">
                Assumptions <span className="text-muted">(Optional)</span>
              </label>
              <textarea
                id="notes-assumptions"
                value={proposal.institutionalNotes.assumptions || ''}
                onChange={(e) => handleInstitutionalNotesChange('assumptions', e.target.value)}
                placeholder="What key assumptions underpin this change?"
                rows={2}
                className="cp-input"
              />
            </div>
          </div>

          <div className="form-group mb-md">
            <label htmlFor="notes-general">General Context Considerations</label>
            <textarea
              id="notes-general"
              value={proposal.institutionalNotes.generalNotes}
              onChange={(e) => handleInstitutionalNotesChange('generalNotes', e.target.value)}
              placeholder="Additional notes for departmental records..."
              rows={2}
              className="cp-input"
            />
          </div>

          {/* Capability development reflections */}
          <div style={{ border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '12px', backgroundColor: '#f8fafc' }}>
            <label htmlFor="notes-capability" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Academic Capability & Reflective Practice Notes (Optional)
            </label>
            <p className="text-small text-muted mb-xs">
              How does this curriculum change develop reflective academic capability or professional judgement across the teaching team?
            </p>
            <textarea
              id="notes-capability"
              value={proposal.institutionalNotes.capabilityNotes || ''}
              onChange={(e) => handleInstitutionalNotesChange('capabilityNotes', e.target.value)}
              placeholder="Record reflections on academic capability..."
              rows={2}
              className="cp-input"
            />
          </div>

          <div className="flex justify-between items-center mt-md">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Implementation Plan
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Governance History <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 9: Governance History (Batch 2 New Feature) */}
      {activeTab === 'history' && (
        <div>
          <GovernanceHistoryCard
            events={proposal.events}
            proposalRef={proposal.ref}
          />

          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Governance Notes
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Output Summary Report <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 10: Output Summary Report */}
      {activeTab === 'summary' && (
        <div>
          <OutputSummaryCard proposal={proposal} />
          <div className="cp-card cp-hide-print flex justify-between items-center mt-md">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Governance History
            </button>
            <button type="button" className="cp-button-secondary" onClick={() => setActiveTab('basics')}>
              Back to Section 1: Basic Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
