import type { ChangeProposal, RepositoryState } from '../types';
import { createGovernanceEvent } from './governance';

export const DEMO_PROPOSALS: ChangeProposal[] = [
  {
    id: 'demo-proposal-001',
    ref: 'CCP-2026-001',
    title: 'Public Health Policy Analysis — AI Integrity Redesign',
    category: 'ai_guidance_update',
    status: 'approved',
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
      reviewerNotes: 'Approved in principle by Programme Committee. Board of Studies sign-off completed.',
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
    // Batch 2 Governance Data
    impactAssessment: {
      dimensions: {
        learningOutcomes: {
          key: 'learningOutcomes',
          title: 'Learning Outcomes & Curriculum Alignment',
          impactLevel: 'moderate',
          rationale: 'Reinforces LO3 (methodological transparency) without changing core competencies.',
          evidence: 'Updated curriculum alignment matrix in syllabus appendix.',
          mitigation: 'Include exemplary policy briefs with transparent citation.',
        },
        assessmentDesign: {
          key: 'assessmentDesign',
          title: 'Assessment Design & Academic Standards',
          impactLevel: 'high',
          rationale: 'Introduces a compulsory AI declaration appendix and split portfolio model.',
          evidence: 'Student consultation and Academic Integrity Working Group review.',
          mitigation: 'Provide grading criteria calibration session for all markers.',
        },
        studentProgression: {
          key: 'studentProgression',
          title: 'Student Progression & Prerequisites',
          impactLevel: 'none',
          rationale: 'Does not alter module prerequisites, credits (20 CATS), or progression hurdles.',
          evidence: 'Registry programme specifications confirm credit parity.',
          mitigation: '',
        },
        teachingDelivery: {
          key: 'teachingDelivery',
          title: 'Teaching Delivery & Learning Resources',
          impactLevel: 'low',
          rationale: 'Requires dedicated 1-hour workshop on acceptable assistive AI use during seminars.',
          evidence: 'VLE teaching materials updated for week 3.',
          mitigation: 'Record workshop for asynchronous student access.',
        },
        staffWorkload: {
          key: 'staffWorkload',
          title: 'Staff Workload & Implementation Feasibility',
          impactLevel: 'low',
          rationale: 'Slightly higher initial marking time per paper, mitigated by standardised declaration form.',
          evidence: 'Pilot marking test showed ~4 minutes additional review per submission.',
          mitigation: 'Provide rubric checklist template for markers.',
        },
        accessibilityInclusion: {
          key: 'accessibilityInclusion',
          title: 'Accessibility, Inclusion & Student Experience',
          impactLevel: 'moderate',
          rationale: 'Clear permission boundaries benefit students with diverse language backgrounds and neurodivergent learners.',
          evidence: 'Disability advisory service reviewed guidance language for plain English clarity.',
          mitigation: 'Produce multi-modal guidance (text + short infographic video).',
        },
      },
      overallNotes: 'Assessment reflects balanced pedagogical judgement supporting AI literacy without undermining academic rigor.',
      lastAssessedAt: '2026-02-05T11:00:00.000Z',
    },
    reviews: [
      {
        id: 'rev_demo_01',
        reviewerName: 'Prof. Alistair Finch',
        reviewerRole: 'Faculty Quality Assurance Officer',
        reviewDate: '2026-02-10',
        findings: 'The proposed 3-tier framework aligns well with institutional policy. The assessment split reduces reliance on unmonitored essays.',
        recommendations: 'Recommend approval subject to sample declaration forms being published on the module VLE page.',
        revisionRequests: '',
        conditions: 'Ensure sample declaration forms and marking rubric calibration notes are distributed to external examiners.',
      },
    ],
    decisions: [
      {
        id: 'dec_demo_01',
        outcome: 'approved',
        decisionMaker: 'Faculty Board of Studies',
        decisionDate: '2026-02-15',
        decisionRationale: 'Proposal strengthens academic integrity while scaffolding authentic student capability. Pedagogical rationale and impact mitigations are robust.',
        conditions: 'Approved subject to sharing the induction workshop materials with external examiners.',
        targetSnapshotId: 'ver_demo_02',
      },
    ],
    implementationActions: [
      {
        id: 'act_demo_01',
        title: 'Publish updated module specification and 3-tier AI declaration template on VLE',
        assignee: 'Dr. Eleanor Vance',
        dueDate: '2026-03-01',
        status: 'completed',
        notes: 'Template and guidance uploaded to module handbook.',
        completionEvidence: 'Handbook v2.1 uploaded to Moodle.',
        completedAt: '2026-02-28',
      },
      {
        id: 'act_demo_02',
        title: 'Conduct marker calibration briefing for seminar leaders and graders',
        assignee: 'Dr. Eleanor Vance',
        dueDate: '2026-04-15',
        status: 'in_progress',
        notes: 'Briefing slides drafted; scheduled for departmental meeting in April.',
      },
      {
        id: 'act_demo_03',
        title: 'Schedule student AI literacy induction workshop for Autumn term intake',
        assignee: 'Academic Integrity Office',
        dueDate: '2026-08-20',
        status: 'not_started',
        notes: 'Awaiting timetable slot confirmation from Central Registry.',
      },
    ],
    events: [
      createGovernanceEvent('proposal_created', 'Dr. Eleanor Vance', 'Proposal created in draft status'),
      createGovernanceEvent('proposal_submitted', 'Dr. Eleanor Vance', 'Proposal submitted for academic QA scrutiny'),
      createGovernanceEvent('under_review', 'QA Committee', 'Assigned to Prof. Alistair Finch for formal review'),
      createGovernanceEvent('review_recorded', 'Prof. Alistair Finch', 'Formal QA review recorded with recommendation to approve'),
      createGovernanceEvent('decision_recorded', 'Faculty Board of Studies', 'Formal decision recorded: APPROVED with conditions'),
      createGovernanceEvent('proposal_approved', 'Faculty Board of Studies', 'Proposal status transitioned to APPROVED'),
      createGovernanceEvent('action_added', 'Dr. Eleanor Vance', 'Action added: Publish updated module specification'),
      createGovernanceEvent('action_completed', 'Dr. Eleanor Vance', 'Action completed: Publish updated module specification'),
    ],
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
    // Batch 2 Governance Data - Draft stage with initial impact assessment
    impactAssessment: {
      dimensions: {
        learningOutcomes: {
          key: 'learningOutcomes',
          title: 'Learning Outcomes & Curriculum Alignment',
          impactLevel: 'high',
          rationale: 'Substantially elevates software reproducibility and technical communication competencies.',
          evidence: 'BCS accreditation guidelines 2025/26.',
        },
        assessmentDesign: {
          key: 'assessmentDesign',
          title: 'Assessment Design & Academic Standards',
          impactLevel: 'high',
          rationale: 'Complete shift from written exam to 3-part authentic portfolio and viva.',
          evidence: 'External examiner report 2024/25.',
        },
        studentProgression: {
          key: 'studentProgression',
          title: 'Student Progression & Prerequisites',
          impactLevel: 'low',
          rationale: 'Prerequisites remain CS-201 and CS-204; passing grade threshold unchanged.',
        },
        teachingDelivery: {
          key: 'teachingDelivery',
          title: 'Teaching Delivery & Learning Resources',
          impactLevel: 'moderate',
          rationale: 'Requires dedicated GitLab CI runner servers for automated code testing.',
          mitigation: 'Book cloud compute allocation from faculty IT pool.',
        },
        staffWorkload: {
          key: 'staffWorkload',
          title: 'Staff Workload & Implementation Feasibility',
          impactLevel: 'moderate',
          rationale: 'Vivas require ~30 hours staff commitment over 1 week; compensated by elimination of exam marking.',
          mitigation: 'Pair academic staff with post-doctoral teaching fellows for viva panels.',
        },
        accessibilityInclusion: {
          key: 'accessibilityInclusion',
          title: 'Accessibility, Inclusion & Student Experience',
          impactLevel: 'low',
          rationale: 'Alternative viva arrangements (remote or written defense) available for students with anxiety adjustments.',
        },
      },
      overallNotes: 'Draft assessment in progress; awaiting feedback from student representatives.',
      lastAssessedAt: '2026-03-05T14:00:00.000Z',
    },
    reviews: [],
    decisions: [],
    implementationActions: [],
    events: [
      createGovernanceEvent('proposal_created', 'Prof. Marcus Thorne', 'Proposal created in draft status'),
    ],
  },
];

export function createDemoRepository(): RepositoryState {
  return {
    schemaVersion: '1.1.0',
    proposals: DEMO_PROPOSALS,
    activeProposalId: DEMO_PROPOSALS[0].id,
    lastUpdated: new Date().toISOString(),
  };
}
