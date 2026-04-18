import React, { useRef } from 'react';
import { Upload, Download, RefreshCw, Undo2 } from 'lucide-react';

interface HeaderProps {
  onLoadDemo: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoadDemo, onReset, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="cp-card cp-hide-print" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: 'var(--spacing-lg)' }}>
      <div className="max-width-container flex items-center justify-between" style={{ padding: 0, boxShadow: 'none' }}>
        <div>
          <h1>CloudPedagogy Curriculum Change Manager</h1>
          <p className="text-muted mb-0">Track, compare, and document changes to curriculum, assessment, and AI integrity designs over time.</p>
          <a href="https://www.cloudpedagogy.com/" target="_blank" rel="noreferrer" className="text-small mt-sm" style={{ display: 'inline-block' }}>Visit CloudPedagogy</a>
        </div>
        <div className="flex gap-sm">
          <input
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
          <button className="cp-button-secondary" onClick={() => fileInputRef.current?.click()} title="Import App State">
            <Upload size={16} /> Import
          </button>
          <button className="cp-button-secondary" onClick={onExport} title="Export App State">
            <Download size={16} /> Export
          </button>
          <button className="cp-button-secondary" onClick={onLoadDemo}>
            <RefreshCw size={16} /> Load Demo
          </button>
          <button className="cp-button-danger" onClick={() => { if(window.confirm('Reset all structural change records?')) onReset(); }}>
            <Undo2 size={16} /> Reset
          </button>
        </div>
      </div>
    </header>
  );
};
