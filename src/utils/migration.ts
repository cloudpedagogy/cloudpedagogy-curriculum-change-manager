import type {
  ChangeProposal,
  LegacyAppState,
  RepositoryState,
  RepositoryStateV1_0,
} from '../types';
import { generateProposalRef, generateUUID } from './idGenerator';
import { createDefaultImpactAssessment, createGovernanceEvent } from './governance';

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
 * Checks if a data structure is a Batch 1 v1.0.0 RepositoryState
 */
export function isV1_0State(data: unknown): data is RepositoryStateV1_0 {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;

  return (
    candidate.schemaVersion === '1.0.0' &&
    Array.isArray(candidate.proposals)
  );
}

/**
 * Checks if a data structure is already a valid v1.1.0 RepositoryState
 */
export function isRepositoryState(data: unknown): data is RepositoryState {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;

  return (
    candidate.schemaVersion === '1.1.0' &&
    Array.isArray(candidate.proposals)
  );
}

/**
 * Migrates a Batch 1 v1.0.0 repository into v1.1.0 by populating governance fields
 */
export function migrateV1_0ToV1_1(v1: RepositoryStateV1_0): RepositoryState {
  const migratedProposals: ChangeProposal[] = v1.proposals.map((p) => {
    const proposalId = p.id || generateUUID();
    const createdAt = p.createdAt || new Date().toISOString();
    const updatedAt = p.updatedAt || new Date().toISOString();

    const existingEvents = Array.isArray(p.events) ? p.events : [];
    const events =
      existingEvents.length > 0
        ? existingEvents
        : [
            createGovernanceEvent(
              'proposal_created',
              p.ownerName || 'Proposer',
              'Proposal created (migrated from v1.0.0)',
              { migratedFrom: '1.0.0' }
            ),
          ];

    return {
      id: proposalId,
      ref: p.ref || 'CCP-MIGRATED',
      title: p.title || 'Untitled Proposal',
      category: p.category || 'minor_amendment',
      status: p.status || 'draft',
      rationale: p.rationale || '',
      currentSituation: p.currentSituation || '',
      proposedChange: p.proposedChange || '',
      intendedBenefits: p.intendedBenefits || '',
      affectedComponents: p.affectedComponents || '',
      ownerName: p.ownerName || 'Unassigned',
      ownerRole: p.ownerRole || '',
      targetDate: p.targetDate || '',
      createdAt,
      updatedAt,
      context: p.context || {
        programmeName: '',
        moduleName: '',
        level: '',
        department: '',
      },
      versions: Array.isArray(p.versions) ? p.versions : [],
      changeLog: Array.isArray(p.changeLog) ? p.changeLog : [],
      institutionalNotes: p.institutionalNotes || {
        reviewerNotes: '',
        generalNotes: '',
      },
      comparisons: Array.isArray(p.comparisons) ? p.comparisons : [],
      // Batch 2 governance structures
      impactAssessment: p.impactAssessment && typeof p.impactAssessment === 'object' && 'dimensions' in p.impactAssessment
        ? (p.impactAssessment as unknown as ChangeProposal['impactAssessment'])
        : createDefaultImpactAssessment(),
      reviews: Array.isArray(p.reviews) ? p.reviews : [],
      decisions: Array.isArray(p.decisions) ? p.decisions : [],
      implementationActions: Array.isArray(p.implementationActions) ? p.implementationActions : [],
      closure: p.closure || undefined,
      events,
    };
  });

  return {
    schemaVersion: '1.1.0',
    proposals: migratedProposals,
    activeProposalId: v1.activeProposalId,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Safely converts a legacy single-module workspace into a valid v1.1.0 multi-proposal RepositoryState
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
  const createdAt = firstVersion?.createdAt || legacy.lastUpdated || new Date().toISOString();
  const updatedAt = legacy.lastUpdated || new Date().toISOString();

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
    createdAt,
    updatedAt,
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
    // Batch 2 governance structures
    impactAssessment: createDefaultImpactAssessment(),
    reviews: [],
    decisions: [],
    implementationActions: [],
    closure: undefined,
    events: [
      createGovernanceEvent(
        'proposal_created',
        'Legacy System',
        'Curriculum proposal migrated from legacy single-record workspace',
        { source: 'v0_legacy' }
      ),
    ],
  };

  return {
    schemaVersion: '1.1.0',
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

  // Check if legacy v0
  if (isLegacyState(data)) {
    return {
      valid: true,
      errors: [],
      data: migrateLegacyState(data),
    };
  }

  // Check if v1.0.0
  if (isV1_0State(data)) {
    return {
      valid: true,
      errors: [],
      data: migrateV1_0ToV1_1(data),
    };
  }

  const candidate = data as Record<string, unknown>;

  if (candidate.schemaVersion !== '1.1.0') {
    errors.push(
      `Unsupported schemaVersion "${String(candidate.schemaVersion)}". Expected "1.1.0" (or migratable "1.0.0").`
    );
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

  // Ensure any optional governance fields have safe defaults
  const validatedState = candidate as unknown as RepositoryState;
  const sanitizedProposals = validatedState.proposals.map((p) => ({
    ...p,
    impactAssessment: p.impactAssessment || createDefaultImpactAssessment(),
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    decisions: Array.isArray(p.decisions) ? p.decisions : [],
    implementationActions: Array.isArray(p.implementationActions) ? p.implementationActions : [],
    events: Array.isArray(p.events) ? p.events : [],
  }));

  return {
    valid: true,
    errors: [],
    data: {
      ...validatedState,
      proposals: sanitizedProposals,
    },
  };
}

/**
 * Returns a pristine empty repository state.
 */
export function createEmptyRepository(): RepositoryState {
  return {
    schemaVersion: '1.1.0',
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
  const ownerName = initial?.ownerName || '';
  const ref = generateProposalRef(existingProposals);

  return {
    id: generateUUID(),
    ref,
    title: initial?.title !== undefined ? initial.title : 'Untitled Curriculum Change Proposal',
    category: initial?.category || 'minor_amendment',
    status: 'draft',
    rationale: initial?.rationale || '',
    currentSituation: initial?.currentSituation || '',
    proposedChange: initial?.proposedChange || '',
    intendedBenefits: initial?.intendedBenefits || '',
    affectedComponents: initial?.affectedComponents || '',
    ownerName,
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
    // Batch 2 governance structures
    impactAssessment: initial?.impactAssessment || createDefaultImpactAssessment(),
    reviews: initial?.reviews || [],
    decisions: initial?.decisions || [],
    implementationActions: initial?.implementationActions || [],
    closure: initial?.closure || undefined,
    events: [
      createGovernanceEvent(
        'proposal_created',
        ownerName || 'Proposer',
        `Curriculum change proposal ${ref} created in draft status`,
        { ref }
      ),
    ],
  };
}
