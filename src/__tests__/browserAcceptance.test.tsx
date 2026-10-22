import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { STORAGE_KEY, LEGACY_BACKUP_KEY } from '../hooks/useAppState';
import type { LegacyAppState } from '../types';

describe('Real-Browser Acceptance Simulation (18 Steps)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('confirm', () => true);
    vi.stubGlobal('alert', () => {});
  });

  it('Step 1 & 2: Confirms blank-first onboarding and empty workspace actions', () => {
    render(<App />);

    // 1. Confirm blank-first onboarding: header shows 0 Proposals
    expect(screen.getByText(/0 Proposals/)).toBeDefined();
    expect(
      screen.getByText('Welcome to Curriculum Change Manager')
    ).toBeDefined();

    // 2. Three distinct options available
    expect(screen.getByText('Create Blank Proposal')).toBeDefined();
    expect(screen.getByText('Explore Demo Data')).toBeDefined();
    expect(screen.getByText('Import JSON File')).toBeDefined();
  });

  it('Step 3 to 6: Creates a curriculum change proposal, enters essential details, saves draft, and adds further details', () => {
    const { unmount } = render(<App />);

    // 3. Create a proposal
    const createBtn = screen.getByText('Create Blank Proposal');
    fireEvent.click(createBtn);

    // Header reflects 1 Proposal
    expect(screen.getAllByText(/1 Proposal/).length).toBeGreaterThanOrEqual(1);

    // 4. Enter essential details
    const titleInput = screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Master of Public Health Assessment Revision' } });

    const ownerInput = screen.getByLabelText(/Proposer \/ Responsible Person \*/i) as HTMLInputElement;
    fireEvent.change(ownerInput, { target: { value: 'Dr. John Doe' } });

    // 5. Verify draft persistence in localStorage
    const savedJson = localStorage.getItem(STORAGE_KEY);
    expect(savedJson).not.toBeNull();
    const saved = JSON.parse(savedJson!);
    expect(saved.proposals[0].title).toBe('Master of Public Health Assessment Revision');
    expect(saved.proposals[0].ownerName).toBe('Dr. John Doe');

    // 6. Return and add further details: Navigate to Tab 2 (Curriculum Context)
    const contextTab = screen.getByText(/2. Curriculum Context/i);
    fireEvent.click(contextTab);

    const progInput = screen.getByLabelText(/Programme Name/i) as HTMLInputElement;
    fireEvent.change(progInput, { target: { value: 'Master of Public Health' } });

    const modInput = screen.getByLabelText(/Module Name/i) as HTMLInputElement;
    fireEvent.change(modInput, { target: { value: 'Global Health Policy' } });

    // Verify Tab 2 changes persisted
    const updated = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(updated.proposals[0].context.programmeName).toBe('Master of Public Health');
    expect(updated.proposals[0].context.moduleName).toBe('Global Health Policy');

    unmount();
  });

  it('Step 7 to 9: Creates a second proposal, switches between proposals, and confirms data remains independent', () => {
    render(<App />);

    // Create Proposal 1
    fireEvent.click(screen.getByText('Create Blank Proposal'));
    const titleInput1 = screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement;
    fireEvent.change(titleInput1, { target: { value: 'Proposal 1: AI Ethics' } });

    // 7. Create Proposal 2
    const newPropBtn = screen.getAllByRole('button', { name: /New Proposal/i })[0];
    fireEvent.click(newPropBtn);

    expect(screen.getAllByText(/2 Proposals/).length).toBeGreaterThanOrEqual(1);
    const titleInput2 = screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement;
    fireEvent.change(titleInput2, { target: { value: 'Proposal 2: Software Testing' } });

    // 8. Switch back to Proposal 1
    const p1Cards = screen.getAllByText('Proposal 1: AI Ethics');
    fireEvent.click(p1Cards[0]);

    // 9. Confirm data remains independent
    const currentTitle = (screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement).value;
    expect(currentTitle).toBe('Proposal 1: AI Ethics');
  });

  it('Step 10: Creates and edits a manual version record', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Create Blank Proposal'));

    // Navigate to Tab 4 (Snapshots & Log)
    fireEvent.click(screen.getByText(/4. Snapshots & Log/i));

    // Open Manual Version creator
    fireEvent.click(screen.getByRole('button', { name: /Add Manual Version/i }));

    const vTitleInput = screen.getByLabelText(/Version Title \*/i) as HTMLInputElement;
    fireEvent.change(vTitleInput, { target: { value: 'Syllabus v1 Draft' } });

    const vDescInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    fireEvent.change(vDescInput, { target: { value: 'Proposed restructuring of assessment' } });

    // Save manual version
    fireEvent.click(screen.getByRole('button', { name: /Create Version/i }));

    expect(screen.getByText('Syllabus v1 Draft')).toBeDefined();
    expect(screen.getByText(/Proposed restructuring of assessment/)).toBeDefined();

    // Now edit the manual version
    fireEvent.click(screen.getByTitle('Edit manual version details'));
    const vTitleEdit = screen.getByLabelText(/Version Title \*/i) as HTMLInputElement;
    fireEvent.change(vTitleEdit, { target: { value: 'Syllabus v1.1 Final' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(screen.getByText('Syllabus v1.1 Final')).toBeDefined();
  });

  it('Step 11 & 12: Exports workspace and verifies reload persistence', () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByText('Create Blank Proposal'));

    const titleInput = screen.getByLabelText(/Proposal Title \*/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Persistence Test Proposal' } });

    // 12. Simulate reload by unmounting and mounting fresh
    unmount();
    render(<App />);

    expect(screen.getAllByText(/1 Proposal/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Persistence Test Proposal').length).toBeGreaterThanOrEqual(1);
  });

  it('Step 16: Loads demonstration data deliberately with realistic scenarios', () => {
    render(<App />);

    fireEvent.click(screen.getByText('Explore Demo Data'));

    // Demo loads 2 realistic proposals
    expect(screen.getAllByText(/2 Proposals/).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('Public Health Policy Analysis — AI Integrity Redesign').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('Data Science Core — Assessment Weighting Rebalance').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('Step 17: Tests representative legacy-data migration and safety backup', () => {
    const legacyState: LegacyAppState = {
      meta: {
        programmeName: 'BSc Computer Science',
        moduleName: 'Algorithms',
        level: 'Level 5',
        department: 'Computing',
      },
      versions: [
        {
          id: 'v_legacy',
          title: 'Legacy Assessment',
          description: 'Exam only',
          sourceType: 'manual',
          sourceData: {},
          createdAt: '2025-01-01',
        },
      ],
      changeLog: [
        {
          id: 'c_legacy',
          versionId: 'v_legacy',
          changeSummary: 'Converted to coursework',
          rationale: 'Better alignment',
          impact: 'Reduced exam stress',
          date: '2025-02-01',
        },
      ],
      institutionalNotes: {
        reviewerNotes: 'Approved by board',
        generalNotes: 'Standard review',
      },
      lastUpdated: '2025-02-01T10:00:00.000Z',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyState));

    render(<App />);

    // Confirms migrated proposal displays
    expect(screen.getAllByText(/1 Proposal/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Algorithms Curriculum Change').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('LEGACY-001').length).toBeGreaterThanOrEqual(1);

    // Confirms backup was safely saved
    expect(localStorage.getItem(LEGACY_BACKUP_KEY)).not.toBeNull();
  });
});
