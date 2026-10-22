import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppState, STORAGE_KEY } from '../useAppState';
import type { Version } from '../../types';

describe('useAppState Multi-Proposal Repository Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with a blank repository when no data exists (blank-first behavior)', () => {
    const { result } = renderHook(() => useAppState());

    expect(result.current.repository.proposals).toHaveLength(0);
    expect(result.current.activeProposal).toBeNull();
    expect(result.current.repository.schemaVersion).toBe('1.1.0');
  });

  it('allows creating a new proposal and automatically sets it as active', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({
        title: 'New Modular Framework',
        ownerName: 'Dr. Sarah Connor',
      });
    });

    expect(result.current.repository.proposals).toHaveLength(1);
    expect(result.current.activeProposal).not.toBeNull();
    expect(result.current.activeProposal?.title).toBe('New Modular Framework');
    expect(result.current.activeProposal?.ownerName).toBe('Dr. Sarah Connor');
    expect(result.current.activeProposal?.ref).toMatch(/^CCP-\d{4}-001$/);
    expect(result.current.activeProposal?.status).toBe('draft');
  });

  it('supports multiple independent proposals and edits them independently', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({ title: 'Proposal Alpha' });
    });
    const idAlpha = result.current.activeProposal?.id as string;

    act(() => {
      result.current.createProposal({ title: 'Proposal Beta' });
    });
    const idBeta = result.current.activeProposal?.id as string;

    expect(result.current.repository.proposals).toHaveLength(2);
    expect(result.current.activeProposal?.id).toBe(idBeta);

    // Update Beta
    act(() => {
      result.current.updateActiveProposal({ rationale: 'Beta specific rationale' });
    });
    expect(result.current.activeProposal?.rationale).toBe('Beta specific rationale');

    // Switch to Alpha
    act(() => {
      result.current.setActiveProposalId(idAlpha);
    });
    expect(result.current.activeProposal?.id).toBe(idAlpha);
    expect(result.current.activeProposal?.title).toBe('Proposal Alpha');
    expect(result.current.activeProposal?.rationale).toBe(''); // Alpha unchanged
  });

  it('persists drafts to localStorage automatically', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({ title: 'Persistent Proposal' });
    });

    const storedRaw = localStorage.getItem(STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    const stored = JSON.parse(storedRaw!);
    expect(stored.proposals).toHaveLength(1);
    expect(stored.proposals[0].title).toBe('Persistent Proposal');
  });

  it('safely deletes proposals and updates the active selection', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({ title: 'P1' });
      result.current.createProposal({ title: 'P2' });
    });
    expect(result.current.repository.proposals).toHaveLength(2);

    const p2Id = result.current.activeProposal?.id as string;
    act(() => {
      result.current.deleteProposal(p2Id);
    });

    expect(result.current.repository.proposals).toHaveLength(1);
    expect(result.current.activeProposal?.title).toBe('P1');
  });

  it('supports creating and editing manual version records', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({ title: 'Version Testing Proposal' });
    });

    const manualVersion: Version = {
      id: 'ver_manual_1',
      title: 'Initial Manual Draft',
      description: 'Testing manual creation',
      sourceType: 'manual',
      isManual: true,
      sourceData: { assessmentMode: 'Oral Examination' },
      createdAt: '2026-10-22',
      createdBy: 'Prof. Tester',
      notes: 'Drafting phase',
    };

    act(() => {
      result.current.addVersionToActive(manualVersion);
    });

    expect(result.current.activeProposal?.versions).toHaveLength(1);
    expect(result.current.activeProposal?.versions[0].title).toBe('Initial Manual Draft');

    // Now edit the manual version
    act(() => {
      result.current.updateVersionInActive({
        ...manualVersion,
        title: 'Updated Manual Draft v2',
        notes: 'Revised after team discussion',
      });
    });

    expect(result.current.activeProposal?.versions[0].title).toBe('Updated Manual Draft v2');
    expect(result.current.activeProposal?.versions[0].notes).toBe('Revised after team discussion');
  });

  it('loads demonstration proposals optionally without unprompted overwrite', () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.loadDemo();
    });

    expect(result.current.repository.proposals.length).toBeGreaterThanOrEqual(2);
    expect(result.current.activeProposal?.ref).toBe('CCP-2026-001');
    expect(result.current.repository.proposals[1].ref).toBe('CCP-2026-002');
  });

  it('rejects invalid JSON files during import without corrupting active workspace', async () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({ title: 'Protected Original Proposal' });
    });

    const invalidFile = new File(['{ "broken": true }'], 'invalid.json', {
      type: 'application/json',
    });

    let importRes: { success: boolean; message: string } | undefined;
    await act(async () => {
      importRes = await result.current.importRepository(invalidFile);
    });

    expect(importRes?.success).toBe(false);
    expect(importRes?.message).toContain('Import rejected');
    // Original proposal is preserved
    expect(result.current.repository.proposals).toHaveLength(1);
    expect(result.current.repository.proposals[0].title).toBe('Protected Original Proposal');
  });

  it('safely cancels import replacement when user declines confirmation', async () => {
    const { result } = renderHook(() => useAppState());

    act(() => {
      result.current.createProposal({ title: 'Existing Active Work' });
    });

    const validNewRepo = {
      schemaVersion: '1.0.0',
      proposals: [
        {
          id: 'imported-1',
          ref: 'CCP-2026-999',
          title: 'Incoming Proposal',
          category: 'other',
          status: 'draft',
          rationale: 'Imported',
          currentSituation: '',
          proposedChange: '',
          intendedBenefits: '',
          affectedComponents: '',
          ownerName: 'External',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          context: { programmeName: '', moduleName: '', level: '', department: '' },
          versions: [],
          changeLog: [],
          institutionalNotes: { reviewerNotes: '', generalNotes: '' },
        },
      ],
      activeProposalId: 'imported-1',
      lastUpdated: new Date().toISOString(),
    };

    const validFile = new File([JSON.stringify(validNewRepo)], 'valid.json', {
      type: 'application/json',
    });

    let importRes: { success: boolean; message: string } | undefined;
    await act(async () => {
      // User declines overwrite
      importRes = await result.current.importRepository(validFile, () => false);
    });

    expect(importRes?.success).toBe(false);
    expect(importRes?.message).toContain('cancelled');
    // Original proposal is retained intact
    expect(result.current.repository.proposals[0].title).toBe('Existing Active Work');
  });
});
