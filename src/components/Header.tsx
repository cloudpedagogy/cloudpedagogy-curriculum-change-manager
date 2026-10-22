import React, { useRef } from 'react';
import { Upload, Download, RefreshCw, Undo2, Plus, Layers } from 'lucide-react';

interface HeaderProps {
  proposalCount: number;
  onCreateNewProposal: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  proposalCount,
  onCreateNewProposal,
  onLoadDemo,
  onReset,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header
      className="cp-card cp-hide-print"
      style={{
        borderRadius: 0,
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        marginBottom: 'var(--spacing-lg)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="max-width-container flex items-center justify-between flex-wrap gap-md"
        style={{ padding: 'var(--spacing-sm) var(--spacing-md)', boxShadow: 'none' }}
      >
        <div>
          <div className="flex items-center gap-sm">
            <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>
              CloudPedagogy Curriculum Change Manager
            </h1>
            <span
              className="badge"
              style={{
                backgroundColor: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Layers size={12} />
              {proposalCount} {proposalCount === 1 ? 'Proposal' : 'Proposals'}
            </span>
          </div>
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
            Curriculum change governance, pedagogical rationale capture, and audit-ready tracking.
          </p>
        </div>

        <div className="flex gap-xs items-center flex-wrap">
          <input
            id="header-workspace-import"
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onImport(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          <button
            type="button"
            className="cp-button-primary"
            onClick={onCreateNewProposal}
            title="Create a new curriculum change proposal"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <Plus size={15} /> New Proposal
          </button>

          <button
            type="button"
            className="cp-button-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Import an exported workspace JSON file"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <Upload size={15} /> Import
          </button>

          <button
            type="button"
            className="cp-button-secondary"
            onClick={onExport}
            title="Export full workspace as JSON"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <Download size={15} /> Export
          </button>

          <button
            type="button"
            className="cp-button-secondary"
            onClick={() => {
              if (
                proposalCount === 0 ||
                window.confirm('Load demonstration workspace with 2 realistic curriculum proposals?')
              ) {
                onLoadDemo();
              }
            }}
            title="Explore synthetic demonstration proposals"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <RefreshCw size={15} /> Load Demo
          </button>

          <button
            type="button"
            className="cp-button-danger"
            onClick={() => {
              if (
                window.confirm(
                  'Reset all proposals and clear workspace to a completely blank slate? Unsaved data will be deleted.'
                )
              ) {
                onReset();
              }
            }}
            title="Reset to blank workspace"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <Undo2 size={15} /> Reset
          </button>
        </div>
      </div>
    </header>
  );
};
