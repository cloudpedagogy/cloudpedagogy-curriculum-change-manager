export interface Meta {
  programmeName: string;
  moduleName: string;
  level: string;
  department: string;
}

export interface Version {
  id: string;
  title: string;
  description: string;
  sourceType: 'assessment' | 'integrity' | 'manual';
  sourceData: any; // Raw JSON from previous tools or manual objects
  createdAt: string;
  createdBy?: string;
  notes?: string;
}

export interface Comparison {
  id: string;
  versionAId: string;
  versionBId: string;
  comparisonNotes?: string;
}

export interface ChangeLogEntry {
  id: string;
  versionId: string;
  changeSummary: string;
  rationale: string;
  impact: string;
  date: string;
}

export interface InstitutionalNotes {
  reviewerNotes: string;
  generalNotes: string;
}

export interface AppState {
  meta: Meta;
  versions: Version[];
  comparisons: Comparison[];
  changeLog: ChangeLogEntry[];
  institutionalNotes: InstitutionalNotes;
  lastUpdated: string;
}
