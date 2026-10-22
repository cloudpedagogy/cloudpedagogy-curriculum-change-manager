import type { ChangeProposal, RepositoryState } from '../types';

export const DEMO_PROPOSALS: ChangeProposal[] = [
  {
    id: 'demo-proposal-001',
    ref: 'CCP-2026-001',
    title: 'Public Health Policy Analysis — AI Integrity Redesign',
    category: 'ai_guidance_update',
    status: 'draft',
    rationale:
      'Increased uptake of generative AI across postgraduate essays requires clear academic integrity boundaries without prohibiting responsible research use.',
    currentSituation:
      'The existing policy analysis assessment offered vague AI guidance ("use responsibly"), leading to student uncertainty and divergent marking standards across evaluators.',
    proposedChange:
      'Introduce an explicit 3-tier AI usage framework (acceptable assistive search, conditional generative synthesis with declaration, prohibited direct text replacement) and updated rubric.',
    intendedBenefits:
      'Eliminates student ambiguity, establishes fair and consistent evaluation standards, and scaffolds professional AI literacy.',
    affectedComponents: 'Module: Health Policy Analysis (HPA-701); Programme: Master of Public Health',
    ownerName: 'Dr. Eleanor Vance',
    ownerRole: 'Module Leader',
    targetDate: '2026-09-01',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z',
    context: {
      programmeName: 'Master of Public Health',
      moduleName: 'Health Policy Analysis',
      level: 'Postgraduate (Level 7)',
      department: 'Public Health & Epidemiology',
      currentSituation:
        'Single terminal essay (100% weighting) with ambiguous AI citation rules.',
    },
    versions: [
      {
        id: 'ver_demo_01',
        title: 'Original Assessment Design (2025)',
        description: 'Initial syllabus version with limited general AI guidance',
        sourceType: 'assessment',
        sourceData: {
          assessmentMode: 'Policy Analysis Essay (4,000 words)',
          weighting: '100%',
          aiUsage: 'General advisory; unmonitored assistive use',
          learningOutcomesAssessed: ['LO1: Critical Policy Synthesis', 'LO2: Stakeholder Evaluation'],
        },
        createdAt: '2025-09-01',
        createdBy: 'Dr. Eleanor Vance',
        notes: 'Baseline syllabus approved for 2025/26 academic year.',
      },
      {
        id: 'ver_demo_02',
        title: 'Revised Assessment with AI Integrity Guidance (2026)',
        description: 'Updated specification with 3-tier AI policy and structured declaration form',
        sourceType: 'integrity',
        sourceData: {
          assessmentMode: 'Policy Analysis Portfolio (Case brief 2,500w + Reflection 1,500w)',
          weighting: '60% Case Brief / 40% Reflection',
          aiUsage: 'Tiered permission model with compulsory AI appendix disclosure',
          learningOutcomesAssessed: [
            'LO1: Critical Policy Synthesis',
            'LO2: Stakeholder Evaluation',
            'LO3: Transparent Methodological Rationale',
          ],
        },
        createdAt: '2026-02-01',
        createdBy: 'Dr. Eleanor Vance',
        notes: 'Proposed for QA review committee approval.',
      },
    ],
    changeLog: [
      {
        id: 'chg_demo_01',
        versionId: 'ver_demo_02',
        changeSummary: 'Introduced explicit AI integrity guidance & disclosure appendix',
        rationale: 'Generative AI proliferation necessitated structured boundaries and clear student guidance.',
        impact: 'Reduces misconduct ambiguity, supports ethical capability, and improves marking consistency.',
        date: '2026-02-01',
      },
    ],
    institutionalNotes: {
      reviewerNotes: 'Approved in principle by Programme Committee. Awaiting faculty Board of Studies sign-off.',
      generalNotes: 'Collaborative initiative with Institutional Academic Integrity Office.',
      aiInvolvement:
        'AI was used to summarize student feedback on the original assessment design to identify recurring pain points.',
      risksConcerns:
        'Risk of student confusion between assistive tools (grammatical aids) and content generation if examples are not clear.',
      assumptions:
        'Assumes all enrolled students receive introductory academic integrity workshop in Induction Week.',
      capabilityNotes:
        'Supports educator capability by demonstrating structured reflection on assessment validity in the generative AI era.',
    },
    comparisons: [],
  },
  {
    id: 'demo-proposal-002',
    ref: 'CCP-2026-002',
    title: 'Data Science Core — Assessment Weighting Rebalance',
    category: 'assessment_redesign',
    status: 'draft',
    rationale:
      'BCS accreditation criteria mandate authentic evidence of collaborative codebase delivery and reproducible research practices rather than rote memorization under exam conditions.',
    currentSituation:
      'Module currently assessed via 70% closed-book invigilated exam and 30% lab assignments, producing high exam anxiety and disconnected coding practice.',
    proposedChange:
      'Restructure assessment to 40% reproducible codebase portfolio + 30% collaborative machine learning pipeline + 30% synoptic oral viva examination.',
    intendedBenefits:
      'Increases alignment with industry data science workflows, tests authentic coding competencies, and minimizes unmonitored assessment risks via oral defence.',
    affectedComponents: 'Module: Applied Machine Learning (CS-302); Programme: BSc Data Science',
    ownerName: 'Prof. Marcus Thorne',
    ownerRole: 'Programme Director',
    targetDate: '2026-09-15',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-10T16:00:00.000Z',
    context: {
      programmeName: 'BSc Data Science',
      moduleName: 'Applied Machine Learning',
      level: 'Undergraduate (Level 6)',
      department: 'School of Computer Science',
      currentSituation: 'Exam-dominated assessment model (70% exam, 30% labs).',
    },
    versions: [
      {
        id: 'ver_demo_03',
        title: 'Exam-Heavy Baseline Model (2024)',
        description: 'Traditional 70% written exam and 30% weekly lab tasks',
        sourceType: 'manual',
        sourceData: {
          examWeight: '70%',
          courseworkWeight: '30%',
          examinationFormat: '3-hour closed-book invigilated paper',
        },
        createdAt: '2024-09-01',
        createdBy: 'Prof. Marcus Thorne',
        notes: 'Legacy assessment pattern.',
      },
      {
        id: 'ver_demo_04',
        title: 'Authentic Portfolio & Oral Defence (2026)',
        description: 'Multi-part authentic assessment incorporating code reproducibility and viva',
        sourceType: 'manual',
        sourceData: {
          codebasePortfolio: '40% (Reproducible Jupyter notebooks & unit tests)',
          collaborativePipeline: '30% (Group machine learning workflow & report)',
          oralViva: '30% (Individual 15-minute viva on methodology)',
        },
        createdAt: '2026-03-01',
        createdBy: 'Prof. Marcus Thorne',
        notes: 'Designed to satisfy updated BCS educational accreditation criteria.',
      },
    ],
    changeLog: [
      {
        id: 'chg_demo_02',
        versionId: 'ver_demo_04',
        changeSummary: 'Rebalanced 70% exam into 40% portfolio, 30% project, and 30% viva',
        rationale: 'Align with industry and BCS standards for authentic software engineering evaluation.',
        impact: 'Significantly improves practical skill demonstration and reduces exam stress.',
        date: '2026-03-10',
      },
    ],
    institutionalNotes: {
      reviewerNotes: 'External examiner strongly commended move toward authentic portfolio assessment.',
      generalNotes: 'Requires lab scheduling coordination for viva week in May.',
      aiInvolvement: 'None in proposal drafting; viva directly addresses AI integrity verification.',
      risksConcerns: 'Staff workload for individual vivas across 120 enrolled students requires scheduling plan.',
      assumptions: 'Assumes automated grading environment (GitLab CI) is maintained by departmental IT.',
      capabilityNotes: 'Fosters team-wide assessment design capability and authentic evaluation.',
    },
    comparisons: [],
  },
];

export function createDemoRepository(): RepositoryState {
  return {
    schemaVersion: '1.0.0',
    proposals: DEMO_PROPOSALS,
    activeProposalId: DEMO_PROPOSALS[0].id,
    lastUpdated: new Date().toISOString(),
  };
}
