import React, { useState } from 'react';
import type { ChangeLogEntry, Version } from '../types';
import { Plus } from 'lucide-react';

interface ChangeLogCardProps {
  changeLog: ChangeLogEntry[];
  versions: Version[];
  onChangeLogUpdate: (entries: ChangeLogEntry[]) => void;
}

export const ChangeLogCard: React.FC<ChangeLogCardProps> = ({ changeLog, versions, onChangeLogUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newEntry: ChangeLogEntry = {
      id: `c_${Date.now()}`,
      versionId: '',
      changeSummary: '',
      rationale: '',
      impact: '',
      date: new Date().toISOString().split('T')[0]
    };
    onChangeLogUpdate([...changeLog, newEntry]);
    setEditingId(newEntry.id);
  };

  const handleUpdate = (id: string, field: keyof ChangeLogEntry, value: string) => {
    onChangeLogUpdate(changeLog.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Delete this change log entry?')) {
      onChangeLogUpdate(changeLog.filter(e => e.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  return (
    <div className="cp-card cp-hide-print">
      <div className="cp-card-header">
        <h2 className="cp-card-title">Change Rationale & Log</h2>
        <button className="cp-button-primary" onClick={handleAdd}>
          <Plus size={16} /> New Entry
        </button>
      </div>

      {changeLog.length === 0 ? (
        <p className="text-muted text-center" style={{ padding: 'var(--spacing-xl)' }}>No change log entries defined. Add an entry to explain standard revisions.</p>
      ) : (
        <div className="flex-col gap-md">
          {changeLog.map(entry => (
            <div key={entry.id} className="list-item-box">
              {editingId === entry.id ? (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Linked Target Version</label>
                      <select value={entry.versionId} onChange={(e) => handleUpdate(entry.id, 'versionId', e.target.value)}>
                        <option value="">-- None --</option>
                        {versions.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" className="p-2 border rounded" style={{width:'100%'}} value={entry.date} onChange={(e) => handleUpdate(entry.id, 'date', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Change Summary</label>
                    <input type="text" value={entry.changeSummary} onChange={(e) => handleUpdate(entry.id, 'changeSummary', e.target.value)} placeholder="e.g. Added AI integrity guidelines" />
                  </div>
                  <div className="form-group">
                    <label>Rationale (Why?)</label>
                    <textarea value={entry.rationale} onChange={(e) => handleUpdate(entry.id, 'rationale', e.target.value)} placeholder="e.g. Required by new departmental policy..." />
                  </div>
                  <div className="form-group">
                    <label>Impact on Curriculum</label>
                    <input type="text" value={entry.impact} onChange={(e) => handleUpdate(entry.id, 'impact', e.target.value)} placeholder="e.g. Reduces ambiguity, adds 5% penalty guidance" />
                  </div>
                  <div className="flex justify-between items-center mt-sm">
                    <button className="cp-button-secondary" onClick={() => setEditingId(null)}>Done Editing</button>
                    <button className="text-danger cp-button-danger" style={{border: 'none', background: 'transparent'}} onClick={() => handleDelete(entry.id)}>Delete Entry</button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <div>
                    <h3 className="mb-xs text-small semibold">{entry.date} : {entry.changeSummary || 'Untitled Change'}</h3>
                    <p className="text-small mb-xs"><span className="semibold text-muted">Rationale:</span> {entry.rationale}</p>
                    <p className="text-small mb-xs"><span className="semibold text-muted">Impact:</span> {entry.impact}</p>
                    {entry.versionId && (
                      <p className="text-small mb-0 text-muted">Linked to Version: {versions.find(v => v.id === entry.versionId)?.title || entry.versionId}</p>
                    )}
                  </div>
                  <div>
                    <button className="cp-button-secondary" onClick={() => setEditingId(entry.id)}>Edit</button>
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
