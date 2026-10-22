export type ChangeCategory =
  | 'minor_amendment'
  | 'major_modification'
  | 'assessment_redesign'
  | 'ai_guidance_update'
  | 'learning_outcomes_revision'
  | 'structural_change'
  | 'other';

export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'in_implementation'
  | 'completed'
  | 'withdrawn';

export interface CurriculumContext {
  programmeName: string;
  moduleName: string;
  level: string;
  department: string;
  currentSituation?: string;
}

// Backward compatibility alias
export type Meta = CurriculumContext;

export interface Version {
  id: string;
  title: string;
  description: string;
  sourceType: 'assessment' | 'integrity' | 'manual';
  sourceData: Record<string, unknown>;
  createdAt: string;
  createdBy?: string;
  notes?: string;
  isManual?: boolean;
}

export interface Comparison {
  id: string;
  versionAId: string;
  versionBId: string;
  comparisonNotes?: string;
}

export interface ChangeLogEntry {
  id: string;
  versionId: string;
  changeSummary: string;
  rationale: string;
  impact: string;
  date: string;
}

export interface InstitutionalNotes {
  reviewerNotes: string;
  generalNotes: string;
  aiInvolvement?: string;
  risksConcerns?: string;
  assumptions?: string;
  capabilityNotes?: string;
}

// --- Batch 2 Governance & Educational Impact Structures ---

export type ImpactLevel = 'not_assessed' | 'none' | 'low' | 'moderate' | 'high';

export type ImpactDimensionKey =
  | 'learningOutcomes'
  | 'assessmentDesign'
  | 'studentProgression'
  | 'teachingDelivery'
  | 'staffWorkload'
  | 'accessibilityInclusion';

export interface ImpactDimension {
  key: ImpactDimensionKey;
  title: string;
  impactLevel: ImpactLevel;
  rationale: string;
  evidence?: string;
  mitigation?: string;
}

export interface EducationalImpactAssessment {
  dimensions: Record<ImpactDimensionKey, ImpactDimension>;
  overallNotes?: string;
  lastAssessedAt?: string;
}

export interface GovernanceReview {
  id: string;
  reviewerName: string;
  reviewerRole?: string;
  reviewDate: string;
  findings: string;
  recommendations: string;
  revisionRequests?: string;
  conditions?: string;
}

export type DecisionOutcome = 'approved' | 'rejected' | 'returned_for_revision';

export interface GovernanceDecision {
  id: string;
  outcome: DecisionOutcome;
  decisionMaker: string;
  decisionDate: string;
  decisionRationale: string;
  conditions?: string;
  targetSnapshotId?: string;
}

export type ActionStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed';

export interface ImplementationAction {
  id: string;
  title: string;
  assignee: string;
  dueDate?: string;
  status: ActionStatus;
  notes?: string;
  completionEvidence?: string;
  completedAt?: string;
}

export interface ProposalClosure {
  verifiedBy: string;
  verifiedDate: string;
  closureNotes: string;
  verifiedBasis: string;
}

export type GovernanceEventType =
  | 'proposal_created'
  | 'proposal_submitted'
  | 'returned_for_revision'
  | 'under_review'
  | 'review_recorded'
  | 'decision_recorded'
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'implementation_started'
  | 'action_added'
  | 'action_updated'
  | 'action_completed'
  | 'closure_verified'
  | 'proposal_completed'
  | 'proposal_withdrawn'
  | 'proposal_reopened';

export interface GovernanceEvent {
  id: string;
  timestamp: string;
  eventType: GovernanceEventType;
  actor: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ChangeProposal {
  id: string; // Stable internal UUID
  ref: string; // User-facing reference (e.g., CCP-2026-001)
  title: string;
  category: ChangeCategory;
  status: ProposalStatus;
  rationale: string;
  currentSituation: string;
  proposedChange: string;
  intendedBenefits: string;
  affectedComponents: string;
  ownerName: string;
  ownerRole?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;

  // Curriculum context metadata
  context: CurriculumContext;

  // Associated version snapshots & change log
  versions: Version[];
  changeLog: ChangeLogEntry[];
  institutionalNotes: InstitutionalNotes;
  comparisons?: Comparison[];

  // Batch 2 governance structures
  impactAssessment: EducationalImpactAssessment;
  reviews: GovernanceReview[];
  decisions: GovernanceDecision[];
  implementationActions: ImplementationAction[];
  closure?: ProposalClosure;
  events: GovernanceEvent[];
}

export interface RepositoryState {
  schemaVersion: '1.1.0';
  proposals: ChangeProposal[];
  activeProposalId: string | null;
  lastUpdated: string;
}

// Prior repository version (Batch 1) for safe migration
export interface RepositoryStateV1_0 {
  schemaVersion: '1.0.0';
  proposals: Array<Partial<ChangeProposal> & {
    id: string;
    ref: string;
    title: string;
    category: ChangeCategory;
    status: ProposalStatus;
    context: CurriculumContext;
    versions: Version[];
    changeLog: ChangeLogEntry[];
    institutionalNotes: InstitutionalNotes;
  }>;
  activeProposalId: string | null;
  lastUpdated: string;
}

// Legacy structure for safe migration
export interface LegacyAppState {
  meta: {
    programmeName: string;
    moduleName: string;
    level: string;
    department: string;
  };
  versions: Version[];
  comparisons?: Comparison[];
  changeLog: ChangeLogEntry[];
  institutionalNotes: InstitutionalNotes;
  lastUpdated: string;
}

// Backward compatibility alias for single proposal view
export interface AppState {
  meta: Meta;
  versions: Version[];
  comparisons: Comparison[];
  changeLog: ChangeLogEntry[];
  institutionalNotes: InstitutionalNotes;
  lastUpdated: string;
}
