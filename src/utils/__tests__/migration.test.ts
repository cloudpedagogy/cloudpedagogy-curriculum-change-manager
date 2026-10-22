import { describe, it, expect } from 'vitest';
import {
  isLegacyState,
  isRepositoryState,
  migrateLegacyState,
  validateRepositoryState,
  createEmptyRepository,
  createNewProposal,
} from '../migration';
import type { LegacyAppState, RepositoryState } from '../../types';

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

  it('safely migrates legacy state to v1.0.0 repository', () => {
    const migrated = migrateLegacyState(sampleLegacyState);

    expect(migrated.schemaVersion).toBe('1.0.0');
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
  });

  it('maintains migration idempotence', () => {
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
    expect(empty.schemaVersion).toBe('1.0.0');
    expect(empty.proposals).toHaveLength(0);
    expect(empty.activeProposalId).toBeNull();
  });

  it('creates new proposals with sequential reference IDs', () => {
    const p1 = createNewProposal([], { title: 'First Proposal' });
    expect(p1.ref).toMatch(/^CCP-\d{4}-001$/);

    const p2 = createNewProposal([p1], { title: 'Second Proposal' });
    expect(p2.ref).toMatch(/^CCP-\d{4}-002$/);
  });
});

describe('Repository Validation and JSON Roundtrip', () => {
  it('validates a correct repository payload', () => {
    const repo: RepositoryState = {
      schemaVersion: '1.0.0',
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
