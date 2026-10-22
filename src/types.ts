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
  | 'approved_with_conditions'
  | 'rejected'
  | 'in_implementation'
  | 'completed';

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

  // Extensible fields reserved for Batch 2 (impact, formal reviews, implementation)
  impactAssessment?: Record<string, unknown>;
  governanceReview?: Record<string, unknown>;
  implementationActions?: unknown[];
}

export interface RepositoryState {
  schemaVersion: '1.0.0';
  proposals: ChangeProposal[];
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
