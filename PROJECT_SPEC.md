# PROJECT_SPEC: cloudpedagogy-curriculum-change-manager

## 1. Repo Name
`cloudpedagogy-curriculum-change-manager`

## 2. One-Sentence Purpose
A local-first application for tracking, comparing, and documenting the evolution of curriculum and assessment designs within a governance-aware framework.

## 3. Problem the App Solves
Academic design changes often occur in silos and are frequently documented poorly, leading to a lack of traceability for QA committees and auditors. As AI policies and assessment methods shift rapidly, institutions need a lightweight, structured way to record *why* changes were made and *what* their impact was, without the overhead of heavy enterprise software.

## 4. Primary User / Audience
Programme leaders, module coordinators, academic developers, QA officers, and institutional governance committees.

## 5. Core Role in the CloudPedagogy Ecosystem
Occupies **Phase 6 (Evidence, Quality & Change)** of the CloudPedagogy framework. It serves as a downstream aggregator for design outputs from Phase 2 (Assessment) and Phase 3 (Integrity), providing the "connective tissue" for long-term quality assurance and version control.

## 6. Main Entities / Data Structures
- **Meta**: Core project identifiers (Programme, Module, Level, Department).
- **Version**: A single point-in-time snapshot of a design, containing `sourceType` (assessment, integrity, manual) and the associated `sourceData`.
- **Comparison**: A relational entity or view that bridges two `Version` objects for side-by-side analysis.
- **ChangeLogEntry**: A discrete record of a modification, linking a `Version` to its rationale and impact.
- **InstitutionalNotes**: Governance-specific metadata including AI involvement, risk assessments, and reviewer comments.
- **AppState**: The root object containing the entire project state for local persistence and export.

## 7. Main User Workflows
1. **Design Versioning**: Users import JSON snapshots from other tools or create manual placeholders to build a chronological history of a design.
2. **Structured Comparison**: Selecting two versions to visualize changes in learning outcomes, assessment tasks, or AI policies.
3. **Rationale Documentation**: Explicitly recording the "Why" and "So What" for every significant design shift.
4. **Governance Review**: Finalizing the change record with institutional notes and risk assessments before exporting for formal approval.

## 8. Current Features
- Local-first persistence using browser `localStorage`.
- Snapshot import for Assessment and AI Integrity data formats.
- Manual version creation for non-JSON-based changes.
- Comparison engine for visualizing differences between snapshots.
- Change log management with summary, rationale, and impact fields.
- Dedicated governance fields for AI involvement, risks, and assumptions.
- Full project state JSON import/export.
- Print-optimized Output Summary for PDF generation.

## 9. Stubbed / Partial / Incomplete Features
- Automated "delta" detection (currently relies on human comparison of selected versions).
- Not explicitly defined in current repo contents.

## 10. Import / Export and Storage Model
- **Storage**: Browser `localStorage` for primary working data.
- **Import/Export**: 
  - Imports individual snapshots from other Phase 2/3 tools.
  - Exports/Imports the entire application state as a single JSON file (`cp-change-manager-export.json`).

## 11. Relationship to Other CloudPedagogy Apps
- **Downstream of:** `assessment-design-engine` and `ai-integrity-design-tool` (consumes their JSON outputs).
- **Parallel to:** `evidence-pack-generator` (provides the change history context that may be referenced in an evidence pack).

## 12. Potential Overlap or Duplication Risks
- May overlap with institutional VLE version histories or formal curriculum management systems (CMS). However, its value lies in capturing *pedagogical rationale* and *AI-specific governance* which are often missing from technical CMS logs.

## 13. Distinctive Value of This App
Provides a "low-friction, high-transparency" bridge between design and governance. It forces the documentation of rationale—not just the change itself—specifically highlighting AI-related shifts in a way that aligns with modern academic integrity requirements.

## 14. Recommended Future Enhancements
- **Auto-Delta Highlighting**: Automatically highlight text differences between two imported JSON snapshots.
- **Evidence Pack Linking**: Ability to export a specific version or change log directly into a CloudPedagogy Evidence Pack.
- **Institutional Templates**: Configurable governance fields to match specific institutional QA forms.

## 15. Anything Unclear or Inferred from Repo Contents
- **Evidence Pack Import**: While the README mentions "Evidence packs" as an upstream input, the current import logic in `VersionManagementCard.tsx` specifically detects assessment and integrity patterns.
- **Versioning Logic**: The app assumes a linear or branching history managed by the user; there is no automated version numbering (e.g., v1.1.0) beyond the manual titles provided.
