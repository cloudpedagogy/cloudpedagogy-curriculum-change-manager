import { describe, it, expect } from 'vitest';
import {
  diffCurriculumSnapshots,
  areValuesEqual,
  formatPathLabel,
  formatDisplayValue,
  normaliseSnapshotData,
} from '../comparison';

describe('Version Snapshot Comparison Engine', () => {
  it('correctly compares flat objects with added, removed, and modified fields', () => {
    const vA = {
      title: 'Introduction to AI',
      credits: 15,
      deliveryMode: 'In-person',
      syllabus: 'Traditional algorithms',
    };

    const vB = {
      title: 'Introduction to AI (Revised)', // modified
      credits: 15, // unchanged
      // deliveryMode removed
      syllabus: 'Deep learning & ethical considerations', // modified
      aiPolicy: 'Permitted with declaration', // added
    };

    const result = diffCurriculumSnapshots(vA, vB);

    expect(result.hasChanges).toBe(true);
    expect(result.summary.addedCount).toBe(1);
    expect(result.summary.removedCount).toBe(1);
    expect(result.summary.modifiedCount).toBe(2);
    expect(result.summary.totalChanges).toBe(4);

    const added = result.changes.find((c) => c.type === 'added');
    expect(added?.path).toBe('aiPolicy');
    expect(added?.label).toBe('AI Policy');
    expect(added?.isMissingInBaseline).toBe(true);
    expect(added?.newDisplay).toBe('Permitted with declaration');

    const removed = result.changes.find((c) => c.type === 'removed');
    expect(removed?.path).toBe('deliveryMode');
    expect(removed?.label).toBe('Delivery Mode');
    expect(removed?.isMissingInTarget).toBe(true);

    const titleDiff = result.changes.find((c) => c.path === 'title');
    expect(titleDiff?.type).toBe('modified');
    expect(titleDiff?.oldDisplay).toBe('Introduction to AI');
    expect(titleDiff?.newDisplay).toBe('Introduction to AI (Revised)');
  });

  it('handles nested curriculum structures with clear breadcrumb labels', () => {
    const baseline = {
      assessment: {
        weighting: {
          examWeight: 70,
          courseworkWeight: 30,
        },
      },
      learningOutcomes: [
        { code: 'LO1', description: 'Understand basic search' },
        { code: 'LO2', description: 'Implement minimax' },
      ],
    };

    const target = {
      assessment: {
        weighting: {
          examWeight: 40, // modified
          courseworkWeight: 60, // modified
        },
      },
      learningOutcomes: [
        { code: 'LO1', description: 'Understand basic search' },
        { code: 'LO2', description: 'Implement modern heuristic minimax with alpha-beta' }, // modified
        { code: 'LO3', description: 'Critically assess bias in ML' }, // added
      ],
    };

    const result = diffCurriculumSnapshots(baseline, target);
    expect(result.hasChanges).toBe(true);
    expect(result.summary.totalChanges).toBe(4);

    // Breadcrumb labels
    const examDiff = result.changes.find((c) => c.path === 'assessment.weighting.examWeight');
    expect(examDiff).toBeDefined();
    expect(examDiff?.label).toBe('Assessment Mode → Assessment Weighting → Exam Weighting');

    const lo2Diff = result.changes.find((c) => c.path === 'learningOutcomes[1].description');
    expect(lo2Diff).toBeDefined();
    expect(lo2Diff?.label).toBe('Learning Outcomes → Item 2 → Description');

    const lo3Diff = result.changes.find((c) => c.path === 'learningOutcomes[2]');
    expect(lo3Diff).toBeDefined();
    expect(lo3Diff?.type).toBe('added');
  });

  it('distinguishes missing fields from empty values (empty string, empty array, empty object, null)', () => {
    const baseline = {
      rationale: '', // empty string
      readingList: [], // empty array
      notes: null, // explicit null
    };

    const target = {
      // rationale is missing (undefined)
      readingList: ['Russell & Norvig'], // non-empty array
      notes: '', // changed from null to empty string
      syllabus: '', // added as empty string
    };

    const result = diffCurriculumSnapshots(baseline, target);

    // rationale was empty string, now missing => removed
    const rationaleDiff = result.changes.find((c) => c.path === 'rationale');
    expect(rationaleDiff?.type).toBe('removed');
    expect(rationaleDiff?.oldDisplay).toContain('Empty Text');
    expect(rationaleDiff?.isMissingInTarget).toBe(true);

    // syllabus was not present in baseline, now added as empty string => added
    const syllabusDiff = result.changes.find((c) => c.path === 'syllabus');
    expect(syllabusDiff?.type).toBe('added');
    expect(syllabusDiff?.isMissingInBaseline).toBe(true);
    expect(syllabusDiff?.newDisplay).toContain('Empty Text');

    // notes changed from null to empty string => modified
    const notesDiff = result.changes.find((c) => c.path === 'notes');
    expect(notesDiff?.type).toBe('modified');
    expect(notesDiff?.oldDisplay).toBe('null');
    expect(notesDiff?.newDisplay).toContain('Empty Text');
  });

  it('treats object key ordering differences as harmless identical structures', () => {
    const snapA = {
      z: 100,
      a: 'First',
      nested: { beta: true, alpha: false },
    };

    const snapB = {
      a: 'First',
      z: 100,
      nested: { alpha: false, beta: true },
    };

    expect(areValuesEqual(snapA, snapB)).toBe(true);

    const result = diffCurriculumSnapshots(snapA, snapB);
    expect(result.hasChanges).toBe(false);
    expect(result.summary.totalChanges).toBe(0);
    expect(result.changes).toHaveLength(0);
  });

  it('preserves snapshot immutability without mutating inputs', () => {
    const snapA = {
      title: 'Immutable Baseline',
      modules: [{ code: 'CS101', hours: 40 }],
    };

    const snapB = {
      title: 'Modified Target',
      modules: [{ code: 'CS101', hours: 50 }],
    };

    const snapACopy = JSON.parse(JSON.stringify(snapA));
    const snapBCopy = JSON.parse(JSON.stringify(snapB));

    diffCurriculumSnapshots(snapA, snapB);

    expect(snapA).toEqual(snapACopy);
    expect(snapB).toEqual(snapBCopy);
  });

  it('handles JSON strings, plain text, and malformed content safely', () => {
    // Valid JSON string
    const strBaseline = JSON.stringify({ assessment: 'Exam 100%' });
    const strTarget = JSON.stringify({ assessment: 'Coursework 100%' });

    const result = diffCurriculumSnapshots(strBaseline, strTarget);
    expect(result.hasChanges).toBe(true);
    expect(result.changes[0].path).toBe('assessment');

    // Malformed JSON string falls back to text content safely
    const malformedA = '{ broken json: true';
    const malformedB = '{ broken json: false';

    const textResult = diffCurriculumSnapshots(malformedA, malformedB);
    expect(textResult.hasChanges).toBe(true);
    expect(textResult.changes[0].path).toBe('textContent');

    // Null or undefined inputs
    const emptyResult = diffCurriculumSnapshots(null, undefined);
    expect(emptyResult.hasChanges).toBe(false);
  });

  it('formats human-friendly curriculum breadcrumb labels', () => {
    expect(formatPathLabel('learningOutcomes[0].rubrics')).toBe(
      'Learning Outcomes → Item 1 → Marking Rubrics'
    );
    expect(formatPathLabel('assessment.weighting.courseworkWeight')).toBe(
      'Assessment Mode → Assessment Weighting → Coursework Weighting'
    );
    expect(formatPathLabel('aiPolicy')).toBe('AI Policy');
    expect(formatPathLabel('custom_unmapped_field')).toBe('Custom Unmapped Field');
  });

  it('formats display values accurately', () => {
    expect(formatDisplayValue(undefined, true)).toBe('(Not Defined)');
    expect(formatDisplayValue(null, false)).toBe('null');
    expect(formatDisplayValue('', false)).toBe('"" (Empty Text)');
    expect(formatDisplayValue([], false)).toBe('[] (Empty List)');
    expect(formatDisplayValue({}, false)).toBe('{} (Empty Object)');
    expect(formatDisplayValue(['Exam', 'Essay'], false)).toBe('Exam, Essay');
    expect(formatDisplayValue(true, false)).toBe('True');
  });

  it('normalises snapshot data from JSON strings and objects safely', () => {
    const rawJson = '{"z": 1, "a": 2}';
    const normalised = normaliseSnapshotData(rawJson) as Record<string, unknown>;
    expect(normalised).toEqual({ z: 1, a: 2 });

    expect(normaliseSnapshotData('plain text note')).toEqual({ textContent: 'plain text note' });
    expect(normaliseSnapshotData(null)).toEqual({});
    expect(normaliseSnapshotData(123)).toEqual({ value: 123 });
  });
});


