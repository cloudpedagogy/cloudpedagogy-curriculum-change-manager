import type {
  ChangeProposal,
  LegacyAppState,
  RepositoryState,
} from '../types';
import { generateProposalRef, generateUUID } from './idGenerator';

/**
 * Checks if a data structure matches the legacy v0 single-record AppState
 */
export function isLegacyState(data: unknown): data is LegacyAppState {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;

  // A legacy state does not have schemaVersion or proposals
  if ('schemaVersion' in candidate || 'proposals' in candidate) return false;

  // It must have meta and versions
  const hasMeta =
    candidate.meta !== null &&
    typeof candidate.meta === 'object';
  const hasVersions = Array.isArray(candidate.versions);

  return hasMeta && hasVersions;
}

/**
 * Checks if a data structure is already a valid RepositoryState (v1.0.0)
 */
export function isRepositoryState(data: unknown): data is RepositoryState {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;

  return (
    candidate.schemaVersion === '1.0.0' &&
    Array.isArray(candidate.proposals)
  );
}

/**
 * Safely converts a legacy single-module workspace into a valid v1.0.0 multi-proposal RepositoryState
 */
export function migrateLegacyState(legacy: LegacyAppState): RepositoryState {
  const proposalId = generateUUID();
  const title = legacy.meta?.moduleName
    ? `${legacy.meta.moduleName} Curriculum Change`
    : legacy.meta?.programmeName
      ? `${legacy.meta.programmeName} Revision`
      : 'Migrated Curriculum Change Record';

  const firstChange = legacy.changeLog?.[0];
  const firstVersion = legacy.versions?.[0];

  const migratedProposal: ChangeProposal = {
    id: proposalId,
    ref: 'LEGACY-001',
    title,
    category: 'minor_amendment',
    status: 'draft',
    rationale: firstChange?.rationale || 'Migrated from previous single-module workspace record.',
    currentSituation: legacy.institutionalNotes?.generalNotes || '',
    proposedChange: firstChange?.changeSummary || firstVersion?.description || 'Legacy curriculum modifications',
    intendedBenefits: firstChange?.impact || '',
    affectedComponents: legacy.meta?.moduleName
      ? `Module: ${legacy.meta.moduleName}`
      : legacy.meta?.programmeName
        ? `Programme: ${legacy.meta.programmeName}`
        : '',
    ownerName: 'Curriculum Lead',
    ownerRole: 'Module Leader',
    createdAt: firstVersion?.createdAt || legacy.lastUpdated || new Date().toISOString(),
    updatedAt: legacy.lastUpdated || new Date().toISOString(),
    context: {
      programmeName: legacy.meta?.programmeName || '',
      moduleName: legacy.meta?.moduleName || '',
      level: legacy.meta?.level || '',
      department: legacy.meta?.department || '',
      currentSituation: legacy.institutionalNotes?.generalNotes || '',
    },
    versions: Array.isArray(legacy.versions) ? legacy.versions : [],
    changeLog: Array.isArray(legacy.changeLog) ? legacy.changeLog : [],
    institutionalNotes: legacy.institutionalNotes || {
      reviewerNotes: '',
      generalNotes: '',
      aiInvolvement: '',
      risksConcerns: '',
      assumptions: '',
      capabilityNotes: '',
    },
    comparisons: Array.isArray(legacy.comparisons) ? legacy.comparisons : [],
  };

  return {
    schemaVersion: '1.0.0',
    proposals: [migratedProposal],
    activeProposalId: proposalId,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Validates a loaded or imported repository payload.
 */
export function validateRepositoryState(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: RepositoryState;
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid JSON: payload must be a non-null object.'] };
  }

  // Check if legacy
  if (isLegacyState(data)) {
    return {
      valid: true,
      errors: [],
      data: migrateLegacyState(data),
    };
  }

  const candidate = data as Record<string, unknown>;

  if (candidate.schemaVersion !== '1.0.0') {
    errors.push(`Unsupported schemaVersion "${String(candidate.schemaVersion)}". Expected "1.0.0".`);
  }

  if (!Array.isArray(candidate.proposals)) {
    errors.push('Repository is missing a valid "proposals" array.');
  } else {
    candidate.proposals.forEach((p, idx) => {
      if (!p || typeof p !== 'object') {
        errors.push(`Proposal at index ${idx} is not an object.`);
        return;
      }
      const prop = p as Record<string, unknown>;
      if (!prop.id || typeof prop.id !== 'string') {
        errors.push(`Proposal at index ${idx} is missing a string "id".`);
      }
      if (!prop.title || typeof prop.title !== 'string') {
        errors.push(`Proposal at index ${idx} is missing a string "title".`);
      }
      if (!prop.context || typeof prop.context !== 'object') {
        errors.push(`Proposal at index ${idx} is missing a valid "context" object.`);
      }
      if (!Array.isArray(prop.versions)) {
        errors.push(`Proposal at index ${idx} is missing a "versions" array.`);
      }
      if (!Array.isArray(prop.changeLog)) {
        errors.push(`Proposal at index ${idx} is missing a "changeLog" array.`);
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: data as RepositoryState,
  };
}

/**
 * Returns a pristine empty repository state.
 */
export function createEmptyRepository(): RepositoryState {
  return {
    schemaVersion: '1.0.0',
    proposals: [],
    activeProposalId: null,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Creates a new blank ChangeProposal with stable UUID and sequential ref
 */
export function createNewProposal(
  existingProposals: ChangeProposal[],
  initial?: Partial<ChangeProposal>
): ChangeProposal {
  const now = new Date().toISOString();
  return {
    id: generateUUID(),
    ref: generateProposalRef(existingProposals),
    title: initial?.title || 'Untitled Curriculum Change Proposal',
    category: initial?.category || 'minor_amendment',
    status: 'draft',
    rationale: initial?.rationale || '',
    currentSituation: initial?.currentSituation || '',
    proposedChange: initial?.proposedChange || '',
    intendedBenefits: initial?.intendedBenefits || '',
    affectedComponents: initial?.affectedComponents || '',
    ownerName: initial?.ownerName || '',
    ownerRole: initial?.ownerRole || '',
    targetDate: initial?.targetDate || '',
    createdAt: now,
    updatedAt: now,
    context: {
      programmeName: initial?.context?.programmeName || '',
      moduleName: initial?.context?.moduleName || '',
      level: initial?.context?.level || '',
      department: initial?.context?.department || '',
      currentSituation: initial?.context?.currentSituation || '',
    },
    versions: initial?.versions || [],
    changeLog: initial?.changeLog || [],
    institutionalNotes: initial?.institutionalNotes || {
      reviewerNotes: '',
      generalNotes: '',
      aiInvolvement: '',
      risksConcerns: '',
      assumptions: '',
      capabilityNotes: '',
    },
    comparisons: initial?.comparisons || [],
  };
}
