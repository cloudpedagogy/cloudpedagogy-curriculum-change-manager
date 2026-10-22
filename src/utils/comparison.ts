/**
 * Generic Curriculum Version Snapshot Comparison Engine
 *
 * Compares two arbitrary version snapshots without mutating inputs.
 * Detects additions, removals, and modifications across nested objects, arrays, and primitive values.
 * Distinguishes missing fields from empty values (e.g. undefined vs "" or []).
 * Normalises harmless object key ordering so structural equality is preserved.
 * Generates human-friendly curriculum breadcrumb labels.
 */

export type DiffType = 'added' | 'removed' | 'modified';

export interface FieldDiff {
  path: string;
  label: string;
  type: DiffType;
  oldValue?: unknown;
  newValue?: unknown;
  oldDisplay: string;
  newDisplay: string;
  isMissingInBaseline: boolean;
  isMissingInTarget: boolean;
}

export interface ComparisonSummary {
  totalChanges: number;
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
}

export interface SnapshotComparisonResult {
  summary: ComparisonSummary;
  changes: FieldDiff[];
  hasChanges: boolean;
  baselineSnapshotId?: string;
  targetSnapshotId?: string;
}

/**
 * Common curriculum keys mapped to educator-friendly labels
 */
const CURRICULUM_KEY_LABELS: Record<string, string> = {
  title: 'Title',
  name: 'Name',
  code: 'Module Code',
  description: 'Description',
  credits: 'Credits / Units',
  level: 'FHEQ / Academic Level',
  learningOutcomes: 'Learning Outcomes',
  intendedLearningOutcomes: 'Intended Learning Outcomes',
  assessment: 'Assessment Mode',
  assessmentMethods: 'Assessment Methods',
  assessments: 'Assessments',
  weighting: 'Assessment Weighting',
  examWeight: 'Exam Weighting',
  courseworkWeight: 'Coursework Weighting',
  oralViva: 'Oral Viva',
  codebasePortfolio: 'Code Portfolio',
  collaborativePipeline: 'Collaborative Pipeline',
  rationale: 'Educational Rationale',
  syllabus: 'Syllabus / Topics',
  topics: 'Topics / Content',
  prerequisites: 'Prerequisites',
  corequisites: 'Co-requisites',
  aiPolicy: 'AI Policy',
  aiUsage: 'AI Usage & Academic Integrity',
  contactHours: 'Contact Hours',
  lectureHours: 'Lecture Hours',
  labHours: 'Laboratory / Studio Hours',
  seminarHours: 'Seminar Hours',
  independentStudyHours: 'Independent Study Hours',
  deliveryMode: 'Delivery Mode',
  teachingMethods: 'Teaching Delivery Methods',
  readingList: 'Reading List / Resources',
  rubrics: 'Marking Rubrics',
  feedbackMethod: 'Feedback Mechanism',
  semester: 'Teaching Semester / Term',
  year: 'Academic Year',
  moduleLeader: 'Module Leader',
  programmeDirector: 'Programme Director',
};

/**
 * Formats a JSON property key or path into an educator-friendly breadcrumb label
 */
export function formatPathLabel(path: string): string {
  if (!path) return 'Root';

  // Split by dots and array brackets: e.g. "assessments[0].weighting" -> ["assessments", "0", "weighting"]
  const parts = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  return parts
    .map((part) => {
      // Check if numeric index
      if (/^\d+$/.test(part)) {
        return `Item ${parseInt(part, 10) + 1}`;
      }

      // Check dictionary
      if (CURRICULUM_KEY_LABELS[part]) {
        return CURRICULUM_KEY_LABELS[part];
      }

      // Fallback: convert camelCase or snake_case to Title Case
      return part
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
    })
    .join(' \u2192 ');
}

/**
 * Format any value into a human-readable display string
 */
export function formatDisplayValue(val: unknown, isMissing: boolean): string {
  if (isMissing) {
    return '(Not Defined)';
  }
  if (val === null) {
    return 'null';
  }
  if (val === undefined) {
    return '(undefined)';
  }
  if (val === '') {
    return '"" (Empty Text)';
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '[] (Empty List)';
    if (val.every((item) => typeof item !== 'object' || item === null)) {
      return val.map(String).join(', ');
    }
    return `[${val.length} item(s)]`;
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val as Record<string, unknown>);
    if (keys.length === 0) return '{} (Empty Object)';
    return `{${keys.length} field(s)}`;
  }
  if (typeof val === 'boolean') {
    return val ? 'True' : 'False';
  }
  return String(val);
}

/**
 * Checks deep equality ignoring object key ordering
 */
export function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== 'object') {
    return a === b;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!areValuesEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if (!areValuesEqual(objA[key], objB[key])) return false;
  }

  return true;
}

/**
 * Recursively inspects differences between baseline and target objects
 */
