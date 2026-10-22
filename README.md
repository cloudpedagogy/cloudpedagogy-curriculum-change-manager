# CloudPedagogy Curriculum Change Manager (CCM)

A standalone, local-first academic governance tool for authoring, evaluating, tracking, and comparing curriculum change proposals over time.

CCM introduces versioning, educational rationale capture, multi-dimensional impact assessment, formal decision recording, and implementation auditability into academic course design and institutional quality assurance workflows.

---

## Purpose and Scope

Curriculum modifications in higher and further education are frequently recorded across fragmented email threads, ad-hoc committee minutes, and disconnected document versions. This fragmentation creates quality assurance risks, obscures pedagogical rationales, and complicates periodic review or professional accreditation.

The **Curriculum Change Manager** provides a structured, educator-centred workspace to:
- Document proposed curriculum changes with explicit pedagogical rationales.
- Assess implications across six core educational dimensions before formal committee submission.
- Maintain multi-proposal catalogues within an isolated local workspace.
- Attach, inspect, and perform deep structural comparisons between version snapshots.
- Record formal committee reviews, approval conditions, and governance decisions.
- Track post-approval operational implementation actions through to verified closure.
- Generate professional, audit-ready governance dossiers formatted for clipboard export and clean browser printing (Save as PDF).

### Scope and Boundaries

CCM is designed specifically for **local curriculum change management and governance audit trails**.

**In Scope:**
- Multi-proposal authoring with 10-stage progressive-disclosure workflow.
- Generic, tested nested snapshot comparison engine.
- Educational impact assessment and pedagogical synthesis.
- Traceable governance lifecycle (Draft → Submitted → Under Review → Approved / Rejected / Returned → In Implementation → Completed).
- JSON workspace export and import with migration safeguards.
- Browser-native printable governance dossiers.

