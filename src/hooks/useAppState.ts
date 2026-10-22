import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ChangeProposal,
  RepositoryState,
  Version,
  ChangeLogEntry,
  CurriculumContext,
  ProposalStatus,
  ImpactDimensionKey,
  ImpactDimension,
  GovernanceReview,
  GovernanceDecision,
  ImplementationAction,
  ProposalClosure,
  GovernanceEventType,
} from '../types';
import {
  createEmptyRepository,
  createNewProposal,
  isLegacyState,
  isV1_0State,
  isRepositoryState,
  migrateLegacyState,
  migrateV1_0ToV1_1,
  validateRepositoryState,
} from '../utils/migration';
import { createDemoRepository } from '../utils/demoData';
import { checkTransitionEligibility, createGovernanceEvent } from '../utils/governance';
import { generateUUID } from '../utils/idGenerator';

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
        if (isV1_0State(parsed)) {
          return migrateV1_0ToV1_1(parsed);
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

  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  // Sync to localStorage whenever repository changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(repository));
      if (storageWarning) {
        setTimeout(() => setStorageWarning(null), 0);
      }
    } catch (e) {
      console.error('Failed to persist repository state to localStorage:', e);
      const errMessage =
        e instanceof Error && e.name === 'QuotaExceededError'
          ? 'Browser storage quota exceeded. Changes cannot be saved locally. Please export your workspace JSON as a backup to prevent data loss.'
          : 'Browser local storage is unavailable or full. Changes will not persist after closing this window. Please export your workspace JSON as a backup.';
      setTimeout(() => setStorageWarning(errMessage), 0);
    }
  }, [repository, storageWarning]);

  const dismissStorageWarning = useCallback(() => {
    setStorageWarning(null);
  }, []);


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

  // Proposal-level helpers for backward compatibility with child components
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

  // --- Batch 2 Governance Operations ---

  // Helper to append a governance event
  const appendGovernanceEvent = useCallback(
    (
      proposalId: string,
      eventType: GovernanceEventType,
      actor: string,
      description: string,
      metadata?: Record<string, unknown>
    ) => {
      const newEvent = createGovernanceEvent(eventType, actor, description, metadata);
      setRepository((prev) => ({
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                events: [...p.events, newEvent],
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
        lastUpdated: new Date().toISOString(),
      }));
    },
    []
  );

  // Transition proposal lifecycle status
  const transitionProposalStatus = useCallback(
    (
      targetStatus: ProposalStatus,
      actor: string,
      reason?: string
    ): { success: boolean; message?: string } => {
      if (!activeProposal) {
        return { success: false, message: 'No active proposal selected.' };
      }

      const check = checkTransitionEligibility(activeProposal, targetStatus);
      if (!check.allowed) {
        return { success: false, message: check.reason };
      }

      const previousStatus = activeProposal.status;
      const isReopeningFromCompleted =
        previousStatus === 'completed' && targetStatus === 'in_implementation';
      const isReopeningFromRejectedOrWithdrawn =
        (previousStatus === 'rejected' || previousStatus === 'withdrawn') && targetStatus === 'draft';

      const eventType: GovernanceEventType =
        isReopeningFromCompleted || isReopeningFromRejectedOrWithdrawn
          ? 'proposal_reopened'
          : targetStatus === 'submitted'
            ? 'proposal_submitted'
            : targetStatus === 'under_review'
              ? 'under_review'
              : targetStatus === 'approved'
                ? 'proposal_approved'
                : targetStatus === 'rejected'
                  ? 'proposal_rejected'
                  : targetStatus === 'in_implementation'
                    ? 'implementation_started'
                    : targetStatus === 'completed'
                      ? 'proposal_completed'
                      : targetStatus === 'withdrawn'
                        ? 'proposal_withdrawn'
                        : 'returned_for_revision';

      const description =
        isReopeningFromCompleted || isReopeningFromRejectedOrWithdrawn
          ? `Proposal deliberately reopened from ${previousStatus.toUpperCase()} to ${targetStatus.toUpperCase()}${
              reason ? `: "${reason}"` : ''
            }`
          : `Proposal transitioned from ${previousStatus.toUpperCase()} to ${targetStatus.toUpperCase()}${
              reason ? `: ${reason}` : ''
            }`;

      const newEvent = createGovernanceEvent(eventType, actor, description, {
        from: previousStatus,
        to: targetStatus,
        reason,
        previousClosure: isReopeningFromCompleted ? activeProposal.closure : undefined,
      });

      updateActiveProposal({
        status: targetStatus,
        closure: isReopeningFromCompleted ? undefined : activeProposal.closure,
        events: [...activeProposal.events, newEvent],
      });

      return { success: true };
    },
    [activeProposal, updateActiveProposal]
  );

  // Update educational impact dimension
  const updateImpactDimension = useCallback(
    (key: ImpactDimensionKey, updates: Partial<ImpactDimension>) => {
      if (!activeProposal) return;
      const currentAssessment = activeProposal.impactAssessment;
      const currentDim = currentAssessment.dimensions[key];

      const updatedAssessment = {
        ...currentAssessment,
        dimensions: {
          ...currentAssessment.dimensions,
          [key]: {
            ...currentDim,
            ...updates,
          },
        },
        lastAssessedAt: new Date().toISOString(),
      };

      updateActiveProposal({
        impactAssessment: updatedAssessment,
      });
    },
    [activeProposal, updateActiveProposal]
  );

  // Update overall impact notes
  const updateOverallImpactNotes = useCallback(
    (overallNotes: string) => {
      if (!activeProposal) return;
      updateActiveProposal({
        impactAssessment: {
          ...activeProposal.impactAssessment,
          overallNotes,
          lastAssessedAt: new Date().toISOString(),
        },
      });
    },
    [activeProposal, updateActiveProposal]
  );

  // Record a formal governance review
  const addGovernanceReview = useCallback(
    (reviewData: Omit<GovernanceReview, 'id'>) => {
      if (!activeProposal) return;
      const review: GovernanceReview = {
        ...reviewData,
        id: `rev_${generateUUID().slice(0, 8)}`,
      };

      const event = createGovernanceEvent(
        'review_recorded',
        review.reviewerName,
        `Governance review recorded with recommendation: "${review.recommendations || 'Completed'}"`,
        { reviewerRole: review.reviewerRole }
      );

      // If in 'submitted' status, automatically advance to 'under_review'
      const nextStatus =
        activeProposal.status === 'submitted' ? 'under_review' : activeProposal.status;

      updateActiveProposal({
        reviews: [...activeProposal.reviews, review],
        status: nextStatus,
        events: [...activeProposal.events, event],
      });
    },
    [activeProposal, updateActiveProposal]
  );

  // Record a formal governance decision
  const recordGovernanceDecision = useCallback(
    (decisionData: Omit<GovernanceDecision, 'id'>): { success: boolean; message?: string } => {
      if (!activeProposal) {
        return { success: false, message: 'No active proposal selected.' };
      }

      if (activeProposal.status !== 'under_review') {
        return {
          success: false,
          message:
            'Formal governance decisions can only be recorded when the proposal is under committee review ("under_review").',
        };
      }

      if (!decisionData.decisionMaker.trim()) {
        return { success: false, message: 'Decision requires a decision-maker / approving body.' };
      }
      if (!decisionData.decisionRationale.trim()) {
        return { success: false, message: 'Decision requires a documented rationale / justification.' };
      }

      const decision: GovernanceDecision = {
        ...decisionData,
        id: `dec_${generateUUID().slice(0, 8)}`,
      };

      const newDecisions = [...activeProposal.decisions, decision];
      const newEvents = [...activeProposal.events];

      newEvents.push(
        createGovernanceEvent(
          'decision_recorded',
          decision.decisionMaker,
          `Formal decision recorded: ${decision.outcome.toUpperCase()} &mdash; ${decision.decisionRationale}`,
          { outcome: decision.outcome, conditions: decision.conditions }
        )
      );

      let targetStatus: ProposalStatus = activeProposal.status;
      if (decision.outcome === 'approved') {
        targetStatus = 'approved';
        newEvents.push(
          createGovernanceEvent(
            'proposal_approved',
            decision.decisionMaker,
            `Proposal approved by ${decision.decisionMaker}${
              decision.conditions ? ` subject to conditions: "${decision.conditions}"` : ''
            }`
          )
        );
      } else if (decision.outcome === 'rejected') {
        targetStatus = 'rejected';
        newEvents.push(
          createGovernanceEvent(
            'proposal_rejected',
            decision.decisionMaker,
            `Proposal rejected by ${decision.decisionMaker}: ${decision.decisionRationale}`
          )
        );
      } else if (decision.outcome === 'returned_for_revision') {
        targetStatus = 'draft';
        newEvents.push(
          createGovernanceEvent(
            'returned_for_revision',
            decision.decisionMaker,
            `Proposal returned to DRAFT for revision: ${decision.decisionRationale}`
          )
        );
      }

      updateActiveProposal({
        decisions: newDecisions,
        status: targetStatus,
        events: newEvents,
      });

      return { success: true };
    },
    [activeProposal, updateActiveProposal]
  );

  // Add implementation action
  const addImplementationAction = useCallback(
    (actionData: Omit<ImplementationAction, 'id'>) => {
      if (!activeProposal || activeProposal.status === 'completed') return;
      const action: ImplementationAction = {
        ...actionData,
        id: `act_${generateUUID().slice(0, 8)}`,
      };

      const event = createGovernanceEvent(
        'action_added',
        action.assignee || activeProposal.ownerName,
        `Implementation action added: "${action.title}"`,
        { assignee: action.assignee, dueDate: action.dueDate }
      );

      updateActiveProposal({
        implementationActions: [...activeProposal.implementationActions, action],
        events: [...activeProposal.events, event],
      });
    },
    [activeProposal, updateActiveProposal]
  );

  // Update implementation action
  const updateImplementationAction = useCallback(
    (actionId: string, updates: Partial<ImplementationAction>) => {
      if (!activeProposal || activeProposal.status === 'completed') return;
      let actionTitle = '';
      let isNowComplete = false;

      const updatedActions = activeProposal.implementationActions.map((a) => {
        if (a.id === actionId) {
          actionTitle = a.title;
          const status = updates.status || a.status;
          const completedAt =
            status === 'completed'
              ? updates.completedAt || a.completedAt || new Date().toISOString().split('T')[0]
              : undefined;

          if (status === 'completed' && a.status !== 'completed') {
            isNowComplete = true;
          }

          return {
            ...a,
            ...updates,
            completedAt,
          };
        }
        return a;
      });

      const newEvents = [...activeProposal.events];
      if (isNowComplete) {
        newEvents.push(
          createGovernanceEvent(
            'action_completed',
            updates.assignee || activeProposal.ownerName,
            `Implementation action marked COMPLETED: "${actionTitle}"`
          )
        );
      }

      updateActiveProposal({
        implementationActions: updatedActions,
        events: newEvents,
      });
    },
    [activeProposal, updateActiveProposal]
  );

  // Delete implementation action
  const deleteImplementationAction = useCallback(
    (actionId: string) => {
      if (!activeProposal || activeProposal.status === 'completed') return;
      updateActiveProposal({
        implementationActions: activeProposal.implementationActions.filter((a) => a.id !== actionId),
      });
    },
    [activeProposal, updateActiveProposal]
  );

  // Verify and close completed proposal
  const verifyAndCloseProposal = useCallback(
    (closure: ProposalClosure): { success: boolean; message?: string } => {
      if (!activeProposal) {
        return { success: false, message: 'No active proposal selected.' };
      }
      if (activeProposal.status !== 'in_implementation') {
        return {
          success: false,
          message: 'Proposal must be in "In Implementation" status prior to closure.',
        };
      }

      const pending = activeProposal.implementationActions.filter(
        (a) => a.status === 'not_started' || a.status === 'in_progress' || a.status === 'blocked'
      );
      if (pending.length > 0) {
        return {
          success: false,
          message: `Cannot close proposal: ${pending.length} implementation action(s) are not yet completed.`,
        };
      }

      if (!closure.verifiedBy.trim()) {
        return { success: false, message: 'Closure requires the name of the verifying person.' };
      }
      if (!closure.verifiedBasis.trim()) {
        return { success: false, message: 'Closure requires the verification basis / evidence source.' };
      }
      if (activeProposal.implementationActions.length === 0 && !closure.closureNotes.trim()) {
        return {
          success: false,
          message:
            'Zero-action implementation plans require deliberate closure notes explaining why no operational actions were necessary.',
        };
      }

      const newEvents = [
        ...activeProposal.events,
        createGovernanceEvent(
          'closure_verified',
          closure.verifiedBy,
          `Implementation closure verified on basis: "${closure.verifiedBasis}"`,
          { closureNotes: closure.closureNotes }
        ),
        createGovernanceEvent(
          'proposal_completed',
          closure.verifiedBy,
          `Curriculum change proposal ${activeProposal.ref} successfully COMPLETED & archived`
        ),
      ];

      updateActiveProposal({
        closure,
        status: 'completed',
        events: newEvents,
      });

      return { success: true };
    },
    [activeProposal, updateActiveProposal]
  );

  // Reopen proposal
  const reopenProposal = useCallback(
    (actor: string, reason: string): { success: boolean; message?: string } => {
      if (!activeProposal) {
        return { success: false, message: 'No active proposal selected.' };
      }

      if (!actor.trim()) {
        return { success: false, message: 'Actor name is required to reopen proposal.' };
      }
      if (!reason.trim()) {
        return { success: false, message: 'Justification / reason is required to reopen proposal.' };
      }

      let targetStatus: ProposalStatus = 'draft';
      if (activeProposal.status === 'completed') {
        targetStatus = 'in_implementation';
      } else if (activeProposal.status === 'rejected' || activeProposal.status === 'withdrawn') {
        targetStatus = 'draft';
      } else {
        return {
          success: false,
          message: `Cannot reopen proposal currently in "${activeProposal.status.toUpperCase()}".`,
        };
      }

      const previousClosure = activeProposal.closure;
      const event = createGovernanceEvent(
        'proposal_reopened',
        actor.trim(),
        `Proposal deliberately reopened from ${activeProposal.status.toUpperCase()} to ${targetStatus.toUpperCase()}: "${reason.trim()}"`,
        { reason: reason.trim(), previousClosure }
      );

      updateActiveProposal({
        status: targetStatus,
        closure: targetStatus === 'in_implementation' ? undefined : activeProposal.closure,
        events: [...activeProposal.events, event],
      });

      return { success: true };
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
    // Batch 2 methods
    appendGovernanceEvent,
    transitionProposalStatus,
    updateImpactDimension,
    updateOverallImpactNotes,
    addGovernanceReview,
    recordGovernanceDecision,
    addImplementationAction,
    updateImplementationAction,
    deleteImplementationAction,
    verifyAndCloseProposal,
    reopenProposal,
    storageWarning,
    dismissStorageWarning,
  };
}
