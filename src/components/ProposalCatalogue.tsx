import React, { useState, useMemo } from 'react';
import type { ChangeCategory, ChangeProposal } from '../types';
import { Plus, Search, Filter, Trash2, Calendar, BookOpen, Layers } from 'lucide-react';

interface ProposalCatalogueProps {
  proposals: ChangeProposal[];
  activeProposalId: string | null;
  onSelectProposal: (id: string) => void;
  onCreateProposal: () => void;
  onDeleteProposal: (id: string) => void;
}

export const ProposalCatalogue: React.FC<ProposalCatalogueProps> = ({
  proposals,
  activeProposalId,
  onSelectProposal,
  onCreateProposal,
  onDeleteProposal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.context.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.context.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [proposals, searchTerm, selectedCategory]);

  const formatCategory = (cat: ChangeCategory | string) => {
    return cat.replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase());
  };

  return (
    <div className="cp-card cp-hide-print" style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div className="cp-card-header">
        <div className="flex items-center gap-sm">
          <Layers size={20} />
          <h2 className="cp-card-title mb-0">Change Proposals Repository</h2>
          <span className="badge" style={{ fontSize: '12px' }}>
            {proposals.length} {proposals.length === 1 ? 'Proposal' : 'Proposals'}
          </span>
        </div>
        <button
          type="button"
          className="cp-button-primary"
          onClick={onCreateProposal}
        >
          <Plus size={16} /> New Proposal
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="form-row mb-md items-center">
        <div className="form-group mb-0" style={{ flex: 2, position: 'relative' }}>
          <label htmlFor="proposal-search-input" className="text-small text-muted">Search Proposals</label>
          <div style={{ position: 'relative' }}>
            <input
              id="proposal-search-input"
              type="text"
              placeholder="Search by title, reference (CCP-...), module, programme, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
            <Search
              size={16}
              className="text-muted"
              style={{ position: 'absolute', left: '10px', top: '10px' }}
            />
          </div>
        </div>

        <div className="form-group mb-0" style={{ flex: 1 }}>
          <label htmlFor="proposal-category-filter" className="text-small text-muted">
            <Filter size={12} style={{ display: 'inline', marginRight: '4px' }} /> Filter Category
          </label>
          <select
            id="proposal-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({proposals.length})</option>
            <option value="minor_amendment">Minor Amendment</option>
            <option value="major_modification">Major Modification</option>
            <option value="assessment_redesign">Assessment Redesign</option>
            <option value="ai_guidance_update">AI Guidance Update</option>
            <option value="learning_outcomes_revision">Learning Outcomes Revision</option>
            <option value="structural_change">Structural Change</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Proposal List */}
      {filteredProposals.length === 0 ? (
        <div className="list-item-box text-center" style={{ padding: 'var(--spacing-lg)' }}>
          <p className="text-muted mb-0">
            {proposals.length === 0
              ? 'No proposals created yet. Click "New Proposal" to begin.'
              : 'No proposals match your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="flex-col gap-xs">
          {filteredProposals.map((p) => {
            const isActive = p.id === activeProposalId;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProposal(p.id)}
                className="list-item-box flex justify-between items-center"
                style={{
                  cursor: 'pointer',
                  borderColor: isActive ? 'var(--color-border-strong)' : 'var(--color-border-default)',
                  backgroundColor: isActive ? '#f8fafd' : '#fff',
                  borderWidth: isActive ? '2px' : '1px',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <div style={{ flex: 1, paddingRight: 'var(--spacing-md)' }}>
                  <div className="flex items-center gap-sm mb-xs">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: isActive ? '#000' : 'var(--color-badge-bg)',
                        color: isActive ? '#fff' : 'inherit',
                      }}
                    >
                      {p.ref}
                    </span>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9' }}>
                      {formatCategory(p.category)}
                    </span>
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                      {p.status.toUpperCase()}
                    </span>
                    {isActive && (
                      <span className="text-small semibold" style={{ color: '#0284c7' }}>
                        &bull; Active Proposal
                      </span>
                    )}
                  </div>

                  <h3
                    className="semibold mb-xs"
                    style={{ fontSize: '1rem', color: isActive ? '#000' : 'inherit' }}
                  >
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-md text-small text-muted flex-wrap">
                    {(p.context.programmeName || p.context.moduleName) && (
                      <span className="flex items-center gap-xs">
                        <BookOpen size={14} />
                        {p.context.moduleName || p.context.programmeName}
                        {p.context.programmeName && p.context.moduleName ? ` (${p.context.programmeName})` : ''}
                      </span>
                    )}
                    {p.ownerName && <span>Owner: {p.ownerName}</span>}
                    {p.targetDate && (
                      <span className="flex items-center gap-xs">
                        <Calendar size={14} /> Target: {p.targetDate}
                      </span>
                    )}
                    <span>
                      {p.versions.length} {p.versions.length === 1 ? 'version' : 'versions'} &middot;{' '}
                      {p.changeLog.length} {p.changeLog.length === 1 ? 'change' : 'changes'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-sm">
                  <button
                    type="button"
                    className={isActive ? 'cp-button-primary' : 'cp-button-secondary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProposal(p.id);
                    }}
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    {isActive ? 'Editing' : 'Open'}
                  </button>
                  <button
                    type="button"
                    className="cp-button-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Delete proposal "${p.title}" (${p.ref})? All associated versions and change logs will be permanently removed.`
                        )
                      ) {
                        onDeleteProposal(p.id);
                      }
                    }}
                    title="Delete proposal"
                    style={{ padding: '6px 8px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
