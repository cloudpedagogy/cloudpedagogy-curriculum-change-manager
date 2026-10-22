import type {
  ChangeProposal,
  EducationalImpactAssessment,
  GovernanceEvent,
  GovernanceEventType,
  ImpactDimensionKey,
  ProposalStatus,
} from '../types';
import { generateUUID } from './idGenerator';

export function createDefaultImpactAssessment(): EducationalImpactAssessment {
  return {
    dimensions: {
      learningOutcomes: {
        key: 'learningOutcomes',
        title: 'Learning Outcomes & Curriculum Alignment',
        impactLevel: 'not_assessed',
        rationale: '',
        evidence: '',
        mitigation: '',
      },
      assessmentDesign: {
        key: 'assessmentDesign',
        title: 'Assessment Design & Academic Standards',
        impactLevel: 'not_assessed',
        rationale: '',
        evidence: '',
        mitigation: '',
      },
      studentProgression: {
        key: 'studentProgression',
        title: 'Student Progression & Prerequisites',
        impactLevel: 'not_assessed',
        rationale: '',
        evidence: '',
        mitigation: '',
      },
      teachingDelivery: {
        key: 'teachingDelivery',
        title: 'Teaching Delivery & Learning Resources',
        impactLevel: 'not_assessed',
        rationale: '',
        evidence: '',
        mitigation: '',
      },
      staffWorkload: {
        key: 'staffWorkload',
        title: 'Staff Workload & Implementation Feasibility',
        impactLevel: 'not_assessed',
        rationale: '',
        evidence: '',
        mitigation: '',
      },
      accessibilityInclusion: {
        key: 'accessibilityInclusion',
        title: 'Accessibility, Inclusion & Student Experience',
        impactLevel: 'not_assessed',
        rationale: '',
        evidence: '',
        mitigation: '',
      },
    },
    overallNotes: '',
    lastAssessedAt: new Date().toISOString(),
  };
}

export const IMPACT_DIMENSIONS: Record<
  ImpactDimensionKey,
  { title: string; description: string }
> = {
  learningOutcomes: {
    title: 'Learning Outcomes & Curriculum Alignment',
    description: 'Alignment with degree programme learning outcomes, disciplinary benchmarks, and module specifications.',
  },
  assessmentDesign: {
    title: 'Assessment Design & Academic Standards',
    description: 'Rigor, formative feedback quality, marking load, rubrics, and academic integrity.',
  },
  studentProgression: {
    title: 'Student Progression & Prerequisites',
    description: 'Impact on prerequisite knowledge, pathways, sequencing across years, and transition support.',
  },
  teachingDelivery: {
    title: 'Teaching Delivery & Learning Resources',
    description: 'Contact hours, lab/studio space, LMS materials, software licenses, and reading lists.',
  },
  staffWorkload: {
    title: 'Staff Workload & Implementation Feasibility',
    description: 'Preparation requirements, teaching team readiness, marking allocation, and operational timeline.',
  },
  accessibilityInclusion: {
    title: 'Accessibility, Inclusion & Student Experience',
    description: 'Universal design for learning, accommodations, diverse cohorts, and student representation.',
  },
};

