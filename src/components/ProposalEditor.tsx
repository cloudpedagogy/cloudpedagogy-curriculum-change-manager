import React, { useState } from 'react';
import type { ChangeProposal, ChangeCategory, Version, ChangeLogEntry } from '../types';
import { VersionManagementCard } from './VersionManagementCard';
import { VersionComparisonCard } from './VersionComparisonCard';
import { ChangeLogCard } from './ChangeLogCard';
import { OutputSummaryCard } from './OutputSummaryCard';
import {
  FileText,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  History,
  CheckCircle,
} from 'lucide-react';

interface ProposalEditorProps {
  proposal: ChangeProposal;
  onUpdateProposal: (updates: Partial<ChangeProposal>) => void;
  onAddVersion: (v: Version) => void;
  onUpdateVersion: (v: Version) => void;
  onRemoveVersion: (id: string) => void;
  onUpdateChangeLog: (entries: ChangeLogEntry[]) => void;
}

type EditorTab = 'basics' | 'context' | 'rationale' | 'versions' | 'governance' | 'summary';

export const ProposalEditor: React.FC<ProposalEditorProps> = ({
  proposal,
  onUpdateProposal,
  onAddVersion,
  onUpdateVersion,
  onRemoveVersion,
  onUpdateChangeLog,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('basics');

  const tabs: Array<{ id: EditorTab; label: string; icon: React.ReactNode }> = [
    { id: 'basics', label: '1. Basic Details', icon: <FileText size={16} /> },
    { id: 'context', label: '2. Curriculum Context', icon: <Compass size={16} /> },
    { id: 'rationale', label: '3. Change & Rationale', icon: <Sparkles size={16} /> },
    { id: 'versions', label: '4. Snapshots & Log', icon: <History size={16} /> },
    { id: 'governance', label: '5. Governance Notes', icon: <ShieldCheck size={16} /> },
    { id: 'summary', label: '6. Output Summary', icon: <CheckCircle size={16} /> },
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

  return (
    <div className="proposal-editor-container">
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
            <div className="flex items-center gap-xs mb-xs">
              <span className="badge" style={{ backgroundColor: '#000', color: '#fff' }}>
                {proposal.ref}
              </span>
              <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                STATUS: {proposal.status.toUpperCase()}
              </span>
              <span className="text-small text-muted">
                Last modified: {new Date(proposal.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', margin: '4px 0' }}>{proposal.title}</h1>
            <p className="text-small text-muted mb-0">
              {proposal.context.programmeName ? `${proposal.context.programmeName} &middot; ` : ''}
              {proposal.context.moduleName ? `${proposal.context.moduleName} &middot; ` : ''}
              Proposer: {proposal.ownerName || 'Unassigned'}
            </p>
          </div>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              className="cp-button-secondary"
              onClick={() => setActiveTab('summary')}
              title="Preview Printable Report"
            >
              <FileText size={16} /> View Report
            </button>
          </div>
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
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--color-border-strong)' : '1px solid transparent',
                  backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                  color: isSelected ? '#000' : 'var(--color-text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Basic Details */}
      {activeTab === 'basics' && (
        <div className="cp-card cp-hide-print">
          <div className="cp-card-header">
            <div>
              <h2 className="cp-card-title">1. Proposal Identification & Classification</h2>
              <p className="text-small text-muted mb-0">
                Core proposal title, unique reference code, category, and responsible lead
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 3 }}>
              <label htmlFor="proposal-title-input">Proposal Title *</label>
              <input
                id="proposal-title-input"
                type="text"
                value={proposal.title}
                onChange={(e) => onUpdateProposal({ title: e.target.value })}
                placeholder="e.g. Public Health Policy Analysis — AI Integrity Redesign"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="proposal-ref-input">Proposal Reference</label>
              <input
                id="proposal-ref-input"
                type="text"
                value={proposal.ref}
                onChange={(e) => onUpdateProposal({ ref: e.target.value })}
                placeholder="e.g. CCP-2026-001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proposal-category-select">Change Category *</label>
              <select
                id="proposal-category-select"
                value={proposal.category}
                onChange={(e) => onUpdateProposal({ category: e.target.value as ChangeCategory })}
              >
                <option value="minor_amendment">Minor Amendment (Syllabus/Reading update)</option>
                <option value="major_modification">Major Modification (Credit/Structure shift)</option>
                <option value="assessment_redesign">Assessment Redesign (Weighting/Format)</option>
                <option value="ai_guidance_update">AI Guidance & Policy Update</option>
                <option value="learning_outcomes_revision">Learning Outcomes Revision</option>
                <option value="structural_change">Structural Programme Change</option>
                <option value="other">Other Academic Revision</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="proposal-targetdate-input">Target Implementation Date / Term</label>
              <input
                id="proposal-targetdate-input"
                type="text"
                value={proposal.targetDate || ''}
                onChange={(e) => onUpdateProposal({ targetDate: e.target.value })}
                placeholder="e.g. 2026-09-01 or Autumn Semester 2026/27"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proposal-owner-name">Proposer / Responsible Person *</label>
              <input
                id="proposal-owner-name"
                type="text"
                value={proposal.ownerName}
                onChange={(e) => onUpdateProposal({ ownerName: e.target.value })}
                placeholder="e.g. Dr. Eleanor Vance"
              />
            </div>
            <div className="form-group">
              <label htmlFor="proposal-owner-role">Proposer Academic Role</label>
              <input
                id="proposal-owner-role"
                type="text"
                value={proposal.ownerRole || ''}
                onChange={(e) => onUpdateProposal({ ownerRole: e.target.value })}
                placeholder="e.g. Module Leader / Programme Director"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-lg pt-md" style={{ borderTop: '1px solid var(--color-border-default)' }}>
            <span className="text-small text-muted">All changes save automatically to local browser storage.</span>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Curriculum Context <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Context */}
      {activeTab === 'context' && (
        <div className="cp-card cp-hide-print">
          <div className="cp-card-header">
            <div>
              <h2 className="cp-card-title">2. Curriculum Context</h2>
              <p className="text-small text-muted mb-0">
                Identify the institutional, programme, and module context affected by this change
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="context-programme-name">Programme Name</label>
              <input
                id="context-programme-name"
                type="text"
                value={proposal.context.programmeName}
                onChange={(e) => handleContextChange('programmeName', e.target.value)}
                placeholder="e.g. Master of Public Health"
              />
            </div>
            <div className="form-group">
              <label htmlFor="context-module-name">Module Name</label>
              <input
                id="context-module-name"
                type="text"
                value={proposal.context.moduleName}
                onChange={(e) => handleContextChange('moduleName', e.target.value)}
                placeholder="e.g. Health Policy Analysis"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="context-level">Academic Level</label>
              <input
                id="context-level"
                type="text"
                value={proposal.context.level}
                onChange={(e) => handleContextChange('level', e.target.value)}
                placeholder="e.g. Postgraduate (Level 7) or Level 6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="context-department">Department / Faculty</label>
              <input
                id="context-department"
                type="text"
                value={proposal.context.department}
                onChange={(e) => handleContextChange('department', e.target.value)}
                placeholder="e.g. School of Public Health & Epidemiology"
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label htmlFor="context-situation">Current Curriculum Situation & Challenges</label>
            <textarea
              id="context-situation"
              value={proposal.context.currentSituation || ''}
              onChange={(e) => handleContextChange('currentSituation', e.target.value)}
              placeholder="Describe the current delivery, syllabus structure, assessment mechanism, and what led to this proposed change..."
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center mt-lg pt-md" style={{ borderTop: '1px solid var(--color-border-default)' }}>
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
        <div className="cp-card cp-hide-print">
          <div className="cp-card-header">
            <div>
              <h2 className="cp-card-title">3. Proposed Change & Educational Rationale</h2>
              <p className="text-small text-muted mb-0">
                Articulate the exact changes, the pedagogical justification, and intended student outcomes
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="proposal-proposed-change">Proposed Changes *</label>
            <textarea
              id="proposal-proposed-change"
              value={proposal.proposedChange}
              onChange={(e) => onUpdateProposal({ proposedChange: e.target.value })}
              placeholder="Detail specifically what is being added, modified, removed, or restructured..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="proposal-rationale">Educational Rationale (Why are you proposing this?) *</label>
            <textarea
              id="proposal-rationale"
              value={proposal.rationale}
              onChange={(e) => onUpdateProposal({ rationale: e.target.value })}
              placeholder="Cite pedagogical evidence, student feedback, external accreditation requirements, or academic integrity rationale..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="proposal-intended-benefits">Intended Benefits & Curricular Outcomes</label>
            <textarea
              id="proposal-intended-benefits"
              value={proposal.intendedBenefits}
              onChange={(e) => onUpdateProposal({ intendedBenefits: e.target.value })}
              placeholder="How does this change enhance student learning, assessment authenticity, or curriculum coherence?"
              rows={2}
            />
          </div>

          <div className="form-group mb-0">
            <label htmlFor="proposal-affected-components">Affected Modules & Programmes</label>
            <input
              id="proposal-affected-components"
              type="text"
              value={proposal.affectedComponents}
              onChange={(e) => onUpdateProposal({ affectedComponents: e.target.value })}
              placeholder="e.g. Module: Health Policy (HPA-701); Programme: Master of Public Health"
            />
          </div>

          <div className="flex justify-between items-center mt-lg pt-md" style={{ borderTop: '1px solid var(--color-border-default)' }}>
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Context
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Snapshots & Changes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Snapshots & Changes */}
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
              Next: Governance Notes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Institutional Governance */}
      {activeTab === 'governance' && (
        <div>
          <div className="cp-card cp-hide-print">
            <div className="cp-card-header">
              <div>
                <h2 className="cp-card-title">5. Institutional Governance & Review Notes</h2>
                <p className="text-small text-muted mb-0">
                  Record QA observations, AI transparency considerations, risks, and working assumptions
                </p>
              </div>
            </div>

            <div className="form-group mb-sm">
              <label htmlFor="notes-qa-reviewer">QA / Approver Committee Notes</label>
              <textarea
                id="notes-qa-reviewer"
                value={proposal.institutionalNotes.reviewerNotes}
                onChange={(e) => handleInstitutionalNotesChange('reviewerNotes', e.target.value)}
                placeholder="Record approval committee notes, conditions, or recommendations..."
                rows={2}
              />
            </div>

            <div className="form-group mb-sm">
              <label htmlFor="notes-ai-involvement">
                AI Involvement in Curriculum Design <span className="text-muted">(Optional)</span>
              </label>
              <textarea
                id="notes-ai-involvement"
                value={proposal.institutionalNotes.aiInvolvement || ''}
                onChange={(e) => handleInstitutionalNotesChange('aiInvolvement', e.target.value)}
                placeholder="How was AI involved in researching or evaluating this curriculum change process?"
                rows={2}
              />
            </div>

            <div className="form-row mb-sm">
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
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="notes-general">General Context Considerations</label>
              <textarea
                id="notes-general"
                value={proposal.institutionalNotes.generalNotes}
                onChange={(e) => handleInstitutionalNotesChange('generalNotes', e.target.value)}
                placeholder="Additional notes for departmental records..."
                rows={2}
              />
            </div>
          </div>

          {/* Capability & Governance Notes layer */}
          <div className="cp-card cp-hide-print" style={{ borderStyle: 'dashed', opacity: 0.9 }}>
            <details>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-meta)',
                  padding: '4px 0',
                }}
              >
                Capability & Governance Reflection (Optional)
              </summary>
              <div className="mt-md">
                <div className="form-group mb-0">
                  <label
                    htmlFor="notes-capability"
                    style={{
                      fontSize: 'var(--font-size-small)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      opacity: 0.7,
                    }}
                  >
                    Capability Development Notes
                  </label>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-small)', marginBottom: '8px' }}>
                    How does this institutional change process develop responsible academic capability, professional judgement, or reflective practice?
                  </p>
                  <textarea
                    id="notes-capability"
                    value={proposal.institutionalNotes.capabilityNotes || ''}
                    onChange={(e) => handleInstitutionalNotesChange('capabilityNotes', e.target.value)}
                    placeholder="Record capability development observations..."
                    rows={3}
                    style={{ fontSize: 'var(--font-size-meta)', borderColor: '#ddd' }}
                  />
                </div>
              </div>
            </details>
          </div>

          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Snapshots & Changes
            </button>
            <button type="button" className="cp-button-primary" onClick={goToNextTab}>
              Next: Output Summary Report <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Output Summary Report */}
      {activeTab === 'summary' && (
        <div>
          <OutputSummaryCard proposal={proposal} />
          <div className="cp-card cp-hide-print flex justify-between items-center">
            <button type="button" className="cp-button-secondary" onClick={goToPrevTab}>
              <ArrowLeft size={16} /> Previous: Governance Notes
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
