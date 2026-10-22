import React, { useRef, useState } from 'react';
import type { Version } from '../types';
import { FileDown, Plus, Edit2, X, Check } from 'lucide-react';
import { generateVersionId } from '../utils/idGenerator';

interface VersionManagementCardProps {
  versions: Version[];
  onAddVersion: (v: Version) => void;
  onUpdateVersion?: (v: Version) => void;
  onRemoveVersion: (id: string) => void;
}

export const VersionManagementCard: React.FC<VersionManagementCardProps> = ({
  versions,
  onAddVersion,
  onUpdateVersion,
  onRemoveVersion,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for manual version creation / editing
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCreatedBy, setFormCreatedBy] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formAssessmentMode, setFormAssessmentMode] = useState<string>('');
  const [formAiPolicy, setFormAiPolicy] = useState<string>('');

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          const parsed = JSON.parse(result) as Record<string, unknown>;

          let title = 'Imported Version';
          let sourceType: 'assessment' | 'integrity' | 'manual' = 'manual';

          // Heuristic detection based on properties expected from prior apps
          if (parsed.tasks && parsed.learningOutcomes) {
            sourceType = 'assessment';
            const meta = parsed.meta as Record<string, unknown> | undefined;
            title = meta?.moduleName
              ? `Assessment: ${String(meta.moduleName)}`
              : 'Imported Assessment Snapshot';
          } else if (parsed.aiPolicy || parsed.integrityActivities) {
            sourceType = 'integrity';
            title = 'AI Integrity Guidelines Snapshot';
          }

          const newVersion: Version = {
            id: generateVersionId(),
            title,
            description: `Imported from JSON payload on ${new Date().toLocaleDateString()}`,
            sourceType,
            sourceData: parsed,
            createdAt: new Date().toISOString().split('T')[0],
          };

          onAddVersion(newVersion);
        } catch (err) {
          alert(`Failed to parse the imported JSON as a snapshot: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset file input
    }
  };

  const startCreateManual = () => {
    setIsEditing(true);
    setEditingVersionId(null);
    setFormTitle('Draft Curriculum Design');
    setFormDescription('Manual entry for proposed curriculum structure');
    setFormCreatedBy('');
    setFormNotes('');
    setFormAssessmentMode('');
    setFormAiPolicy('');
  };

  const startEditVersion = (v: Version) => {
    setIsEditing(true);
    setEditingVersionId(v.id);
    setFormTitle(v.title);
    setFormDescription(v.description);
    setFormCreatedBy(v.createdBy || '');
    setFormNotes(v.notes || '');

    const data = v.sourceData || {};
    setFormAssessmentMode(String(data.assessmentMode || data.assessment || ''));
    setFormAiPolicy(String(data.aiUsage || data.aiPolicy || ''));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingVersionId(null);
  };

  const saveManualVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceData: Record<string, unknown> = {
      ...(editingVersionId
        ? versions.find((v) => v.id === editingVersionId)?.sourceData || {}
        : {}),
    };

    if (formAssessmentMode.trim()) {
      sourceData.assessmentMode = formAssessmentMode.trim();
    }
    if (formAiPolicy.trim()) {
      sourceData.aiUsage = formAiPolicy.trim();
    }

    if (editingVersionId && onUpdateVersion) {
      const existing = versions.find((v) => v.id === editingVersionId);
      if (existing) {
        onUpdateVersion({
          ...existing,
          title: formTitle.trim() || 'Untitled Manual Version',
          description: formDescription.trim(),
          createdBy: formCreatedBy.trim() || undefined,
          notes: formNotes.trim() || undefined,
          sourceData,
        });
      }
    } else {
      const newVersion: Version = {
        id: generateVersionId(),
        title: formTitle.trim() || 'Untitled Manual Version',
        description: formDescription.trim() || 'Manual version entry',
        sourceType: 'manual',
        isManual: true,
        sourceData,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: formCreatedBy.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };
      onAddVersion(newVersion);
    }

    cancelEdit();
  };

  return (
    <div className="cp-card cp-hide-print">
      <div className="cp-card-header">
        <div>
          <h2 className="cp-card-title">Version Snapshots & History</h2>
          <p className="text-small text-muted mb-0">
            Maintain chronological design snapshots (imported from design engines or created manually)
          </p>
        </div>
        <div className="flex gap-sm">
          <input
            id="snapshot-json-upload"
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImportJson}
          />
          <button
            type="button"
            className="cp-button-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Import an assessment or integrity JSON snapshot"
          >
            <FileDown size={16} /> Import Snapshot JSON
          </button>
          <button
            type="button"
            className="cp-button-primary"
            onClick={startCreateManual}
            disabled={isEditing}
          >
            <Plus size={16} /> Add Manual Version
          </button>
        </div>
      </div>

      {isEditing && (
        <form
          onSubmit={saveManualVersion}
          className="list-item-box"
          style={{ backgroundColor: '#fcfcfc', border: '1px solid var(--color-border-strong)', marginBottom: 'var(--spacing-md)' }}
        >
          <div className="flex justify-between items-center mb-sm">
            <h3 className="text-small semibold mb-0">
              {editingVersionId ? 'Edit Version Record' : 'Create Manual Version Record'}
            </h3>
            <button
              type="button"
              className="cp-button-secondary"
              onClick={cancelEdit}
              style={{ padding: '2px 8px', fontSize: '12px' }}
            >
              <X size={14} /> Cancel
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manual-version-title">Version Title *</label>
              <input
                id="manual-version-title"
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Revised Syllabus (2026/27)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="manual-version-author">Author / Proposer</label>
              <input
                id="manual-version-author"
                type="text"
                value={formCreatedBy}
                onChange={(e) => setFormCreatedBy(e.target.value)}
                placeholder="e.g. Dr. Eleanor Vance"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="manual-version-desc">Description</label>
            <input
              id="manual-version-desc"
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief summary of what this version represents"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manual-version-assessment">Assessment Mode / Structure</label>
              <input
                id="manual-version-assessment"
                type="text"
                value={formAssessmentMode}
                onChange={(e) => setFormAssessmentMode(e.target.value)}
                placeholder="e.g. 60% Coursework Portfolio / 40% Oral Viva"
              />
            </div>
            <div className="form-group">
              <label htmlFor="manual-version-aipolicy">AI Guidance / Integrity Policy</label>
              <input
                id="manual-version-aipolicy"
                type="text"
                value={formAiPolicy}
                onChange={(e) => setFormAiPolicy(e.target.value)}
                placeholder="e.g. Permitted assistive search with declaration"
              />
            </div>
          </div>

          <div className="form-group mb-sm">
            <label htmlFor="manual-version-notes">Additional Notes</label>
            <textarea
              id="manual-version-notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Contextual notes, references, or rationale"
              rows={2}
            />
          </div>

          <div className="flex gap-sm justify-end">
            <button type="button" className="cp-button-secondary" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="submit" className="cp-button-primary">
              <Check size={16} /> {editingVersionId ? 'Save Changes' : 'Create Version'}
            </button>
          </div>
        </form>
      )}

      {versions.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
          No versions tracked in this proposal yet. Import a design JSON snapshot or create a manual version record.
        </p>
      ) : (
        <div className="flex-col gap-sm">
          {versions.map((v) => (
            <div key={v.id} className="list-item-box flex justify-between items-center">
              <div>
                <div className="flex gap-sm items-center mb-0">
                  <span className="semibold">{v.title}</span>
                  <span className="badge">{v.sourceType}</span>
                  {v.createdBy && (
                    <span className="text-small text-muted">by {v.createdBy}</span>
                  )}
                </div>
                <p className="text-small text-muted mb-0 mt-xs">
                  {v.description} &middot; Created: {v.createdAt}
                </p>
                {v.notes && (
                  <p className="text-small text-muted mb-0 mt-xs" style={{ fontStyle: 'italic' }}>
                    Notes: {v.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-xs">
                {(v.sourceType === 'manual' || v.isManual) && (
                  <button
                    type="button"
                    className="cp-button-secondary"
                    onClick={() => startEditVersion(v)}
                    title="Edit manual version details"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button
                  type="button"
                  className="cp-button-danger"
                  onClick={() => {
                    if (window.confirm(`Delete version "${v.title}"?`)) {
                      onRemoveVersion(v.id);
                    }
                  }}
                  title="Remove this version"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
