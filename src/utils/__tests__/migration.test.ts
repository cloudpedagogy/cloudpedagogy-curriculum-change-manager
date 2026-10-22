import { describe, it, expect } from 'vitest';
import {
  isLegacyState,
  isV1_0State,
  isRepositoryState,
  migrateLegacyState,
  migrateV1_0ToV1_1,
  validateRepositoryState,
  createEmptyRepository,
  createNewProposal,
} from '../migration';
import type { LegacyAppState, RepositoryState, RepositoryStateV1_0 } from '../../types';
import { createDefaultImpactAssessment } from '../governance';

describe('Legacy State Detection and Migration', () => {
  const sampleLegacyState: LegacyAppState = {
    meta: {
      programmeName: 'Master of Public Health',
      moduleName: 'Health Policy Analysis',
      level: 'Postgraduate',
      department: 'Public Health',
    },
    versions: [
      {
        id: 'v1',
        title: 'Original Assessment Design',
        description: 'Initial version of assessment and AI guidance',
        sourceType: 'assessment',
        sourceData: {
          assessment: 'Policy Analysis Essay',
          aiUsage: 'limited guidance',
        },
        createdAt: '2025-09-01',
      },
    ],
    comparisons: [],
    changeLog: [
      {
        id: 'c1',
        versionId: 'v1',
        changeSummary: 'Introduced explicit AI integrity guidance',
        rationale: 'Increased use of generative AI required clearer expectations',
        impact: 'Improved transparency and reduced ambiguity for students',
        date: '2026-02-01',
      },
    ],
    institutionalNotes: {
      reviewerNotes: 'Example revision for QA demonstration',
      generalNotes: 'Demo data should remain editable',
      aiInvolvement: 'AI feedback summary',
      risksConcerns: 'Risk of synthetic text',
      assumptions: 'Students understand AI policy',
      capabilityNotes: 'Supports educator reflection',
    },
    lastUpdated: '2026-02-01T12:00:00.000Z',
  };

  it('correctly identifies legacy v0 single-module state', () => {
    expect(isLegacyState(sampleLegacyState)).toBe(true);
    expect(isRepositoryState(sampleLegacyState)).toBe(false);
  });

  it('safely migrates legacy state to v1.1.0 repository with default governance structures', () => {
    const migrated = migrateLegacyState(sampleLegacyState);

    expect(migrated.schemaVersion).toBe('1.1.0');
    expect(migrated.proposals).toHaveLength(1);

    const proposal = migrated.proposals[0];
    expect(proposal.ref).toBe('LEGACY-001');
    expect(proposal.title).toBe('Health Policy Analysis Curriculum Change');
    expect(proposal.context.programmeName).toBe('Master of Public Health');
    expect(proposal.context.moduleName).toBe('Health Policy Analysis');
    expect(proposal.versions).toHaveLength(1);
    expect(proposal.versions[0].title).toBe('Original Assessment Design');
    expect(proposal.changeLog).toHaveLength(1);
    expect(proposal.changeLog[0].changeSummary).toBe('Introduced explicit AI integrity guidance');
    expect(proposal.status).toBe('draft');
    expect(migrated.activeProposalId).toBe(proposal.id);

    // Batch 2 governance structures
    expect(proposal.impactAssessment).toBeDefined();
    expect(Object.keys(proposal.impactAssessment.dimensions)).toHaveLength(6);
    expect(proposal.reviews).toEqual([]);
    expect(proposal.decisions).toEqual([]);
    expect(proposal.implementationActions).toEqual([]);
    expect(proposal.events.length).toBeGreaterThanOrEqual(1);
    expect(proposal.events[0].eventType).toBe('proposal_created');
  });

  it('maintains migration idempotence for legacy states', () => {
    const migrated = migrateLegacyState(sampleLegacyState);
    expect(isRepositoryState(migrated)).toBe(true);
    expect(isLegacyState(migrated)).toBe(false);

    // Validating already-migrated state should accept it without re-migrating
    const validation = validateRepositoryState(migrated);
    expect(validation.valid).toBe(true);
    expect(validation.data?.proposals).toHaveLength(1);
  });

  it('handles empty repository creation with blank-first behavior', () => {
    const empty = createEmptyRepository();
    expect(empty.schemaVersion).toBe('1.1.0');
    expect(empty.proposals).toHaveLength(0);
    expect(empty.activeProposalId).toBeNull();
  });

  it('creates new proposals with sequential reference IDs and initial governance state', () => {
    const p1 = createNewProposal([], { title: 'First Proposal' });
    expect(p1.ref).toMatch(/^CCP-\d{4}-001$/);
    expect(p1.impactAssessment).toBeDefined();
    expect(p1.events).toHaveLength(1);
    expect(p1.events[0].eventType).toBe('proposal_created');

    const p2 = createNewProposal([p1], { title: 'Second Proposal' });
    expect(p2.ref).toMatch(/^CCP-\d{4}-002$/);
  });
});