**Explicit Out-of-Scope Exclusions:**
- Multi-user authentication, cloud accounts, or centralised databases.
- Automated email or push notifications.
- Direct statutory approval authentication (see [Governance Disclaimer](#institutional-governance-disclaimer)).
- AI-generated governance verdicts or automated decision-making.
- Commercial CloudPedagogy Curriculum Studio integrations (these are managed in separate repositories).

---

## Institutional Governance Disclaimer

> **Important Notice:** The CloudPedagogy Curriculum Change Manager is a local-first record-keeping, reflection, and decision-tracking environment. CCM **supports the recording and documentation of governance reviews and decisions, but does not independently authenticate or confer institutional authority**. Formal curriculum validity requires adherence to your institution's specific terms of reference, committee regulations, and statutory quality frameworks (such as the Board of Studies, Academic Board, or Quality Assurance Committee).

---

## Installation and Local Development

CCM is built using React 19, TypeScript, and Vite. It runs entirely client-side in standard modern web browsers without requiring backend infrastructure or database setup.

### Prerequisites

- Node.js (version 20 or higher recommended)
- npm (version 9 or higher)

### Setup Steps

1. Clone or navigate to the repository directory:
   ```bash
   cd cloudpedagogy-curriculum-change-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```
   Open the displayed local URL (typically `http://localhost:5173`) in your web browser.

4. Run automated test suites:
   ```bash
   npm test
   ```

5. Run typechecking, linting, and production build:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

---

## Core Workflows and Features

### 1. Blank-First Onboarding & Workspace Initialisation
When launched for the first time, CCM opens to a clean, clutter-free blank workspace. Users can immediately:
- **Create a Blank Proposal:** Initialises an empty change proposal with a sequential reference code (`CCP-YYYY-XXX`).
- **Load Demonstration Workspace:** Optionally populates two representative curriculum proposals (e.g. an authentic assessment restructuring and an introductory clinical skills revision) to explore the system.
- **Import Existing Workspace:** Restores a previously exported `.json` file backup.

### 2. Multi-Proposal Catalogue
- Manage multiple independent curriculum proposals within one local workspace.
- Real-time search across proposal titles, reference IDs, module names, programme names, and proposer names.
- Filter proposals by modification category:
  - `Major Modification`
  - `Minor Amendment`
  - `Assessment Restructuring`
  - `AI Integration`
  - `Credit Reallocation`
  - `Delivery Mode Shift`
- Individual proposal deletion with confirmation safeguards to prevent accidental data loss.

### 3. Progressive-Disclosure 10-Stage Authoring Workflow
The proposal editor organises the governance journey into three logical workflow phases with accessible WAI-ARIA tab semantics and compact responsive layouts for mobile and tablet devices:

#### Phase 1: Proposal Design & Content (Stages 1–4)
- **Stage 1 (Basic Details):** Proposal title, change category, proposer identity, institutional role, and target delivery date.
- **Stage 2 (Curriculum Context):** Programme title, module title, FHEQ/academic level, department or faculty, and current baseline situation.
- **Stage 3 (Change & Rationale):** Precise description of proposed modifications, educational rationale, intended student learning benefits, and affected components.
- **Stage 4 (Snapshots & Log):** Version snapshot attachment (via JSON file import or manual editor) and discrete change log entries with impact rationales.

#### Phase 2: Governance & Decision (Stages 5–7)
- **Stage 5 (Educational Impact Assessment):** Systematic evaluation across six core pedagogical dimensions:
  1. *Learning Outcomes & Curriculum Alignment*
  2. *Assessment Design & Academic Standards*
  3. *Student Progression & Prerequisites*
  4. *Teaching Delivery & Learning Resources*
  5. *Staff Workload & Implementation Feasibility*
  6. *Accessibility, Inclusion & Student Experience*
  Each dimension captures an impact rating (`None`, `Low`, `Moderate`, `High`), evidence basis, and proposed mitigations, concluded by an overall pedagogical synthesis.
- **Stage 6 (Review & Decisions):**
  - Record committee and peer review findings, recommendations, and conditions.
  - Author formal governance decisions (`Approved`, `Rejected`, `Returned for Revision`) with recorded rationales, mandatory approval conditions, and target snapshot linkages.
  - Transparent lifecycle transition controls enforcing governance invariants.
- **Stage 7 (Implementation Plan):**
  - Track operational implementation tasks with assignees, due dates, statuses (`Not Started`, `In Progress`, `Blocked`, `Completed`), and completion evidence.
  - Formally verify closure sign-off once all actions are completed.

#### Phase 3: Assurance & Records (Stages 8–10)
- **Stage 8 (Governance Notes):** Capture institutional notes on AI involvement, underlying pedagogical assumptions, operational risks, and academic capability development.
- **Stage 9 (Governance History):** Chronological, immutable audit trail documenting all lifecycle state transitions, decision events, action updates, and reopenings.
- **Stage 10 (Output Summary Dossier):** Comprehensive, printable audit dossier.

---

## Meaningful Version Comparison Engine

CCM includes a tested, generic snapshot comparison utility (`src/utils/comparison.ts`):
- **Universal Snapshot Comparison:** Compare any two arbitrary version snapshots attached to a proposal (not restricted to demonstration data).
- **Deep Structural Diffing:** Traverses nested objects, arrays, and primitive values, identifying:
  - `Added` fields (green indicator)
  - `Removed` fields (red indicator)
  - `Modified` values (amber indicator)
- **Key-Order Invariance:** Normalises object keys prior to comparison; harmless ordering differences are never flagged as curriculum changes.
- **Distinguishes Missing from Empty Values:** Clearly differentiates omitted fields from explicitly empty strings (`""`), empty arrays (`[]`), or empty objects (`{}`).
- **Curriculum-Aware Breadcrumb Labels:** Maps technical property paths (e.g. `learningOutcomes[0].rubrics`) to readable academic breadcrumbs (*Learning Outcomes → Item 1 → Marking Rubrics*).
- **Snapshot Immutability:** Compares data without mutating either input snapshot.
- **Detailed Inspection:** Filter changes by change type pill (`All`, `Added`, `Removed`, `Modified`) and expand raw JSON before/after representations on demand.

---

## Audit-Ready Dossier and Browser Printing

The **Output Summary** provides an institution-grade governance dossier:
- **Audit Completeness Checklist:** Highlights missing or incomplete governance items (e.g. missing rationale, unassessed impact dimensions, or pending decisions) with clear visual callouts.
- **Integrated Snapshot Diff Summary:** Automatically embeds baseline-to-latest snapshot diff metrics and key modifications when two or more versions are present.
- **Structured Clipboard Export:** Generates clean, formatted Markdown when clicking **Copy Text**, ideal for pasting into committee agendas, Word reports, or VLE documentation.
- **Browser Print Styling (Save as PDF):**
  - Automatically suppresses navigation bars, buttons, and app chrome via dedicated `@media print` rules.
  - Eliminates clipped tables, awkward multi-page pagination breaks, and text truncation using `break-inside: avoid` on dossier sections and table rows.
  - Does not rely on external PDF rendering binaries or cloud microservices.

---

## Data Integrity, Persistence & Migration

### Storage Architecture & Browser Limitations

CCM stores repository state in the user's browser `localStorage` (`cp_curriculum_change_manager_state`).

- **Local Storage Quota:** Most modern browsers allocate approximately 5 MB of storage per origin. If extensive version snapshots are added and quota limits are approached, CCM triggers a prominent **Storage Persistence Warning** banner.
- **Rescue JSON Export:** The warning provides an instant one-click **Export Backup JSON** button to ensure work can be downloaded safely to the user's filesystem before data is lost.
- **Session Privacy:** Clearing browser cache or switching to Private/Incognito browsing will reset local storage. Regular JSON backups are strongly recommended.

### Migration Path

CCM enforces continuous backward data compatibility:
- **Legacy v0 Single-Module Format** → Migrates automatically to v1.1.0 multi-proposal format with preserved snapshots and changelogs. A safety backup of the raw legacy string is archived under `cp_curriculum_change_manager_state_legacy_backup`.
- **Batch 1 Schema (1.0.0)** → Migrates losslessly to schema 1.1.0, initialising governance structures and event logs.
- **Batch 2 & 3 Schema (1.1.0)** → Current active schema.
- **Future Schema Safeguard:** Importing a file with an unsupported future schema version will be safely rejected without overwriting the active workspace.
- **Validation Guard:** Malformed or non-JSON files are rejected with explanatory feedback; current user data is never destroyed by invalid imports.

---

## Accessibility and Usability Standards

- **WAI-ARIA Tab Semantics:** All stage navigation tabs implement `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and `role="tabpanel"`.
- **Keyboard Navigation:** Full arrow-key navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`) across stages with focus management.
- **Contrast & Colour Independence:** Status indicators pair curated colour palettes with text labels, icons, and distinct borders to ensure readability under high-contrast or black-and-white printing.
- **Action Availability Guidance:** Disabled action buttons are paired with actionable guidance banners explaining exactly what steps must be completed prior to state transition.

---

## Project Structure

```
cloudpedagogy-curriculum-change-manager/
├── src/
│   ├── components/             # UI components
│   │   ├── EducationalImpactCard.tsx
│   │   ├── EmptyWorkspaceView.tsx
│   │   ├── GovernanceHistoryCard.tsx
│   │   ├── Header.tsx
│   │   ├── ImplementationTrackerCard.tsx
│   │   ├── OutputSummaryCard.tsx
│   │   ├── ProposalCatalogue.tsx
│   │   ├── ProposalEditor.tsx
│   │   ├── ReviewAndDecisionsCard.tsx
│   │   ├── VersionComparisonCard.tsx
│   │   └── VersionManagementCard.tsx
│   ├── hooks/
│   │   └── useAppState.ts      # Multi-proposal workspace state & storage management
│   ├── utils/
│   │   ├── comparison.ts       # Generic nested snapshot comparison engine
│   │   ├── demoData.ts         # Synthetic demo proposals
│   │   ├── dossier.ts          # Structured markdown dossier generator
│   │   ├── governance.ts       # Governance invariants, transitions, and event creators
│   │   ├── idGenerator.ts      # Stable UUID generator
│   │   └── migration.ts        # Schema validation, creation, and migration utilities
│   ├── types.ts                # TypeScript domain models and enums
│   ├── App.tsx                 # Root application container
│   ├── index.css               # Core design tokens, responsive styles & print CSS
│   └── main.tsx                # Application entry point
├── public/                     # Static icons and metadata
├── README.md                   # System documentation
├── INSTRUCTIONS.md             # End-user guidance
└── package.json
```

---

## Licence

MIT Licence. See [LICENSE](./LICENSE) for details. Developed by CloudPedagogy.
