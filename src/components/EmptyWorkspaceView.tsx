import React, { useRef } from 'react';
import { PlusCircle, Sparkles, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface EmptyWorkspaceViewProps {
  onCreateBlank: () => void;
  onLoadDemo: () => void;
  onImportFile: (file: File) => void;
}

export const EmptyWorkspaceView: React.FC<EmptyWorkspaceViewProps> = ({
  onCreateBlank,
  onLoadDemo,
  onImportFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="cp-card cp-hide-print" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <FileText size={28} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          Welcome to Curriculum Change Manager
        </h2>
        <p className="text-muted" style={{ fontSize: '1rem', marginBottom: 'var(--spacing-xl)' }}>
          A local-first workspace for proposing, tracking, and documenting academic curriculum modifications,
          assessment shifts, and AI integrity guidance with audit-ready traceability.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-md)',
            textAlign: 'left',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          {/* Option 1: Blank Workspace */}
          <div
            className="list-item-box"
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border-default)',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="flex items-center gap-xs mb-sm">
                <PlusCircle size={20} />
                <h3 className="semibold mb-0" style={{ fontSize: '1.05rem' }}>
                  Blank Proposal
                </h3>
              </div>
              <p className="text-small text-muted mb-md">
                Start from scratch with an empty curriculum change proposal and staged authoring.
              </p>
            </div>
            <button
              type="button"
              className="cp-button-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onCreateBlank}
            >
              Create Blank Proposal
            </button>
          </div>

          {/* Option 2: Explore Demo */}
          <div
            className="list-item-box"
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border-default)',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="flex items-center gap-xs mb-sm">
                <Sparkles size={20} />
                <h3 className="semibold mb-0" style={{ fontSize: '1.05rem' }}>
                  Explore Demo
                </h3>
              </div>
              <p className="text-small text-muted mb-md">
                Explore two realistic proposals (Public Health AI policy and Data Science authentic portfolio).
              </p>
            </div>
            <button
              type="button"
              className="cp-button-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onLoadDemo}
            >
              Explore Demo Data
            </button>
          </div>

          {/* Option 3: Import Workspace */}
          <div
            className="list-item-box"
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border-default)',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div className="flex items-center gap-xs mb-sm">
                <Upload size={20} />
                <h3 className="semibold mb-0" style={{ fontSize: '1.05rem' }}>
                  Import Workspace
                </h3>
              </div>
              <p className="text-small text-muted mb-md">
                Restore an exported repository JSON file or migrate a legacy single-module workspace.
              </p>
            </div>
            <input
              id="empty-workspace-import-input"
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onImportFile(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
            <button
              type="button"
              className="cp-button-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Import JSON File
            </button>
          </div>
        </div>

        <div style={{ display: 'inline-flex', gap: 'var(--spacing-lg)', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          <span className="flex items-center gap-xs">
            <CheckCircle2 size={16} /> 100% Local-first (in-browser)
          </span>
          <span className="flex items-center gap-xs">
            <CheckCircle2 size={16} /> Preserves historical records
          </span>
          <span className="flex items-center gap-xs">
            <CheckCircle2 size={16} /> Audit-ready outputs
          </span>
        </div>
      </div>
    </div>
  );
};