export function createGovernanceEvent(
  eventType: GovernanceEventType,
  actor: string,
  description: string,
  metadata?: Record<string, unknown>
): GovernanceEvent {
  return {
    id: `evt_${generateUUID().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    eventType,
    actor: actor.trim() || 'System',
    description,
    metadata,
  };
}

export const ALLOWED_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['under_review', 'draft', 'withdrawn'],
  under_review: ['approved', 'rejected', 'draft', 'withdrawn'],
  approved: ['in_implementation'],
  rejected: ['draft'], // Reopen as draft for major rework
  in_implementation: ['completed'],
  completed: ['in_implementation'], // Deliberate reopening if an action needs revisiting
  withdrawn: ['draft'], // Reopen draft if withdrawal was premature
};

export function checkTransitionEligibility(
  proposal: ChangeProposal,
  targetStatus: ProposalStatus
): { allowed: boolean; reason?: string } {
  // Check baseline transition table
  const allowedNext = ALLOWED_TRANSITIONS[proposal.status];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition from "${proposal.status.toUpperCase()}" directly to "${targetStatus.toUpperCase()}".`,
    };
  }

  // Pre-conditions for submitting
  if (targetStatus === 'submitted') {
    if (!proposal.title.trim()) {
      return { allowed: false, reason: 'Proposal must have a title before submission.' };
    }
    if (!proposal.rationale.trim() && !proposal.proposedChange.trim()) {
      return {
        allowed: false,
        reason: 'Proposal must detail either proposed changes or educational rationale before submission.',
      };
    }
    if (!proposal.ownerName.trim()) {
      return { allowed: false, reason: 'Proposal must have a designated proposer / responsible lead.' };
    }
  }

  // Pre-conditions for approving
  if (targetStatus === 'approved') {
    const latestDecision = proposal.decisions[proposal.decisions.length - 1];
    if (!latestDecision || latestDecision.outcome !== 'approved') {
      return {
        allowed: false,
        reason: 'Approval requires a recorded formal decision with outcome "Approved".',
      };
    }
    if (!latestDecision.decisionMaker.trim()) {
      return {
        allowed: false,
        reason: 'Approval requires a recorded decision-maker / approving committee.',
      };
    }
    if (!latestDecision.decisionRationale.trim()) {
      return {
        allowed: false,
        reason: 'Approval requires a recorded decision justification / rationale.',
      };
    }

    // Invariant 5: Prevent reuse of an old approval decision if proposal was subsequently returned for revision, reopened, or resubmitted
    const lastApprovalIndex = proposal.events.map((e) => e.eventType).lastIndexOf('proposal_approved');
    if (lastApprovalIndex !== -1) {
      const subsequentRevision = proposal.events.slice(lastApprovalIndex + 1).some(
        (e) =>
          e.eventType === 'returned_for_revision' ||
          e.eventType === 'proposal_reopened' ||
          e.eventType === 'proposal_submitted'
      );
      if (subsequentRevision) {
        return {
          allowed: false,
          reason:
            'Proposal was revised, resubmitted or reopened after its previous approval. A new formal decision must be recorded by the committee.',
        };
      }
    }
  }

  // Pre-conditions for rejecting
  if (targetStatus === 'rejected') {
    const latestDecision = proposal.decisions[proposal.decisions.length - 1];
    if (!latestDecision || latestDecision.outcome !== 'rejected') {
      return {
        allowed: false,
        reason: 'Rejection requires a recorded formal decision with outcome "Rejected".',
      };
    }
    if (!latestDecision.decisionRationale.trim()) {
      return {
        allowed: false,
        reason: 'Rejection requires a documented decision rationale explaining why it was rejected.',
      };
    }
  }

  // Pre-conditions for completing implementation
  if (targetStatus === 'completed') {
    // Check if there are open or blocked actions
    const pendingActions = proposal.implementationActions.filter(
      (a) => a.status === 'not_started' || a.status === 'in_progress' || a.status === 'blocked'
    );
    if (pendingActions.length > 0) {
      return {
        allowed: false,
        reason: `Cannot complete proposal while ${pendingActions.length} action item(s) are still incomplete or blocked.`,
      };
    }

    if (!proposal.closure || !proposal.closure.verifiedBy.trim()) {
      return {
        allowed: false,
        reason: 'Completion requires explicit closure verification (sign-off person and verification basis).',
      };
    }

    if (!proposal.closure.verifiedBasis.trim()) {
      return {
        allowed: false,
        reason: 'Completion requires explicit verification basis / evidence source.',
      };
    }

    // Invariant 6: Zero-action plans require deliberate closure notes
    if (
      proposal.implementationActions.length === 0 &&
      (!proposal.closure.closureNotes || !proposal.closure.closureNotes.trim())
    ) {
      return {
        allowed: false,
        reason:
          'Zero-action implementation plans require deliberate closure notes explaining why no operational actions were necessary.',
      };
    }
  }

  return { allowed: true };
}

export function getImpactSummary(assessment: EducationalImpactAssessment): {
  totalDimensions: number;
  assessedCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  noneCount: number;
  unassessedKeys: ImpactDimensionKey[];
} {
  const keys = Object.keys(assessment.dimensions) as ImpactDimensionKey[];
  let assessedCount = 0;
  let highCount = 0;
  let moderateCount = 0;
  let lowCount = 0;
  let noneCount = 0;
  const unassessedKeys: ImpactDimensionKey[] = [];

  keys.forEach((k) => {
    const dim = assessment.dimensions[k];
    if (dim.impactLevel === 'not_assessed') {
      unassessedKeys.push(k);
    } else {
      assessedCount++;
      if (dim.impactLevel === 'high') highCount++;
      else if (dim.impactLevel === 'moderate') moderateCount++;
      else if (dim.impactLevel === 'low') lowCount++;
      else if (dim.impactLevel === 'none') noneCount++;
    }
  });

  return {
    totalDimensions: keys.length,
    assessedCount,
    highCount,
    moderateCount,
    lowCount,
    noneCount,
    unassessedKeys,
  };
}
