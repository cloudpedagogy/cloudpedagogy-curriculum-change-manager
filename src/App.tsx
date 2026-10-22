import { AlertTriangle, Download } from 'lucide-react';
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
    storageWarning,
    dismissStorageWarning,
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

      {storageWarning && (
        <div
          role="alert"
          className="max-width-container cp-hide-print"
          style={{ paddingTop: 0, paddingBottom: 'var(--spacing-md)' }}
          data-testid="storage-warning-banner"
        >
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #f87171',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div className="flex items-center gap-sm" style={{ flex: 1, minWidth: '260px' }}>
              <AlertTriangle size={20} color="#b91c1c" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#991b1b', display: 'block', fontSize: '0.9rem' }}>
                  Storage Persistence Warning
                </strong>
                <span style={{ color: '#7f1d1d', fontSize: '0.85rem' }}>{storageWarning}</span>
              </div>
            </div>
            <div className="flex items-center gap-xs">
              <button
                type="button"
                className="cp-button-primary"
                onClick={exportRepository}
                style={{ backgroundColor: '#b91c1c', fontSize: '13px', padding: '6px 12px' }}
                data-testid="btn-rescue-export"
              >
                <Download size={14} /> Export Backup JSON
              </button>
              <button
                type="button"
                className="cp-button-secondary"
                onClick={dismissStorageWarning}
                style={{ fontSize: '13px', padding: '6px 12px' }}
                data-testid="btn-dismiss-storage-warning"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
