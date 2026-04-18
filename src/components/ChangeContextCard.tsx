import React from 'react';
import type { Meta } from '../types';

interface ChangeContextCardProps {
  meta: Meta;
  onChange: (meta: Meta) => void;
}

export const ChangeContextCard: React.FC<ChangeContextCardProps> = ({ meta, onChange }) => {
  const handleChange = (field: keyof Meta, value: string) => {
    onChange({ ...meta, [field]: value });
  };

  return (
    <div className="cp-card">
      <div className="cp-card-header">
        <h2 className="cp-card-title">Change Context</h2>
      </div>
      
      <div className="form-row cp-hide-print">
        <div className="form-group">
          <label>Programme Name</label>
          <input 
            type="text" 
            value={meta.programmeName}
            onChange={(e) => handleChange('programmeName', e.target.value)}
            placeholder="e.g. Master of Public Health"
          />
        </div>
        <div className="form-group">
          <label>Module Name</label>
          <input 
            type="text" 
            value={meta.moduleName}
            onChange={(e) => handleChange('moduleName', e.target.value)}
            placeholder="e.g. Health Policy Analysis"
          />
        </div>
      </div>
      
      <div className="form-row cp-hide-print">
        <div className="form-group">
          <label>Level</label>
          <input 
            type="text" 
            value={meta.level}
            onChange={(e) => handleChange('level', e.target.value)}
            placeholder="e.g. Postgraduate"
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input 
            type="text" 
            value={meta.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="e.g. Public Health"
          />
        </div>
      </div>

      <div className="print-only" style={{ display: 'none' }}>
        <p><strong>Programme:</strong> {meta.programmeName || 'Not specified'}</p>
        <p><strong>Module:</strong> {meta.moduleName || 'Not specified'} (Level: {meta.level || 'Not specified'})</p>
        <p><strong>Department:</strong> {meta.department || 'Not specified'}</p>
      </div>
    </div>
  );
};
