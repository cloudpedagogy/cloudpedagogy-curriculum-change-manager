import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OutputSummaryCard } from '../components/OutputSummaryCard';
import { VersionComparisonCard } from '../components/VersionComparisonCard';
import { ProposalEditor } from '../components/ProposalEditor';
import { generateMarkdownDossier } from '../utils/dossier';
import { createNewProposal } from '../utils/migration';
import type { ChangeProposal } from '../types';

describe('Batch 3 — Quality, Reporting and Standalone Readiness', () => {
  let mockProposal: ChangeProposal;

  beforeEach(() => {
    mockProposal = createNewProposal([], {
      title: 'MSc Data Science Curriculum Modernisation',
      category: 'major_modification',
      ownerName: 'Dr. Jane Smith',
      ownerRole: 'Programme Director',
      proposedChange: 'Incorporate modern MLOps and cloud deployment modules.',
      rationale: 'Align curriculum with industry standards and QAA benchmarks.',
      targetDate: '2026-09-01',
      context: {
        programmeName: 'MSc Data Science',
        moduleName: 'Machine Learning Engineering',
        level: '7',
        department: 'School of Computer Science',
        currentSituation: 'Traditional local Python notebook labs.',
      },
      versions: [
        {
          id: 'v1',
          title: 'Baseline 2025/26',
          createdAt: '2025-10-01',
          sourceType: 'manual',
          description: 'Original accredited curriculum',
          sourceData: {
            title: 'Machine Learning Engineering',
            credits: 15,
            level: '7',
            learningOutcomes: [
              'Train supervised models',
              'Evaluate accuracy metrics',
            ],
            assessments: {
              examWeight: 60,
              courseworkWeight: 40,
            },
          },
        },
        {
          id: 'v2',
          title: 'Proposed Modernisation',
          createdAt: '2026-02-15',
          sourceType: 'manual',
          description: 'Updated with cloud pipelines and continuous deployment',
          sourceData: {
            title: 'Machine Learning Engineering & MLOps',
            credits: 15,
            level: '7',
            learningOutcomes: [
              'Train supervised models',
              'Evaluate accuracy metrics',
              'Deploy reproducible cloud ML pipelines',
            ],
            assessments: {
              examWeight: 0,
              courseworkWeight: 70,
              codePortfolio: 30,
            },
            aiPolicy: 'Permitted with critical evaluation',
          },
        },
      ],
      changeLog: [
        {
          id: 'cl-1',
          date: '2026-02-15',
          changeSummary: 'Replaced traditional written exam with 30% codebase portfolio',
          rationale: 'Authentic assessment practice for modern software engineering',
          impact: 'Authentic assessment and improved employability',
          versionId: 'v2',
        },
      ],
      impactAssessment: {
        dimensions: {
          learningOutcomes: {
            key: 'learningOutcomes',
            title: 'Learning Outcomes & Curriculum Alignment',
            impactLevel: 'moderate',
            rationale: 'Addition of cloud MLOps ILO expands practical competency',
            evidence: 'Industry Advisory Board minutes',
            mitigation: 'Extra lab support hours',
          },
          assessmentDesign: {
            key: 'assessmentDesign',
            title: 'Assessment Design & Academic Standards',
            impactLevel: 'high',
            rationale: 'Removal of 60% exam in favour of continuous portfolio assessment',
            evidence: 'Authentic Assessment Working Group policy',
            mitigation: 'Oral viva checks against plagiarism',
          },
          studentProgression: {
            key: 'studentProgression',
            title: 'Student Progression & Prerequisites',
            impactLevel: 'low',
            rationale: 'Prerequisites updated for python competency',
          },
          teachingDelivery: {
            key: 'teachingDelivery',
            title: 'Teaching Delivery & Learning Resources',
            impactLevel: 'low',
            rationale: 'Hybrid delivery with interactive cloud notebook exercises',
          },
          staffWorkload: {
            key: 'staffWorkload',
            title: 'Staff Workload & Implementation Feasibility',
            impactLevel: 'low',
            rationale: 'Automated test suite reduces manual code grading burden',
          },
          accessibilityInclusion: {
            key: 'accessibilityInclusion',
            title: 'Accessibility, Inclusion & Student Experience',
            impactLevel: 'low',
            rationale: 'Cloud student credits funded via department teaching grant, universal web browser access',
          },
        },
        overallNotes: 'Major positive pedagogical advancement towards authentic assessment.',
      },
      reviews: [
        {
          id: 'rev-1',
          reviewerName: 'Prof. David Miller',
          reviewerRole: 'External Academic Advisor',
          reviewDate: '2026-02-20',
          findings: 'Highly commended modernisation plan with thorough rationale.',
          recommendations: 'Ensure robust marking rubrics for repository code.',
          conditions: 'Provide exemplar rubrics before board meeting.',
        },
      ],
      decisions: [
        {
          id: 'dec-1',
          decisionMaker: 'Faculty Board of Studies',
          decisionDate: '2026-03-01',
          outcome: 'approved',
          decisionRationale: 'Exceptional proposal with comprehensive impact mitigation.',
          conditions: 'Subject to external examiner concurrence.',
          targetSnapshotId: 'v2',
        },
      ],
      status: 'approved',
      implementationActions: [
        {
          id: 'act-1',
          title: 'Provision AWS Cloud Academy classroom accounts',
          assignee: 'Lead Lab Technician',
          dueDate: '2026-08-01',
          status: 'in_progress',
          completionEvidence: 'Account allocation spreadsheet prepared',
        },
      ],
      events: [
        {
          id: 'ev-1',
          timestamp: '2026-02-15T09:00:00Z',
          eventType: 'proposal_created',
          actor: 'Dr. Jane Smith',
          description: 'Proposal initialized',
        },
        {
          id: 'ev-2',
          timestamp: '2026-03-01T14:00:00Z',
          eventType: 'proposal_approved',
          actor: 'Faculty Board of Studies',
          description: 'Status changed from submitted to approved',
        },
      ],
    });
  });

  describe('Version Comparison Card (Generic Engine)', () => {
    it('compares any two selected versions and renders accurate summary metrics', () => {
      render(<VersionComparisonCard versions={mockProposal.versions} />);

      // Heading and selector controls
      expect(screen.getByTestId('version-comparison-card')).toBeDefined();
      expect(screen.getByTestId('select-compare-a')).toBeDefined();
      expect(screen.getByTestId('select-compare-b')).toBeDefined();

      // Metric badges
      expect(screen.getByTestId('summary-total-changes').textContent).toContain('Total Changes');
      expect(screen.getByTestId('summary-added').textContent).toContain('Added');
      expect(screen.getByTestId('summary-modified').textContent).toContain('Modified');

      // Check specific diff rows: title modified, examWeight removed/modified, aiPolicy added
      expect(screen.getByText(/Machine Learning Engineering & MLOps/i)).toBeDefined();
      expect(screen.getByText(/AI Policy/i)).toBeDefined();
    });

    it('filters diff list by change type pills', () => {
      render(<VersionComparisonCard versions={mockProposal.versions} />);

      const filterAdded = screen.getByTestId('filter-pill-added');
      fireEvent.click(filterAdded);

      // In added view, aiPolicy should be present
      expect(screen.getByText(/AI Policy/i)).toBeDefined();

      const filterAll = screen.getByTestId('filter-pill-all');
      fireEvent.click(filterAll);
      expect(screen.getAllByText(/Title/i).length).toBeGreaterThan(0);
    });

    it('supports expanding detailed before/after raw values', () => {
      render(<VersionComparisonCard versions={mockProposal.versions} />);

      // Find an expand toggle button
      const expandButtons = screen.getAllByTitle(/Toggle full details/i);
      expect(expandButtons.length).toBeGreaterThan(0);

      fireEvent.click(expandButtons[0]);
      // Verify detail section opened
      expect(screen.getByText(/Raw Baseline:/i)).toBeDefined();
    });

    it('handles single-version gracefully with helpful guidance', () => {
      render(<VersionComparisonCard versions={[mockProposal.versions[0]]} />);

      expect(
        screen.getByText(/At least two curriculum version snapshots are required/i)
      ).toBeDefined();
    });
  });

  describe('Output Summary Dossier and Markdown Export', () => {
    it('renders audit-ready dossier with embedded version diff summary', () => {
      render(<OutputSummaryCard proposal={mockProposal} />);

      expect(screen.getByTestId('output-summary-card')).toBeDefined();
      expect(screen.getByText(/Curriculum Change Governance & Summary Report/i)).toBeDefined();

      // Embedded version comparison summary
      expect(screen.getByTestId('dossier-version-comparison-summary')).toBeDefined();
      expect(screen.getAllByText(/Baseline 2025\/26/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Proposed Modernisation/i).length).toBeGreaterThan(0);

      // Completeness callout should indicate full documentation
      expect(screen.getByTestId('audit-completeness-callout')).toBeDefined();
      expect(screen.getByText(/Audit Dossier Status: Fully Documented/i)).toBeDefined();

      // Governance notice must be prominent
      expect(screen.getByText(/Governance Notice:/i)).toBeDefined();
    });

    it('flags incomplete proposals with specific missing requirement warnings', () => {
      const incompleteProposal = createNewProposal([], {
        title: 'Draft Incomplete Change',
        proposedChange: '',
        rationale: '',
        context: {
          programmeName: '',
          moduleName: '',
          level: '',
          department: '',
        },
      });

      render(<OutputSummaryCard proposal={incompleteProposal} />);

      expect(screen.getByTestId('audit-completeness-callout')).toBeDefined();
      expect(screen.getByText(/Audit Completeness Notice/i)).toBeDefined();
      expect(screen.getByText(/Educational rationale missing/i)).toBeDefined();
      expect(screen.getByText(/Programme name not specified/i)).toBeDefined();
    });

    it('generates structured Markdown dossier with all sections and disclaimers', () => {
      const md = generateMarkdownDossier(mockProposal);

      expect(md).toContain('# Curriculum Change Governance Dossier');
      expect(md).toContain('Governance Notice:');
      expect(md).toContain('## 1. Curriculum Context');
      expect(md).toContain('## 2. Proposed Change & Educational Rationale');
      expect(md).toContain('## 3. Educational Impact Assessment Findings');
      expect(md).toContain('## 4. Committee & Peer Reviews');
      expect(md).toContain('## 5. Formal Governance Decisions');
      expect(md).toContain('## 6. Implementation Tracking');
      expect(md).toContain('## 7. Version Snapshots & Comparison Summary');
      expect(md).toContain('## 8. Documented Change Log Entries');
      expect(md).toContain('## 9. Governance Event History & Audit Trail');
      expect(md).toContain('Baseline vs Latest Snapshot Comparison');
    });

    it('copies formatted text to clipboard and displays confirmation', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<OutputSummaryCard proposal={mockProposal} />);

      const copyBtn = screen.getByTestId('btn-copy-summary');
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalled();
      expect(await screen.findByText(/Dossier copied to clipboard/i)).toBeDefined();
    });
  });

  describe('Progressive-Disclosure Navigation & Accessibility', () => {
    it('provides accessible tablist with ARIA attributes and role=tabpanel', () => {
      const onUpdate = vi.fn();
      render(
        <ProposalEditor
          proposal={mockProposal}
          onUpdateProposal={onUpdate}
          onAddVersion={vi.fn()}
          onUpdateVersion={vi.fn()}
          onRemoveVersion={vi.fn()}
          onUpdateChangeLog={vi.fn()}
          onTransitionStatus={vi.fn()}
          onUpdateImpactDimension={vi.fn()}
          onUpdateOverallImpactNotes={vi.fn()}
          onAddReview={vi.fn()}
          onRecordDecision={vi.fn()}
          onAddAction={vi.fn()}
          onUpdateAction={vi.fn()}
          onDeleteAction={vi.fn()}
          onVerifyAndClose={vi.fn()}
        />
      );

      const tablist = screen.getByRole('tablist', { name: /Curriculum change authoring stages/i });
      expect(tablist).toBeDefined();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(10);
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(tabs[1].getAttribute('aria-selected')).toBe('false');

      // Check tabpanel
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeDefined();
      expect(tabpanel.getAttribute('id')).toBe('tabpanel-basics');
    });

    it('supports arrow key navigation across tabs', () => {
      render(
        <ProposalEditor
          proposal={mockProposal}
          onUpdateProposal={vi.fn()}
          onAddVersion={vi.fn()}
          onUpdateVersion={vi.fn()}
          onRemoveVersion={vi.fn()}
          onUpdateChangeLog={vi.fn()}
          onTransitionStatus={vi.fn()}
          onUpdateImpactDimension={vi.fn()}
          onUpdateOverallImpactNotes={vi.fn()}
          onAddReview={vi.fn()}
          onRecordDecision={vi.fn()}
          onAddAction={vi.fn()}
          onUpdateAction={vi.fn()}
          onDeleteAction={vi.fn()}
          onVerifyAndClose={vi.fn()}
        />
      );

      const firstTab = screen.getByTestId('tab-basics');
      firstTab.focus();

      // Press ArrowRight to navigate to Context
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      expect(screen.getByTestId('tab-context').getAttribute('aria-selected')).toBe('true');

      // Press End to navigate to Summary
      fireEvent.keyDown(screen.getByTestId('tab-context'), { key: 'End' });
      expect(screen.getByTestId('tab-summary').getAttribute('aria-selected')).toBe('true');

      // Press Home to return to Basics
      fireEvent.keyDown(screen.getByTestId('tab-summary'), { key: 'Home' });
      expect(screen.getByTestId('tab-basics').getAttribute('aria-selected')).toBe('true');
    });

    it('renders phase groupings and compact mobile dropdown selector', () => {
      render(
        <ProposalEditor
          proposal={mockProposal}
          onUpdateProposal={vi.fn()}
          onAddVersion={vi.fn()}
          onUpdateVersion={vi.fn()}
          onRemoveVersion={vi.fn()}
          onUpdateChangeLog={vi.fn()}
          onTransitionStatus={vi.fn()}
          onUpdateImpactDimension={vi.fn()}
          onUpdateOverallImpactNotes={vi.fn()}
          onAddReview={vi.fn()}
          onRecordDecision={vi.fn()}
          onAddAction={vi.fn()}
          onUpdateAction={vi.fn()}
          onDeleteAction={vi.fn()}
          onVerifyAndClose={vi.fn()}
        />
      );

      // Phase buttons
      expect(screen.getByText(/Phase 1: Proposal Design & Content/i)).toBeDefined();
      expect(screen.getByText(/Phase 2: Governance & Decision/i)).toBeDefined();
      expect(screen.getByText(/Phase 3: Assurance & Records/i)).toBeDefined();

      // Mobile stage select dropdown
      const mobileSelect = screen.getByLabelText(/Select authoring stage/i) as HTMLSelectElement;
      expect(mobileSelect).toBeDefined();

      fireEvent.change(mobileSelect, { target: { value: 'governance' } });
      expect(screen.getByTestId('tab-governance').getAttribute('aria-selected')).toBe('true');
    });
  });
});
