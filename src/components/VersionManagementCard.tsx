import React, { useRef } from 'react';
import type { Version } from '../types';
import { FileDown, Plus } from 'lucide-react';

interface VersionManagementCardProps {
  versions: Version[];
  onAddVersion: (v: Version) => void;
  onRemoveVersion: (id: string) => void;
}

export const VersionManagementCard: React.FC<VersionManagementCardProps> = ({ versions, onAddVersion, onRemoveVersion }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          const parsed = JSON.parse(result);
          
          let title = "Imported Version";
          let sourceType: 'assessment' | 'integrity' | 'manual' = 'manual';
          
          // Heuristic detection based on properties expected from prior apps
          if (parsed.tasks && parsed.learningOutcomes) {
            sourceType = 'assessment';
            title = parsed.meta?.moduleName ? `Assessment: ${parsed.meta.moduleName}` : 'Imported Assessment Snapshot';
          } else if (parsed.aiPolicy || parsed.integrityActivities) {
            sourceType = 'integrity';
            title = 'AI Integrity Guidelines Snapshot';
          }

          const newVersion: Version = {
            id: `v_${Date.now()}`,
            title,
            description: `Imported from JSON payload on ${new Date().toLocaleDateString()}`,
            sourceType,
            sourceData: parsed,
            createdAt: new Date().toISOString().split('T')[0]
          };

          onAddVersion(newVersion);
        } catch (err) {
          alert('Failed to parse the imported JSON as a snapshot.');
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset
    }
  };

  const handleCreateManual = () => {
    const newVersion: Version = {
      id: `v_${Date.now()}`,
      title: 'Manual Version Entry',
      description: 'Describe the structural elements here...',
      sourceType: 'manual',
      sourceData: {},
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAddVersion(newVersion);
  };

  return (
    <div className="cp-card cp-hide-print">
      <div className="cp-card-header">
        <h2 className="cp-card-title">Version Management</h2>
        <div className="flex gap-sm">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImportJson} 
          />
          <button className="cp-button-secondary" onClick={() => fileInputRef.current?.click()}>
            <FileDown size={16} /> Import Snapshot JSON
          </button>
          <button className="cp-button-primary" onClick={handleCreateManual}>
            <Plus size={16} /> Add Manual Version
          </button>
        </div>
      </div>
      
      {versions.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>No versions tracked yet. Import a design JSON or add manually.</p>
      ) : (
        <div className="flex-col gap-sm">
          {versions.map(v => (
            <div key={v.id} className="list-item-box flex justify-between items-center">
              <div>
                <div className="flex gap-sm items-center mb-0">
                  <span className="semibold">{v.title}</span>
                  <span className="badge">{v.sourceType}</span>
                </div>
                <p className="text-small text-muted mb-0 mt-xs">{v.description} &middot; Created: {v.createdAt}</p>
              </div>
              <button className="cp-button-danger" onClick={() => { if(window.confirm('Delete this version?')) onRemoveVersion(v.id); }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