function diffRecursive(
  baseline: unknown,
  target: unknown,
  currentPath: string,
  isBaselineMissing: boolean,
  isTargetMissing: boolean,
  changes: FieldDiff[]
): void {
  // 1. One side is completely missing
  if (isBaselineMissing && !isTargetMissing) {
    changes.push({
      path: currentPath,
      label: formatPathLabel(currentPath),
      type: 'added',
      oldValue: undefined,
      newValue: target,
      oldDisplay: formatDisplayValue(undefined, true),
      newDisplay: formatDisplayValue(target, false),
      isMissingInBaseline: true,
      isMissingInTarget: false,
    });
    return;
  }

  if (!isBaselineMissing && isTargetMissing) {
    changes.push({
      path: currentPath,
      label: formatPathLabel(currentPath),
      type: 'removed',
      oldValue: baseline,
      newValue: undefined,
      oldDisplay: formatDisplayValue(baseline, false),
      newDisplay: formatDisplayValue(undefined, true),
      isMissingInBaseline: false,
      isMissingInTarget: true,
    });
    return;
  }

  // 2. Both are defined. Check deep equality
  if (areValuesEqual(baseline, target)) {
    return; // Unchanged, no diff record needed
  }

  // 3. Different primitive types or nulls
  const isBaselineObj = baseline !== null && typeof baseline === 'object';
  const isTargetObj = target !== null && typeof target === 'object';

  if (!isBaselineObj || !isTargetObj) {
    changes.push({
      path: currentPath,
      label: formatPathLabel(currentPath),
      type: 'modified',
      oldValue: baseline,
      newValue: target,
      oldDisplay: formatDisplayValue(baseline, false),
      newDisplay: formatDisplayValue(target, false),
      isMissingInBaseline: false,
      isMissingInTarget: false,
    });
    return;
  }

  // 4. One is Array and one is Object
  const isBaselineArr = Array.isArray(baseline);
  const isTargetArr = Array.isArray(target);

  if (isBaselineArr !== isTargetArr) {
    changes.push({
      path: currentPath,
      label: formatPathLabel(currentPath),
      type: 'modified',
      oldValue: baseline,
      newValue: target,
      oldDisplay: formatDisplayValue(baseline, false),
      newDisplay: formatDisplayValue(target, false),
      isMissingInBaseline: false,
      isMissingInTarget: false,
    });
    return;
  }

  // 5. Both are Arrays
  if (isBaselineArr && isTargetArr) {
    const arrA = baseline as unknown[];
    const arrB = target as unknown[];

    // If both are simple arrays of primitives (e.g. strings or numbers)
    const isSimpleA = arrA.every((x) => typeof x !== 'object' || x === null);
    const isSimpleB = arrB.every((x) => typeof x !== 'object' || x === null);

    if (isSimpleA && isSimpleB) {
      changes.push({
        path: currentPath,
        label: formatPathLabel(currentPath),
        type: 'modified',
        oldValue: baseline,
        newValue: target,
        oldDisplay: formatDisplayValue(baseline, false),
        newDisplay: formatDisplayValue(target, false),
        isMissingInBaseline: false,
        isMissingInTarget: false,
      });
      return;
    }

    // Array of objects / complex structures: compare element by element
    const maxLen = Math.max(arrA.length, arrB.length);
    for (let i = 0; i < maxLen; i++) {
      const elemPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      const hasA = i < arrA.length;
      const hasB = i < arrB.length;

      diffRecursive(
        hasA ? arrA[i] : undefined,
        hasB ? arrB[i] : undefined,
        elemPath,
        !hasA,
        !hasB,
        changes
      );
    }
    return;
  }

  // 6. Both are Objects: compare union of keys
  const objA = baseline as Record<string, unknown>;
  const objB = target as Record<string, unknown>;

  const allKeys = Array.from(new Set([...Object.keys(objA), ...Object.keys(objB)]));

  for (const key of allKeys) {
    const keyPath = currentPath ? `${currentPath}.${key}` : key;
    const hasA = Object.prototype.hasOwnProperty.call(objA, key);
    const hasB = Object.prototype.hasOwnProperty.call(objB, key);

    diffRecursive(
      hasA ? objA[key] : undefined,
      hasB ? objB[key] : undefined,
      keyPath,
      !hasA,
      !hasB,
      changes
    );
  }
}

/**
 * Normalises arbitrary snapshot payload into a plain JS object / value
 */
export function normaliseSnapshotData(input: unknown): unknown {
  if (input === null || input === undefined) {
    return {};
  }

  // If already an object (including arrays)
  if (typeof input === 'object') {
    return JSON.parse(JSON.stringify(input));
  }

  // If string, attempt JSON parse
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return { textContent: trimmed };
      }
    }
    return { textContent: trimmed };
  }

  return { value: input };
}

/**
 * Generic entry point: compares any two curriculum version snapshots.
 * Guarantees input immutability.
 */
export function diffCurriculumSnapshots(
  baseline: unknown,
  target: unknown,
  metadata?: { baselineId?: string; targetId?: string }
): SnapshotComparisonResult {
  const normBaseline = normaliseSnapshotData(baseline);
  const normTarget = normaliseSnapshotData(target);

  const changes: FieldDiff[] = [];

  diffRecursive(normBaseline, normTarget, '', false, false, changes);

  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;

  changes.forEach((c) => {
    if (c.type === 'added') addedCount++;
    else if (c.type === 'removed') removedCount++;
    else if (c.type === 'modified') modifiedCount++;
  });

  return {
    summary: {
      totalChanges: changes.length,
      addedCount,
      removedCount,
      modifiedCount,
      unchangedCount: 0,
    },
    changes,
    hasChanges: changes.length > 0,
    baselineSnapshotId: metadata?.baselineId,
    targetSnapshotId: metadata?.targetId,
  };
}
