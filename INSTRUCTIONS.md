# Curriculum Change Manager — User Instructions

---

### 1. Purpose
The **Curriculum Change Manager** is a local-first tool designed to track, compare, and document the evolution of curriculum and assessment designs over time. It ensures that changes are transparent, justified, and audit-ready.

---

### 2. What This Tool Does
This tool helps you manage multiple versions of your educational designs (e.g., assessments, AI integrity policies). It allows you to perform side-by-side comparisons of different versions, record the specific rationale for changes, and generate structured summaries suitable for Quality Assurance (QA) and institutional governance reviews.

---

### 3. Role in the Ecosystem
- **Phase:** Phase 6 — Evidence, Quality & Change
- **Role:** Tracks curriculum and assessment changes over time, enabling structured comparison, rationale capture, and audit-ready change documentation.
- **Reference:** [./PROJECT_SPEC.md](./PROJECT_SPEC.md)

---

### 4. When to Use This Tool
- When preparing for a periodic programme or module review.
- When documenting assessment modifications required by external accreditation bodies.
- When evolving AI integrity guidelines and policies within a module.
- When you need to provide a clear "change log" to a QA committee or board of examiners.

---

### 5. Inputs
- **Project Metadata:** Programme name, module name, level, and department.
- **Snapshots:** JSON export files from the **Assessment Design Engine** or **AI Integrity Design Tool**.
- **Manual Entries:** Custom version descriptions and content for changes not captured by other tools.
- **Change Rationale:** Narrative descriptions of why changes were made and their expected impact.

---

### 6. How to Use (Step-by-Step)
1. **Set Context:** Fill in the **Change Context** section with the relevant programme and module details.
2. **Add Versions:** Use the **Version Management** card to:
   - Click "Import Snapshot JSON" to load designs from other CloudPedagogy tools.
   - Click "Add Manual Version" to record changes that weren't generated via JSON snapshots.
3. **Compare Designs:** In the **Version Comparison** section, select two different versions to see their contents side-by-side and identify key differences.
4. **Log Changes:** Use the **Change Log** section to record specific modifications. For each entry, provide a summary, the rationale (why), and the impact (what happened as a result).
5. **Add Governance Notes:** Complete the **Institutional Approval & Notes** section, specifically addressing AI involvement, risks, and assumptions made during the change process.
6. **Generate Report:** Review the **Output Summary** at the bottom of the page. Use your browser's print function (Cmd+P or Ctrl+P) to save this as a PDF for your records or submission.

---

### 7. Key Outputs
- **Structured Change Log:** A clear timeline of what changed, why, and what the impact was.
- **Comparison Views:** Visual side-by-side analysis of design versions.
- **Audit-Ready Report:** A comprehensive summary including metadata, version history, change log, and institutional notes.
- **Project JSON:** A full export of your current work state for backup or sharing.

---

### 8. How It Connects to Other Tools
- **Upstream:** Consumes JSON snapshots from the **Assessment Design Engine** and **AI Integrity Design Tool**.
- **Downstream:** Outputs summaries for **Institutional QA processes**, **Accreditation dossiers**, and **External Examiner reviews**.

---

### 9. Limitations
- Does not create new curriculum or assessment designs from scratch (use the specific design engines for this).
- Does not perform automated curriculum mapping.
- Does not generate full evidence packs (use the **Evidence Pack Generator** for comprehensive evidence gathering).

---

### 10. Tips
- **Be Descriptive:** When importing a version, give it a clear title like "2023 Post-Exam Review" to make comparisons easier.
- **Focus on Rationale:** The "Rationale" field is critical for auditors; explain *why* a change was necessary (e.g., "Reflecting new AI policy guidance").
- **Local Persistence:** Your work is saved in your browser's `localStorage`. Use the "Export JSON" button in the header frequently to keep a permanent file-based backup of your progress.
