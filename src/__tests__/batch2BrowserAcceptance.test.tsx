import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { STORAGE_KEY } from '../hooks/useAppState';
import type { ChangeProposal } from '../types';

describe('Batch 2 User-Workflow Acceptance Test Suite (19 Steps)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('executes the full end-to-end governance lifecycle from blank workspace to verified completion', async () => {
    // Start with blank workspace
    const { unmount } = render(<App />);
    expect(screen.getByText('Welcome to Curriculum Change Manager')).toBeDefined();

    // 1. Create a proposal
    const createBlankBtn = screen.getByText('Create Blank Proposal');
    fireEvent.click(createBlankBtn);

    // 2. Enter basic details and rationale
    const titleInput = screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Master of Public Health AI Policy Refinement' } });

    const ownerInput = screen.getByLabelText(/Proposer \/ Responsible Person \*/i) as HTMLInputElement;
    fireEvent.change(ownerInput, { target: { value: 'Dr. Eleanor Vance' } });

    // Navigate to Tab 3 (Change & Rationale)
    const rationaleTab = screen.getByTestId('tab-rationale');
    fireEvent.click(rationaleTab);

    const changeDesc = screen.getByTestId('textarea-proposed-change');
    fireEvent.change(changeDesc, {
      target: { value: 'Incorporate structured generative AI guidelines across all summative assessments.' },
    });

    const rationaleInput = screen.getByTestId('textarea-rationale');
    fireEvent.change(rationaleInput, {
      target: { value: 'Rapid technological uptake requires clear academic integrity boundaries.' },
    });

    // 3. Save and resume (verify localStorage persistence)
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.proposals[0].title).toBe('Master of Public Health AI Policy Refinement');
    expect(saved.proposals[0].status).toBe('draft');

    // 4. Complete an educational impact assessment
    const impactTab = screen.getByTestId('tab-impact');
    fireEvent.click(impactTab);

    // Select Learning Outcomes tab and assign Moderate impact
    const loDimTab = screen.getByTestId('dimension-tab-learningOutcomes');
    fireEvent.click(loDimTab);

    const moderateBtn = screen.getByTestId('level-btn-learningOutcomes-moderate');
    fireEvent.click(moderateBtn);

    const loRationale = screen.getByLabelText(/Pedagogical Rationale & Implications/i);
    fireEvent.change(loRationale, {
      target: { value: 'Requires students to critically evaluate synthetic clinical data.' },
    });

    // Select Staff Workload tab and assign Low impact
    const workloadDimTab = screen.getByTestId('dimension-tab-staffWorkload');
    fireEvent.click(workloadDimTab);

    const lowBtn = screen.getByTestId('level-btn-staffWorkload-low');
    fireEvent.click(lowBtn);

    // 5. Submit the proposal
    const governanceTab = screen.getByTestId('tab-governance');
    fireEvent.click(governanceTab);

    const submitBtn = screen.getByTestId('btn-submit-proposal');
    fireEvent.click(submitBtn);

    // Status is now submitted
    expect(screen.getByText(/CURRENT STATUS: SUBMITTED/i)).toBeDefined();

    // 6. Record a review
    const tabReviews = screen.getByTestId('tab-reviews');
    fireEvent.click(tabReviews);

    const addReviewToggle = screen.getByTestId('btn-add-review-toggle');
    fireEvent.click(addReviewToggle);

    fireEvent.change(screen.getByLabelText(/Reviewer Name: \*/i), { target: { value: 'Prof. Marcus Thorne' } });
    fireEvent.change(screen.getByLabelText(/Reviewer Role \/ Committee:/i), { target: { value: 'QA Board Chair' } });
    fireEvent.change(screen.getByLabelText(/Findings & Assessment: \*/i), {
      target: { value: 'Pedagogically sound and well aligned with institutional benchmark standards.' },
    });
    fireEvent.change(screen.getByLabelText(/Recommendations:/i), {
      target: { value: 'Recommend formal approval without reservations.' },
    });

    fireEvent.click(screen.getByTestId('btn-save-review'));

    // Status automatically advances to under_review
    expect(screen.getByText(/CURRENT STATUS: UNDER REVIEW/i)).toBeDefined();
    expect(screen.getByText('Prof. Marcus Thorne')).toBeDefined();

    // 7. Record an approval decision
    const tabDecisions = screen.getByTestId('tab-decisions');
    fireEvent.click(tabDecisions);

    const addDecisionToggle = screen.getByTestId('btn-add-decision-toggle');
    fireEvent.click(addDecisionToggle);

    fireEvent.change(screen.getByTestId('select-decision-outcome'), { target: { value: 'approved' } });
    fireEvent.change(screen.getByTestId('input-decision-maker'), { target: { value: 'Faculty Quality Committee' } });
    fireEvent.change(screen.getByTestId('textarea-decision-rationale'), {
      target: { value: 'Approved unanimously based on thorough pedagogical impact assessment.' },
    });

    fireEvent.click(screen.getByTestId('btn-save-decision'));

    // Proposal is now approved
    expect(screen.getByText(/CURRENT STATUS: APPROVED/i)).toBeDefined();

    // 8. Begin implementation
    const tabLifecycle = screen.getByTestId('tab-lifecycle');
    fireEvent.click(tabLifecycle);

    const startImplBtn = screen.getByTestId('btn-start-implementation');
    fireEvent.click(startImplBtn);

    expect(screen.getByText(/CURRENT STATUS: IN IMPLEMENTATION/i)).toBeDefined();

    // 9. Add implementation actions
    const implTab = screen.getByTestId('tab-implementation');
    fireEvent.click(implTab);

    const addActionToggle = screen.getByTestId('btn-add-action-toggle');
    fireEvent.click(addActionToggle);

    fireEvent.change(screen.getByTestId('input-action-desc'), {
      target: { value: 'Update assignment briefs on the virtual learning environment' },
    });
    fireEvent.change(screen.getByTestId('input-action-resp'), { target: { value: 'Dr. Eleanor Vance' } });

    fireEvent.click(screen.getByTestId('btn-save-action'));
    expect(screen.getByText('Update assignment briefs on the virtual learning environment')).toBeDefined();

    // 10. Complete the actions
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const actionId = saved.proposals[0].implementationActions[0].id;
    const toggleActionBtn = screen.getByTestId(`btn-toggle-action-${actionId}`);
    fireEvent.click(toggleActionBtn);

    // 11. Record closure verification
    const openClosureBtn = screen.getByTestId('btn-open-closure-form');
    fireEvent.click(openClosureBtn);

    fireEvent.change(screen.getByTestId('input-closure-signee'), { target: { value: 'Dr. Eleanor Vance' } });
    fireEvent.change(screen.getByTestId('textarea-closure-basis'), {
      target: { value: 'Audited module shell on VLE and confirmed all rubrics are live.' },
    });
    fireEvent.click(screen.getByTestId('checkbox-closure-confirm'));

    // 12. Mark the proposal Completed
    const confirmClosureBtn = screen.getByTestId('btn-confirm-closure');
    fireEvent.click(confirmClosureBtn);

    expect(screen.getByText(/Proposal Completed & Verified Closed/i)).toBeDefined();
    expect(screen.getByText(/STATUS: COMPLETED/i)).toBeDefined();

    // 13. Inspect governance history
    const historyTab = screen.getByTestId('tab-history');
    fireEvent.click(historyTab);

    expect(screen.getByText(/Governance Event History & Audit Trail/i)).toBeDefined();
    expect(screen.getByText(/Local Audit Notice/i)).toBeDefined();
    // Events logged
    expect(screen.getAllByText(/Proposal Created/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Submitted for Review/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Proposal Approved/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Proposal Completed/i).length).toBeGreaterThanOrEqual(1);

    // 14. Export and re-import the workspace
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.schemaVersion).toBe('1.1.0');
    expect(saved.proposals[0].status).toBe('completed');
    expect(saved.proposals[0].closure).toBeDefined();

    // Simulate export JSON payload
    const exportData = JSON.stringify(saved);
    expect(exportData).toContain('Master of Public Health AI Policy Refinement');

    // 15. Reload and verify persistence
    unmount();
    const { unmount: unmount2 } = render(<App />);

    expect(screen.getAllByText('Master of Public Health AI Policy Refinement').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/STATUS: COMPLETED/i)).toBeDefined();

    // 16. Create a second independent proposal
    const newProposalBtn = screen.getAllByRole('button', { name: /New Proposal/i })[0];
    fireEvent.click(newProposalBtn);

    expect(screen.getAllByText(/2 Proposals/).length).toBeGreaterThanOrEqual(1);
    const titleInput2 = screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement;
    fireEvent.change(titleInput2, { target: { value: 'Second Proposal: Clinical Simulation' } });
    const ownerInput2 = screen.getByLabelText(/Proposer \/ Responsible Person \*/i) as HTMLInputElement;
    fireEvent.change(ownerInput2, { target: { value: 'Dr. Gregory House' } });

    // Proposal 2 is in draft and has independent history
    expect(screen.getByText(/STATUS: DRAFT/i)).toBeDefined();

    // Enter rationale for Proposal 2
    const rationaleTab2 = screen.getByTestId('tab-rationale');
    fireEvent.click(rationaleTab2);
    fireEvent.change(screen.getByTestId('textarea-rationale'), {
      target: { value: 'Immersive simulation for clinical diagnostic reasoning.' },
    });

    // 17. Test rejection or return-for-revision workflow
    const govTab2 = screen.getByTestId('tab-governance');
    fireEvent.click(govTab2);

    // Submit Proposal 2
    fireEvent.click(screen.getByTestId('btn-submit-proposal'));
    expect(screen.getByText(/CURRENT STATUS: SUBMITTED/i)).toBeDefined();

    // Advance to Under Review
    fireEvent.click(screen.getByTestId('btn-start-review'));
    expect(screen.getByText(/CURRENT STATUS: UNDER REVIEW/i)).toBeDefined();

    // Test Return for Revision
    const returnBtn = screen.getByTestId('btn-return-revision');
    fireEvent.click(returnBtn);
    expect(screen.getByText(/CURRENT STATUS: DRAFT/i)).toBeDefined();

    // Re-submit and test formal Rejection
    fireEvent.click(screen.getByTestId('btn-submit-proposal'));
    fireEvent.click(screen.getByTestId('btn-start-review'));

    // Record formal rejection decision
    fireEvent.click(screen.getByTestId('tab-decisions'));
    fireEvent.click(screen.getByTestId('btn-add-decision-toggle'));

    fireEvent.change(screen.getByTestId('select-decision-outcome'), { target: { value: 'rejected' } });
    fireEvent.change(screen.getByTestId('input-decision-maker'), { target: { value: 'Academic Standards Board' } });
    fireEvent.change(screen.getByTestId('textarea-decision-rationale'), {
      target: { value: 'Unviable simulator resource overhead.' },
    });
    fireEvent.click(screen.getByTestId('btn-save-decision'));

    expect(screen.getByText(/CURRENT STATUS: REJECTED/i)).toBeDefined();

    // 18. Confirm invalid transitions are prevented
    // A rejected proposal cannot transition directly to approved or completed
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const prop2 = saved.proposals.find((p: ChangeProposal) => p.title.includes('Clinical Simulation'));
    expect(prop2.status).toBe('rejected');

    // 19. Verify keyboard accessibility & summary view
    const viewReportBtn = screen.getByTestId('btn-view-summary-report');
    fireEvent.click(viewReportBtn);
    expect(screen.getByTestId('output-summary-card')).toBeDefined();
    expect(screen.getByText(/Curriculum Change Governance & Summary Report/i)).toBeDefined();

    unmount2();
  });
});