describe('Batch 1 v1.0.0 Migration to Batch 2 v1.1.0', () => {
  const sampleV1_0State: RepositoryStateV1_0 = {
    schemaVersion: '1.0.0',
    proposals: [
      {
        id: 'prop-v1-001',
        ref: 'CCP-2026-001',
        title: 'Batch 1 Proposal Title',
        category: 'minor_amendment',
        status: 'draft',
        rationale: 'Rationale from v1.0',
        currentSituation: 'Current situation from v1.0',
        proposedChange: 'Proposed change from v1.0',
        intendedBenefits: 'Benefits from v1.0',
        affectedComponents: 'Module CS101',
        ownerName: 'Dr. Turing',
        ownerRole: 'Module Lead',
        targetDate: '2026-09-01',
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-01-15T12:00:00.000Z',
        context: {
          programmeName: 'BSc Computer Science',
          moduleName: 'Algorithms',
          level: 'Level 5',
          department: 'Computing',
        },
        versions: [],
        changeLog: [],
        institutionalNotes: {
          reviewerNotes: 'Notes from v1.0',
          generalNotes: '',
        },
      },
    ],
    activeProposalId: 'prop-v1-001',
    lastUpdated: '2026-01-15T12:00:00.000Z',
  };

  it('correctly identifies v1.0.0 state', () => {
    expect(isV1_0State(sampleV1_0State)).toBe(true);
    expect(isRepositoryState(sampleV1_0State)).toBe(false);
  });

  it('safely upgrades v1.0.0 state to v1.1.0 without loss of Batch 1 metadata', () => {
    const upgraded = migrateV1_0ToV1_1(sampleV1_0State);
    expect(upgraded.schemaVersion).toBe('1.1.0');
    expect(upgraded.proposals).toHaveLength(1);

    const prop = upgraded.proposals[0];
    expect(prop.id).toBe('prop-v1-001');
    expect(prop.ref).toBe('CCP-2026-001');
    expect(prop.title).toBe('Batch 1 Proposal Title');
    expect(prop.ownerName).toBe('Dr. Turing');
    expect(prop.institutionalNotes.reviewerNotes).toBe('Notes from v1.0');

    // Governance fields populated
    expect(prop.impactAssessment).toBeDefined();
    expect(Object.keys(prop.impactAssessment.dimensions)).toHaveLength(6);
    expect(prop.reviews).toEqual([]);
    expect(prop.decisions).toEqual([]);
    expect(prop.implementationActions).toEqual([]);
    expect(prop.events.length).toBeGreaterThanOrEqual(1);
    expect(prop.events[0].eventType).toBe('proposal_created');
  });

  it('auto-migrates v1.0.0 in validateRepositoryState seamlessly', () => {
    const result = validateRepositoryState(sampleV1_0State);
    expect(result.valid).toBe(true);
    expect(result.data?.schemaVersion).toBe('1.1.0');
    expect(result.data?.proposals[0].id).toBe('prop-v1-001');
  });
});

describe('Repository Validation and JSON Roundtrip', () => {
  it('validates a correct v1.1.0 repository payload', () => {
    const repo: RepositoryState = {
      schemaVersion: '1.1.0',
      proposals: [
        {
          id: 'test-1',
          ref: 'CCP-2026-001',
          title: 'Test Proposal',
          category: 'minor_amendment',
          status: 'draft',
          rationale: 'Rationale',
          currentSituation: 'Current situation',
          proposedChange: 'Proposed change',
          intendedBenefits: 'Benefits',
          affectedComponents: 'Modules: CS101',
          ownerName: 'Dr. Test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          context: {
            programmeName: 'BSc Computer Science',
            moduleName: 'CS101',
            level: 'Level 4',
            department: 'Computer Science',
          },
          versions: [],
          changeLog: [],
          institutionalNotes: {
            reviewerNotes: '',
            generalNotes: '',
          },
          impactAssessment: createDefaultImpactAssessment(),
          reviews: [],
          decisions: [],
          implementationActions: [],
          events: [],
        },
      ],
      activeProposalId: 'test-1',
      lastUpdated: new Date().toISOString(),
    };

    const res = validateRepositoryState(repo);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('rejects invalid JSON payloads missing schemaVersion or proposals', () => {
    const invalidObj = { foo: 'bar' };
    const res = validateRepositoryState(invalidObj);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('rejects non-object payloads', () => {
    expect(validateRepositoryState(null).valid).toBe(false);
    expect(validateRepositoryState('string').valid).toBe(false);
    expect(validateRepositoryState([1, 2, 3]).valid).toBe(false);
  });
});
