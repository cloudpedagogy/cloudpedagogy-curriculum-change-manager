import { Header } from './components/Header';
import { ChangeContextCard } from './components/ChangeContextCard';
import { VersionManagementCard } from './components/VersionManagementCard';
import { VersionComparisonCard } from './components/VersionComparisonCard';
import { ChangeLogCard } from './components/ChangeLogCard';
import { OutputSummaryCard } from './components/OutputSummaryCard';
import { useAppState } from './hooks/useAppState';

function App() {
  const appState = useAppState();
  const { state, updateState, loadDemo, resetState, exportState, importState } = appState;

  return (
    <div className="app-container">
      <Header 
        onLoadDemo={loadDemo}
        onReset={resetState}
        onExport={exportState}
        onImport={importState}
      />
      
      <main className="max-width-container" style={{ paddingTop: 0 }}>
        <ChangeContextCard 
          meta={state.meta}
          onChange={(meta) => updateState({ meta })}
        />

        <VersionManagementCard 
          versions={state.versions}
          onAddVersion={(v) => updateState({ versions: [...state.versions, v] })}
          onRemoveVersion={(id) => updateState({ versions: state.versions.filter(ver => ver.id !== id) })}
        />

        <VersionComparisonCard 
          versions={state.versions}
        />

        <ChangeLogCard 
          changeLog={state.changeLog}
          versions={state.versions}
          onChangeLogUpdate={(entries) => updateState({ changeLog: entries })}
        />

        <div className="cp-card cp-hide-print">
          <div className="cp-card-header">
            <h2 className="cp-card-title">Institutional Approval & Notes</h2>
          </div>
          <div className="form-group mb-sm">
            <label>QA Reviewer Notes</label>
            <textarea 
              value={state.institutionalNotes.reviewerNotes}
              onChange={(e) => updateState({ institutionalNotes: { ...state.institutionalNotes, reviewerNotes: e.target.value } })}
              placeholder="Record approval committee notes..."
            />
          </div>
          <div className="form-group mb-0">
            <label>General Context Notes</label>
            <textarea 
              value={state.institutionalNotes.generalNotes}
              onChange={(e) => updateState({ institutionalNotes: { ...state.institutionalNotes, generalNotes: e.target.value } })}
              placeholder="Record general considerations..."
            />
          </div>
        </div>

        <OutputSummaryCard state={state} />

      </main>
    </div>
  );
}

export default App;
