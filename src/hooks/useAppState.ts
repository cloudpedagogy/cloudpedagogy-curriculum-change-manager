import { useState, useEffect } from 'react';
import type { AppState } from '../types';

const defaultState: AppState = {
  meta: {
    programmeName: '',
    moduleName: '',
    level: '',
    department: ''
  },
  versions: [],
  comparisons: [],
  changeLog: [],
  institutionalNotes: {
    reviewerNotes: '',
    generalNotes: '',
    aiInvolvement: '',
    risksConcerns: '',
    assumptions: ''
  },
  lastUpdated: new Date().toISOString()
};

const demoState: AppState = {
  "meta": {
    "programmeName": "Master of Public Health",
    "moduleName": "Health Policy Analysis",
    "level": "Postgraduate",
    "department": "Public Health"
  },
  "versions": [
    {
      "id": "v1",
      "title": "Original Assessment Design",
      "description": "Initial version of assessment and AI guidance",
      "sourceType": "assessment",
      "sourceData": {
        "assessment": "Policy Analysis Essay",
        "aiUsage": "limited guidance"
      },
      "createdAt": "2025-09-01"
    },
    {
      "id": "v2",
      "title": "Revised Assessment with AI Integrity Guidance",
      "description": "Updated version with explicit AI use policy",
      "sourceType": "integrity",
      "sourceData": {
        "assessment": "Policy Analysis Essay",
        "aiUsage": "conditional use with defined acceptable and unacceptable practices"
      },
      "createdAt": "2026-02-01"
    }
  ],
  "comparisons": [],
  "changeLog": [
    {
      "id": "c1",
      "versionId": "v2",
      "changeSummary": "Introduced explicit AI integrity guidance",
      "rationale": "Increased use of generative AI required clearer expectations",
      "impact": "Improved transparency and reduced ambiguity for students",
      "date": "2026-02-01"
    }
  ],
  "institutionalNotes": {
    "reviewerNotes": "Example revision for QA demonstration",
    "generalNotes": "Demo data should remain editable",
    "aiInvolvement": "AI was used to summarize student feedback on the original assessment design to identify pain points.",
    "risksConcerns": "Risk of AI-generated content being indistinguishable from student work if guidance is too permissive.",
    "assumptions": "Assumes students have basic AI literacy and understand the difference between assistive and generative use."
  },
  "lastUpdated": new Date().toISOString()
};

const STORAGE_KEY = 'cp_curriculum_change_manager_state';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString()
    }));
  };

  const loadDemo = () => {
    setState({ ...demoState, lastUpdated: new Date().toISOString() });
  };

  const resetState = () => {
    setState({ ...defaultState, lastUpdated: new Date().toISOString() });
  };

  const exportState = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "curriculum-change-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importState = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const imported = JSON.parse(result);
        if (imported.meta && imported.versions) {
          setState(imported);
        } else {
          alert('Invalid file format. Missing core AppState fields.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return {
    state,
    updateState,
    loadDemo,
    resetState,
    exportState,
    importState
  };
}
