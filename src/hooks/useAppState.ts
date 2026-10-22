import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ChangeProposal,
  RepositoryState,
  Version,
  ChangeLogEntry,
  CurriculumContext,
} from '../types';
import {
  createEmptyRepository,
  createNewProposal,
  isLegacyState,
  isRepositoryState,
  migrateLegacyState,
  validateRepositoryState,
} from '../utils/migration';
import { createDemoRepository } from '../utils/demoData';

export const STORAGE_KEY = 'cp_curriculum_change_manager_state';
export const LEGACY_BACKUP_KEY = 'cp_curriculum_change_manager_state_legacy_backup';

export function useAppState() {
  const [repository, setRepository] = useState<RepositoryState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isRepositoryState(parsed)) {
          return parsed;
        }
        if (isLegacyState(parsed)) {
          // Preserve legacy data as a safety backup
          localStorage.setItem(LEGACY_BACKUP_KEY, saved);
          return migrateLegacyState(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved state from localStorage:', e);
    }
    // Default to a blank workspace
    return createEmptyRepository();
  });

  // Sync to localStorage whenever repository changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(repository));
    } catch (e) {
      console.error('Failed to persist repository state to localStorage:', e);
    }
  }, [repository]);

  // Derived active proposal
  const activeProposal = useMemo(() => {
    if (!repository.activeProposalId || repository.proposals.length === 0) {
      return null;
    }
    return (
      repository.proposals.find((p) => p.id === repository.activeProposalId) ||
      repository.proposals[0] ||
      null
    );
  }, [repository.activeProposalId, repository.proposals]);

  // Set active proposal ID
  const setActiveProposalId = useCallback((id: string | null) => {
    setRepository((prev) => ({
      ...prev,
      activeProposalId: id,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Create a new proposal
  const createProposal = useCallback((initial?: Partial<ChangeProposal>): ChangeProposal => {
    let createdProposal: ChangeProposal | null = null;
    setRepository((prev) => {
      const newProp = createNewProposal(prev.proposals, initial);
      createdProposal = newProp;
      return {
        ...prev,
        proposals: [newProp, ...prev.proposals],
        activeProposalId: newProp.id,
        lastUpdated: new Date().toISOString(),
      };
    });
    return createdProposal!;
  }, []);

  // Update a proposal by ID
  const updateProposal = useCallback((id: string, updates: Partial<ChangeProposal>) => {
    setRepository((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Update active proposal
  const updateActiveProposal = useCallback(
    (updates: Partial<ChangeProposal>) => {
      if (!activeProposal) return;
      updateProposal(activeProposal.id, updates);
    },
    [activeProposal, updateProposal]
  );

  // Delete a proposal by ID
  const deleteProposal = useCallback((id: string): boolean => {
    let deleted = false;
    setRepository((prev) => {
      const remaining = prev.proposals.filter((p) => p.id !== id);
      if (remaining.length === prev.proposals.length) return prev;
      deleted = true;
      const nextActiveId =
        prev.activeProposalId === id
          ? remaining.length > 0
            ? remaining[0].id
            : null
          : prev.activeProposalId;
      return {
        ...prev,
        proposals: remaining,
        activeProposalId: nextActiveId,
        lastUpdated: new Date().toISOString(),
      };
    });
    return deleted;
  }, []);

  // Reset repository to clean blank slate
  const resetRepository = useCallback(() => {
    const empty = createEmptyRepository();
    setRepository(empty);
  }, []);

  // Load demonstration workspace
  const loadDemo = useCallback(() => {
    const demo = createDemoRepository();
    setRepository(demo);
  }, []);

  // Export workspace as JSON
  const exportRepository = useCallback(() => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(repository, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `cloudpedagogy-curriculum-change-workspace-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [repository]);

  // Import workspace with validation and overwrite safeguard
  const importRepository = useCallback(
    (
      file: File,
      onConfirmOverwrite?: () => Promise<boolean> | boolean
    ): Promise<{ success: boolean; message: string }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            const validation = validateRepositoryState(parsed);

            if (!validation.valid || !validation.data) {
              const msg = `Import rejected: ${validation.errors.join(' ')}`;
              resolve({ success: false, message: msg });
              return;
            }

            // Confirm overwrite if user currently has proposals
            if (repository.proposals.length > 0 && onConfirmOverwrite) {
              const proceed = await onConfirmOverwrite();
              if (!proceed) {
                resolve({ success: false, message: 'Import cancelled by user.' });
                return;
              }
            }

            setRepository(validation.data);
            resolve({
              success: true,
              message: `Successfully imported workspace with ${validation.data.proposals.length} proposal(s).`,
            });
          } catch (err) {
            resolve({
              success: false,
              message: `Failed to parse JSON file: ${err instanceof Error ? err.message : 'Unknown parsing error'}`,
            });
          }
        };
        reader.onerror = () => {
          resolve({ success: false, message: 'Failed to read file from disk.' });
        };
        reader.readAsText(file);
      });
    },
    [repository.proposals.length]
  );

  // Proposal-level helpers for backward compatibility with existing child components
  const updateActiveContext = useCallback(
    (context: CurriculumContext) => {
      if (!activeProposal) return;
      updateActiveProposal({ context });
    },
    [activeProposal, updateActiveProposal]
  );

  const addVersionToActive = useCallback(
    (version: Version) => {
      if (!activeProposal) return;
      updateActiveProposal({
        versions: [...activeProposal.versions, version],
      });
    },
    [activeProposal, updateActiveProposal]
  );

  const updateVersionInActive = useCallback(
    (updatedVersion: Version) => {
      if (!activeProposal) return;
      updateActiveProposal({
        versions: activeProposal.versions.map((v) =>
          v.id === updatedVersion.id ? updatedVersion : v
        ),
      });
    },
    [activeProposal, updateActiveProposal]
  );

  const removeVersionFromActive = useCallback(
    (versionId: string) => {
      if (!activeProposal) return;
      updateActiveProposal({
        versions: activeProposal.versions.filter((v) => v.id !== versionId),
        // Clean up any change log references
        changeLog: activeProposal.changeLog.map((c) =>
          c.versionId === versionId ? { ...c, versionId: '' } : c
        ),
      });
    },
    [activeProposal, updateActiveProposal]
  );

  const updateChangeLogInActive = useCallback(
    (changeLog: ChangeLogEntry[]) => {
      if (!activeProposal) return;
      updateActiveProposal({ changeLog });
    },
    [activeProposal, updateActiveProposal]
  );

  return {
    repository,
    activeProposal,
    setActiveProposalId,
    createProposal,
    updateProposal,
    updateActiveProposal,
    deleteProposal,
    loadDemo,
    resetRepository,
    exportRepository,
    importRepository,
    updateActiveContext,
    addVersionToActive,
    updateVersionInActive,
    removeVersionFromActive,
    updateChangeLogInActive,
  };
}
