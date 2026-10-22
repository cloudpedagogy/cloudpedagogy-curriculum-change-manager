import React, { useState } from 'react';
import type { ChangeLogEntry, Version } from '../types';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { generateChangeLogId } from '../utils/idGenerator';

interface ChangeLogCardProps {
  changeLog: ChangeLogEntry[];
  versions: Version[];
  onChangeLogUpdate: (entries: ChangeLogEntry[]) => void;
}

export const ChangeLogCard: React.FC<ChangeLogCardProps> = ({
  changeLog,
  versions,
  onChangeLogUpdate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newEntry: ChangeLogEntry = {
      id: generateChangeLogId(),
      versionId: versions.length > 0 ? versions[versions.length - 1].id : '',
      changeSummary: '',
      rationale: '',
      impact: '',
      date: new Date().toISOString().split('T')[0],
    };
    onChangeLogUpdate([newEntry, ...changeLog]);
    setEditingId(newEntry.id);
  };

  const handleUpdate = (id: string, field: keyof ChangeLogEntry, value: string) => {
    onChangeLogUpdate(
      changeLog.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this change log entry?')) {
      onChangeLogUpdate(changeLog.filter((e) => e.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  return (
    <div className="cp-card cp-hide-print">
      <div className="cp-card-header">
        <div>
          <h2 className="cp-card-title">Change Rationale & Log</h2>
          <p className="text-small text-muted mb-0">
            Document discrete curriculum modifications, educational justifications, and curricular impacts
          </p>
        </div>
        <button type="button" className="cp-button-primary" onClick={handleAdd}>
          <Plus size={16} /> New Entry
        </button>
      </div>

      {changeLog.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>
          No change log entries defined in this proposal. Click &quot;New Entry&quot; to record a specific curriculum change.
        </p>
      ) : (
        <div className="flex-col gap-md">
          {changeLog.map((entry) => (
            <div key={entry.id} className="list-item-box">
              {editingId === entry.id ? (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`log-version-${entry.id}`}>Linked Target Version</label>
                      <select
                        id={`log-version-${entry.id}`}
                        value={entry.versionId}
                        onChange={(e) => handleUpdate(entry.id, 'versionId', e.target.value)}
                      >
                        <option value="">-- Unlinked / General Change --</option>
                        {versions.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title} ({v.createdAt})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor={`log-date-${entry.id}`}>Date of Modification</label>
                      <input
                        id={`log-date-${entry.id}`}
                        type="date"
                        value={entry.date}
                        onChange={(e) => handleUpdate(entry.id, 'date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`log-summary-${entry.id}`}>Change Summary *</label>
                    <input
                      id={`log-summary-${entry.id}`}
                      type="text"
                      value={entry.changeSummary}
                      onChange={(e) => handleUpdate(entry.id, 'changeSummary', e.target.value)}
                      placeholder="e.g. Added AI integrity guidelines & disclosure rubric"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`log-rationale-${entry.id}`}>Educational Rationale (Why?)</label>
                    <textarea
                      id={`log-rationale-${entry.id}`}
                      value={entry.rationale}
                      onChange={(e) => handleUpdate(entry.id, 'rationale', e.target.value)}
                      placeholder="Explain the academic justification, evidence, or policy requirement..."
                      rows={2}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`log-impact-${entry.id}`}>Curricular & Assessment Impact</label>
                    <textarea
                      id={`log-impact-${entry.id}`}
                      value={entry.impact}
                      onChange={(e) => handleUpdate(entry.id, 'impact', e.target.value)}
                      placeholder="Describe the expected effect on student workload, grading, or progression..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-sm">
                    <button
                      type="button"
                      className="cp-button-primary"
                      onClick={() => setEditingId(null)}
                    >
                      <Check size={16} /> Done Editing
                    </button>
                    <button
                      type="button"
                      className="cp-button-danger"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 size={16} /> Delete Entry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-sm mb-xs">
                      <span className="badge">{entry.date}</span>
                      <h3 className="text-small semibold mb-0">
                        {entry.changeSummary || 'Untitled Change Entry'}
                      </h3>
                    </div>
                    {entry.rationale && (
                      <p className="text-small mb-xs">
                        <span className="semibold text-muted">Rationale:</span> {entry.rationale}
                      </p>
                    )}
                    {entry.impact && (
                      <p className="text-small mb-xs">
                        <span className="semibold text-muted">Impact:</span> {entry.impact}
                      </p>
                    )}
                    {entry.versionId && (
                      <p className="text-small mb-0 text-muted">
                        Linked Reference:{' '}
                        {versions.find((v) => v.id === entry.versionId)?.title || entry.versionId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-xs">
                    <button
                      type="button"
                      className="cp-button-secondary"
                      onClick={() => setEditingId(entry.id)}
                      title="Edit entry"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="cp-button-danger"
                      onClick={() => handleDelete(entry.id)}
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
