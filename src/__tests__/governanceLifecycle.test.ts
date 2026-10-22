import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../hooks/useAppState';
import { checkTransitionEligibility, ALLOWED_TRANSITIONS } from '../utils/governance';

describe('Governance Lifecycle & Domain Invariants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enforces transition rules and blocks arbitrary invalid state transitions', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Curriculum Change Proposal',
        ownerName: 'Dr. Jane Smith',
        rationale: 'Modernizing learning outcomes',
      });
    });

    const proposal = result.current.activeProposal!;
    expect(proposal.status).toBe('draft');

    // Cannot transition directly from Draft to Approved, Rejected, In Implementation, or Completed
    expect(checkTransitionEligibility(proposal, 'approved').allowed).toBe(false);
    expect(checkTransitionEligibility(proposal, 'rejected').allowed).toBe(false);
    expect(checkTransitionEligibility(proposal, 'in_implementation').allowed).toBe(false);
    expect(checkTransitionEligibility(proposal, 'completed').allowed).toBe(false);

    // Draft can only transition to Submitted or Withdrawn
    expect(ALLOWED_TRANSITIONS['draft']).toEqual(['submitted', 'withdrawn']);
  });

  it('blocks submission if required fields are missing', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: '',
        ownerName: '',
        rationale: '',
        proposedChange: '',
      });
    });

    const proposal = result.current.activeProposal!;
    const check = checkTransitionEligibility(proposal, 'submitted');
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('title');

    // Attempting transition via hook returns error
    let res: { success: boolean; message?: string } | undefined;
    act(() => {
      res = result.current.transitionProposalStatus('submitted', 'Tester');
    });
    expect(res?.success).toBe(false);
    expect(result.current.activeProposal?.status).toBe('draft');
  });

  it('allows valid submission when required fields are populated and logs governance event', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'BSc Computer Science Assessment Overhaul',
        ownerName: 'Dr. Alan Turing',
        rationale: 'Alignment with updated industry competencies',
      });
    });

    let res: { success: boolean; message?: string } | undefined;
    act(() => {
      res = result.current.transitionProposalStatus('submitted', 'Dr. Alan Turing', 'Ready for QA review');
    });

    expect(res?.success).toBe(true);
    expect(result.current.activeProposal?.status).toBe('submitted');

    // Event history recorded
    const events = result.current.activeProposal!.events;
    const submitEv = events.find((e) => e.eventType === 'proposal_submitted');
    expect(submitEv).toBeDefined();
    expect(submitEv?.actor).toBe('Dr. Alan Turing');
    expect(submitEv?.description).toContain('SUBMITTED');
  });

  it('supports full review and approval workflow with decision safeguards', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Medical Ethics Curriculum Refresh',
        ownerName: 'Dr. Eleanor Vance',
        rationale: 'Emerging biomedical issues',
      });
    });

    // Submit
    act(() => {
      result.current.transitionProposalStatus('submitted', 'Dr. Eleanor Vance');
    });

    // Add Review
    act(() => {
      result.current.addGovernanceReview({
        reviewerName: 'Prof. Marcus Thorne',
        reviewerRole: 'Chair, QA Board',
        reviewDate: '2026-03-01',
        findings: 'Well formulated proposal with clear ethical alignment.',
        recommendations: 'Approve subject to seminar tutor briefing.',
        conditions: 'Provide tutor guide prior to semester start.',
      });
    });

    // Recording review automatically advances from submitted to under_review
    expect(result.current.activeProposal?.status).toBe('under_review');
    expect(result.current.activeProposal?.reviews).toHaveLength(1);

    // Cannot approve without a formal recorded decision
    const approveCheck = checkTransitionEligibility(result.current.activeProposal!, 'approved');
    expect(approveCheck.allowed).toBe(false);
    expect(approveCheck.reason).toContain('recorded formal decision');

    // Record formal decision: Approved
    let decRes: { success: boolean; message?: string } | undefined;
    act(() => {
      decRes = result.current.recordGovernanceDecision({
        outcome: 'approved',
        decisionMaker: 'Faculty Academic Board',
        decisionDate: '2026-03-15',
        decisionRationale: 'Board unanimously agreed on pedagogical value and feasibility.',
        conditions: 'Annual report on student feedback.',
      });
    });

    expect(decRes?.success).toBe(true);
    expect(result.current.activeProposal?.status).toBe('approved');
    expect(result.current.activeProposal?.decisions).toHaveLength(1);

    // Historical decision is preserved with immutable data
    const dec = result.current.activeProposal!.decisions[0];
    expect(dec.outcome).toBe('approved');
    expect(dec.decisionMaker).toBe('Faculty Academic Board');
    expect(dec.conditions).toBe('Annual report on student feedback.');

    // Governance history logged
    const decisionEv = result.current.activeProposal!.events.find((e) => e.eventType === 'decision_recorded');
    expect(decisionEv).toBeDefined();
    const approvedEv = result.current.activeProposal!.events.find((e) => e.eventType === 'proposal_approved');
    expect(approvedEv).toBeDefined();
  });

  it('supports returned for revision workflow back to draft', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Engineering Lab Safety Modules',
        ownerName: 'Dr. Jane Goodall',
        rationale: 'New safety protocols',
      });
    });
    act(() => {
      result.current.transitionProposalStatus('submitted', 'Dr. Jane Goodall');
    });
    act(() => {
      result.current.transitionProposalStatus('under_review', 'QA Officer');
    });

    expect(result.current.activeProposal?.status).toBe('under_review');

    // Record Returned for Revision decision
    act(() => {
      result.current.recordGovernanceDecision({
        outcome: 'returned_for_revision',
        decisionMaker: 'Curriculum Committee',
        decisionDate: '2026-04-01',
        decisionRationale: 'Requires detailed risk assessment in lab dimension.',
      });
    });

    // Status returns to draft
    expect(result.current.activeProposal?.status).toBe('draft');

    // Log contains returned_for_revision event
    const revEvent = result.current.activeProposal!.events.find((e) => e.eventType === 'returned_for_revision');
    expect(revEvent).toBeDefined();
    expect(revEvent?.description).toContain('DRAFT for revision');
  });

  it('tracks educational impact assessments across all 6 dimensions with qualitative levels', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Data Science Capstone Redesign',
        ownerName: 'Dr. Claude Shannon',
      });
    });

    const initAssessment = result.current.activeProposal!.impactAssessment;
    expect(Object.keys(initAssessment.dimensions)).toHaveLength(6);
    expect(initAssessment.dimensions.learningOutcomes.impactLevel).toBe('not_assessed');

    // Update learning outcomes impact
    act(() => {
      result.current.updateImpactDimension('learningOutcomes', {
        impactLevel: 'moderate',
        rationale: 'Shifts capstone focus to real-world industrial datasets.',
        evidence: 'Employer advisory board survey 2025',
        mitigation: 'Provide open data starter packs.',
      });
    });

    // Update staff workload impact
    act(() => {
      result.current.updateImpactDimension('staffWorkload', {
        impactLevel: 'high',
        rationale: 'Project supervision hours increase by ~15 hours per staff member.',
        mitigation: 'Appoint 2 graduate teaching assistants for lab support.',
      });
    });

    // Update overall synthesis notes
    act(() => {
      result.current.updateOverallImpactNotes('Significant pedagogical enhancement with manageable workload mitigation.');
    });

    const updated = result.current.activeProposal!.impactAssessment;
    expect(updated.dimensions.learningOutcomes.impactLevel).toBe('moderate');
    expect(updated.dimensions.learningOutcomes.rationale).toContain('real-world industrial datasets');
    expect(updated.dimensions.staffWorkload.impactLevel).toBe('high');
    expect(updated.overallNotes).toContain('Significant pedagogical enhancement');
  });

  it('tracks implementation actions, prevents premature closure, and enforces verification sign-off', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Pharmacology Laboratory Modernization',
        ownerName: 'Dr. Alexander Fleming',
        rationale: 'Modernization of safety protocols',
      });
    });
    act(() => {
      result.current.updateActiveProposal({ status: 'approved' });
    });

    // Advance to in_implementation
    act(() => {
      result.current.transitionProposalStatus('in_implementation', 'Project Lead');
    });
    expect(result.current.activeProposal?.status).toBe('in_implementation');

    // Add 2 actions
    act(() => {
      result.current.addImplementationAction({
        title: 'Procure digital titration equipment',
        assignee: 'Lab Manager',
        dueDate: '2026-08-01',
        status: 'in_progress',
        notes: 'Vendor quotes received',
      });
    });
    act(() => {
      result.current.addImplementationAction({
        title: 'Update student lab manual',
        assignee: 'Dr. Alexander Fleming',
        dueDate: '2026-08-15',
        status: 'not_started',
      });
    });

    expect(result.current.activeProposal?.implementationActions).toHaveLength(2);

    // Attempt closure while actions are incomplete -> blocked
    const closureAttempt = result.current.verifyAndCloseProposal({
      verifiedBy: 'Quality Director',
      verifiedDate: '2026-08-20',
      verifiedBasis: 'Audited laboratory and student handbook',
      closureNotes: 'Sign-off complete',
    });
    expect(closureAttempt.success).toBe(false);
    expect(closureAttempt.message).toContain('not yet completed');
    expect(result.current.activeProposal?.status).toBe('in_implementation');

    // Complete the first action
    const action1 = result.current.activeProposal!.implementationActions[0];
    act(() => {
      result.current.updateImplementationAction(action1.id, {
        status: 'completed',
        completionEvidence: 'Equipment delivered and calibrated on 2026-07-28',
      });
    });

    // Still blocked because action 2 is incomplete
    const secondClosureAttempt = result.current.verifyAndCloseProposal({
      verifiedBy: 'Quality Director',
      verifiedDate: '2026-08-20',
      verifiedBasis: 'Audited laboratory and student handbook',
      closureNotes: 'Sign-off complete',
    });
    expect(secondClosureAttempt.success).toBe(false);

    // Complete the second action
    const action2 = result.current.activeProposal!.implementationActions[1];
    act(() => {
      result.current.updateImplementationAction(action2.id, {
        status: 'completed',
        completionEvidence: 'Handbook PDF published to student intranet',
      });
    });

    // Now all actions are completed -> closure succeeds
    let finalClosure: { success: boolean; message?: string } | undefined;
    act(() => {
      finalClosure = result.current.verifyAndCloseProposal({
        verifiedBy: 'Dr. Eleanor Vance (Faculty Dean)',
        verifiedDate: '2026-08-25',
        verifiedBasis: 'Inspected lab equipment in Room 402 and reviewed online student handbook.',
        closureNotes: 'All changes successfully verified in operational service.',
      });
    });

    expect(finalClosure?.success).toBe(true);
    expect(result.current.activeProposal?.status).toBe('completed');
    expect(result.current.activeProposal?.closure?.verifiedBy).toContain('Dr. Eleanor Vance');
    expect(result.current.activeProposal?.closure?.verifiedBasis).toContain('Room 402');

    // Closure and completion events recorded in audit history
    const closureEv = result.current.activeProposal!.events.find((e) => e.eventType === 'closure_verified');
    const compEv = result.current.activeProposal!.events.find((e) => e.eventType === 'proposal_completed');
    expect(closureEv).toBeDefined();
    expect(compEv).toBeDefined();
  });

  it('keeps proposals and their governance histories strictly isolated', () => {
    const { result } = renderHook(() => useAppState());

    let p1Id = '';
    let p2Id = '';

    act(() => {
      result.current.createProposal({
        title: 'Proposal Alpha',
        ownerName: 'Alice',
        rationale: 'Alpha pedagogical rationale',
      });
    });
    p1Id = result.current.activeProposal!.id;

    act(() => {
      result.current.createProposal({ title: 'Proposal Beta', ownerName: 'Bob' });
    });
    p2Id = result.current.activeProposal!.id;

    expect(p1Id).not.toBe(p2Id);

    // Select Proposal Alpha
    act(() => {
      result.current.setActiveProposalId(p1Id);
    });
    act(() => {
      result.current.transitionProposalStatus('submitted', 'Alice', 'Alpha submission');
    });
    act(() => {
      result.current.addGovernanceReview({
        reviewerName: 'Reviewer A',
        reviewDate: '2026-01-01',
        findings: 'Alpha findings',
        recommendations: 'Alpha recommendations',
      });
    });

    // Switch to Proposal Beta
    act(() => {
      result.current.setActiveProposalId(p2Id);
    });

    // Proposal Beta should still be draft, 0 reviews, 1 initial creation event
    expect(result.current.activeProposal?.status).toBe('draft');
    expect(result.current.activeProposal?.reviews).toHaveLength(0);
    expect(result.current.activeProposal?.events).toHaveLength(1);

    // Switch back to Proposal Alpha
    act(() => {
      result.current.setActiveProposalId(p1Id);
    });

    expect(result.current.activeProposal?.status).toBe('under_review');
    expect(result.current.activeProposal?.reviews).toHaveLength(1);
    expect(result.current.activeProposal?.events.length).toBeGreaterThanOrEqual(3);
  });

  it('Invariant 1 & 2: prevents formal decisions from leaving proposal in contradictory status and requires under_review state', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Jurisprudence Syllabus Realignment',
        ownerName: 'Prof. Holmes',
        rationale: 'Case law updates',
      });
    });

    // In draft status, recording a formal governance decision must be rejected
    let res: { success: boolean; message?: string } | undefined;
    act(() => {
      res = result.current.recordGovernanceDecision({
        outcome: 'approved',
        decisionMaker: 'Faculty Committee',
        decisionDate: '2026-05-01',
        decisionRationale: 'Premature decision attempt',
      });
    });

    expect(res?.success).toBe(false);
    expect(res?.message).toContain('under committee review');
    expect(result.current.activeProposal?.status).toBe('draft');
    expect(result.current.activeProposal?.decisions).toHaveLength(0);

    // Advance to submitted
    act(() => {
      result.current.transitionProposalStatus('submitted', 'Prof. Holmes');
    });

    // Still cannot record decision while in submitted (needs review stage)
    act(() => {
      res = result.current.recordGovernanceDecision({
        outcome: 'approved',
        decisionMaker: 'Faculty Committee',
        decisionDate: '2026-05-01',
        decisionRationale: 'Premature decision attempt',
      });
    });
    expect(res?.success).toBe(false);

    // Transition to under_review
    act(() => {
      result.current.transitionProposalStatus('under_review', 'QA Officer');
    });

    // Now decision is accepted and handled consistently as an atomic operation
    act(() => {
      res = result.current.recordGovernanceDecision({
        outcome: 'approved',
        decisionMaker: 'Faculty Committee',
        decisionDate: '2026-05-02',
        decisionRationale: 'Unanimous faculty approval after board review.',
      });
    });

    expect(res?.success).toBe(true);
    expect(result.current.activeProposal?.status).toBe('approved');
    expect(result.current.activeProposal?.decisions).toHaveLength(1);
    expect(result.current.activeProposal?.events.some((e) => e.eventType === 'proposal_approved')).toBe(true);
  });

  it('Invariant 4: deliberate reopening preserves previous decisions and closure evidence while resetting active closure', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Clinical Skills OSCE Format Revision',
        ownerName: 'Dr. Gregory House',
        rationale: 'Station duration adjustments',
      });
    });

    // Fast-forward to completed
    act(() => {
      result.current.updateActiveProposal({ status: 'in_implementation' });
    });

    act(() => {
      result.current.verifyAndCloseProposal({
        verifiedBy: 'Dean of Medicine',
        verifiedDate: '2026-06-15',
        verifiedBasis: 'Audited all OSCE simulation labs and student schedules.',
        closureNotes: 'All changes live.',
      });
    });

    expect(result.current.activeProposal?.status).toBe('completed');
    expect(result.current.activeProposal?.closure).toBeDefined();

    // Reopen completed proposal for implementation
    let reopenRes: { success: boolean; message?: string } | undefined;
    act(() => {
      reopenRes = result.current.reopenProposal(
        'QA Officer',
        'New external examiner recommendation requires extra briefing action'
      );
    });

    expect(reopenRes?.success).toBe(true);
    expect(result.current.activeProposal?.status).toBe('in_implementation');
    // Active closure is reset so completing again requires fresh closure verification
    expect(result.current.activeProposal?.closure).toBeUndefined();

    // Event history preserves the reopening event with previous closure evidence
    const reopenEvent = result.current.activeProposal?.events.find(
      (e) => e.eventType === 'proposal_reopened'
    );
    expect(reopenEvent).toBeDefined();
    expect(reopenEvent?.actor).toBe('QA Officer');
    expect(reopenEvent?.description).toContain('deliberately reopened');
    expect(reopenEvent?.metadata?.previousClosure).toBeDefined();
  });

  it('Invariant 5: prevents reuse of an old approval decision if proposal was subsequently returned for revision or reopened', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Microbiology Lab Practicals',
        ownerName: 'Dr. Pasteur',
        rationale: 'Biosafety level update',
      });
    });

    act(() => {
      result.current.transitionProposalStatus('submitted', 'Dr. Pasteur');
    });

    act(() => {
      result.current.transitionProposalStatus('under_review', 'QA Officer');
    });

    // Record formal approval
    act(() => {
      result.current.recordGovernanceDecision({
        outcome: 'approved',
        decisionMaker: 'Academic Council',
        decisionDate: '2026-01-10',
        decisionRationale: 'Initial approval',
      });
    });

    expect(result.current.activeProposal?.status).toBe('approved');

    // Return to draft for revision
    act(() => {
      result.current.appendGovernanceEvent(
        result.current.activeProposal!.id,
        'returned_for_revision',
        'Dean',
        'Returned for revision due to chemical procurement issues'
      );
      result.current.updateActiveProposal({ status: 'draft' });
    });

    // Re-submit and move back to under_review
    act(() => {
      result.current.transitionProposalStatus('submitted', 'Dr. Pasteur');
    });
    act(() => {
      result.current.transitionProposalStatus('under_review', 'QA Officer');
    });

    // Now in under_review, check eligibility to transition to approved using the old approval decision
    const staleCheck = checkTransitionEligibility(result.current.activeProposal!, 'approved');
    expect(staleCheck.allowed).toBe(false);
    expect(staleCheck.reason).toContain('A new formal decision must be recorded');
  });

  it('Invariant 6: enforces deliberate closure notes for zero-action implementation plans', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Nomenclature Harmonization Across Modules',
        ownerName: 'Registrar Office',
        rationale: 'Terminology consistency',
      });
    });

    act(() => {
      result.current.updateActiveProposal({ status: 'in_implementation', implementationActions: [] });
    });

    // Attempting closure without closure notes for zero-action plan fails
    let res: { success: boolean; message?: string } | undefined;
    act(() => {
      res = result.current.verifyAndCloseProposal({
        verifiedBy: 'Registrar',
        verifiedDate: '2026-07-01',
        verifiedBasis: 'Reviewed catalog',
        closureNotes: '   ',
      });
    });

    expect(res?.success).toBe(false);
    expect(res?.message).toContain('Zero-action implementation plans require deliberate closure notes');
    expect(result.current.activeProposal?.status).toBe('in_implementation');

    // With deliberate closure notes, closure succeeds
    act(() => {
      res = result.current.verifyAndCloseProposal({
        verifiedBy: 'Registrar',
        verifiedDate: '2026-07-01',
        verifiedBasis: 'Reviewed catalog publication',
        closureNotes: 'Zero operational actions required as change only affected catalog textual descriptions.',
      });
    });

    expect(res?.success).toBe(true);
    expect(result.current.activeProposal?.status).toBe('completed');
  });

  it('Invariant 7: prevents editing, deleting, or adding actions on a completed proposal', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'Biochemistry Seminar Structure',
        ownerName: 'Dr. Rosalind Franklin',
      });
    });

    act(() => {
      result.current.addImplementationAction({
        title: 'Initial action item',
        assignee: 'Lab Tech',
        status: 'completed',
      });
    });

    act(() => {
      result.current.updateActiveProposal({ status: 'in_implementation' });
    });

    act(() => {
      result.current.verifyAndCloseProposal({
        verifiedBy: 'Head of School',
        verifiedDate: '2026-08-01',
        verifiedBasis: 'Full audit complete',
        closureNotes: 'Approved and archived',
      });
    });

    expect(result.current.activeProposal?.status).toBe('completed');
    const originalAction = result.current.activeProposal!.implementationActions[0];

    // Attempting to add an action on completed proposal
    act(() => {
      result.current.addImplementationAction({
        title: 'Illegal late action',
        assignee: 'Someone',
        status: 'not_started',
      });
    });
    expect(result.current.activeProposal?.implementationActions).toHaveLength(1);

    // Attempting to update existing action on completed proposal
    act(() => {
      result.current.updateImplementationAction(originalAction.id, {
        status: 'in_progress',
        title: 'Tampered title',
      });
    });
    expect(result.current.activeProposal?.implementationActions[0].status).toBe('completed');
    expect(result.current.activeProposal?.implementationActions[0].title).toBe('Initial action item');

    // Attempting to delete action on completed proposal
    act(() => {
      result.current.deleteImplementationAction(originalAction.id);
    });
    expect(result.current.activeProposal?.implementationActions).toHaveLength(1);
  });
});
