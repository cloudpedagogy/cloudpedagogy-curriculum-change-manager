import { Header } from './components/Header';
import { ProposalCatalogue } from './components/ProposalCatalogue';
import { ProposalEditor } from './components/ProposalEditor';
import { EmptyWorkspaceView } from './components/EmptyWorkspaceView';
import { useAppState } from './hooks/useAppState';

function App() {
  const {
    repository,
    activeProposal,
    setActiveProposalId,
    createProposal,
    updateActiveProposal,
    deleteProposal,
    loadDemo,
    resetRepository,
    exportRepository,
    importRepository,
    addVersionToActive,
    updateVersionInActive,
    removeVersionFromActive,
    updateChangeLogInActive,
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
  } = useAppState();

  const handleImport = async (file: File) => {
    const result = await importRepository(file, () => {
      return window.confirm(
        'Importing this file will replace the current workspace and its proposals. Do you wish to proceed?'
      );
    });

    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="app-container">
      <Header
        proposalCount={repository.proposals.length}
        onCreateNewProposal={() => createProposal()}
        onLoadDemo={loadDemo}
        onReset={resetRepository}
        onExport={exportRepository}
        onImport={handleImport}
      />

      <main className="max-width-container" style={{ paddingTop: 0 }}>
        {repository.proposals.length === 0 ? (
          <EmptyWorkspaceView
            onCreateBlank={() => createProposal()}
            onLoadDemo={loadDemo}
            onImportFile={handleImport}
          />
        ) : (
          <>
            <ProposalCatalogue
              proposals={repository.proposals}
              activeProposalId={repository.activeProposalId}
              onSelectProposal={setActiveProposalId}
              onCreateProposal={() => createProposal()}
              onDeleteProposal={deleteProposal}
            />

            {activeProposal ? (
              <ProposalEditor
                key={activeProposal.id}
                proposal={activeProposal}
                onUpdateProposal={updateActiveProposal}
                onAddVersion={addVersionToActive}
                onUpdateVersion={updateVersionInActive}
                onRemoveVersion={removeVersionFromActive}
                onUpdateChangeLog={updateChangeLogInActive}
                onTransitionStatus={transitionProposalStatus}
                onUpdateImpactDimension={updateImpactDimension}
                onUpdateOverallImpactNotes={updateOverallImpactNotes}
                onAddReview={addGovernanceReview}
                onRecordDecision={recordGovernanceDecision}
                onAddAction={addImplementationAction}
                onUpdateAction={updateImplementationAction}
                onDeleteAction={deleteImplementationAction}
                onVerifyAndClose={verifyAndCloseProposal}
                onReopen={reopenProposal}
              />
            ) : (
              <div
                className="cp-card text-center"
                style={{ padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}
              >
                <p className="mb-sm">No proposal currently selected for editing.</p>
                <button
                  type="button"
                  className="cp-button-primary"
                  onClick={() => createProposal()}
                >
                  Create New Proposal
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
