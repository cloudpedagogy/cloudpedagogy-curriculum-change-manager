# CloudPedagogy Curriculum Change Manager — User Instructions

A comprehensive guide for academic programme directors, module convenors, quality officers, and educational designers using the standalone Curriculum Change Manager (CCM).

---

## 1. Quick Start Guide

### Step 1: Open the Application
When you launch CCM, it opens to a blank workspace. You have three choices:
- **Create Blank Proposal:** Start authoring a new proposal immediately.
- **Load Demo Proposals:** Load two realistic curriculum change examples to familiarise yourself with the interface.
- **Import JSON Workspace:** Upload a previously saved `.json` file backup.

### Step 2: Set Proposal Metadata & Curriculum Context
1. Select your proposal from the **Proposals Catalogue**.
2. Under **Stage 1 (Basic Details)**, enter your proposal title, change category (e.g. Major Modification, Assessment Restructuring), proposer name, and institutional role.
3. Under **Stage 2 (Curriculum Context)**, record the programme name, module title, academic level, and department/faculty.

### Step 3: Document Proposed Change & Educational Rationale
Navigate to **Stage 3 (Change & Rationale)** to articulate:
- The exact changes to module content, assessment, or delivery mode.
- The pedagogical rationale driving the change (e.g. alignment with updated QAA subject benchmark statements or industry requirements).
- Expected student learning benefits and affected components.

### Step 4: Attach Version Snapshots & Compare
Under **Stage 4 (Snapshots & Log)**:
- Import version snapshot JSON files or create manual version snapshots representing the baseline and proposed designs.
- Select the **Version Comparison** inspector to review side-by-side differences. The generic comparison engine highlights additions (green), removals (red), and modifications (amber), with readable curriculum breadcrumb labels.
- Record discrete change log entries explaining specific adjustments.

### Step 5: Complete the Educational Impact Assessment
Navigate to **Stage 5 (Educational Impact)**. Evaluate the implications across the six standard dimensions:
1. *Learning Outcomes & Curriculum Alignment*
2. *Assessment Design & Academic Standards*
3. *Student Progression & Prerequisites*
4. *Teaching Delivery & Learning Resources*
5. *Staff Workload & Implementation Feasibility*
6. *Accessibility, Inclusion & Student Experience*

Assign an impact level (`None`, `Low`, `Moderate`, `High`), provide supporting evidence, and record any mitigating actions. Add an overall pedagogical synthesis.

### Step 6: Submit for Review & Record Decisions
1. In the guidance banner or **Stage 6 (Review & Decisions)**, click **Submit for Review**.
2. Record peer or committee reviewer findings, recommendations, and conditions.
3. Once the Board of Studies or Academic Committee convenes, record the formal outcome (`Approved`, `Rejected`, or `Returned for Revision`) with recorded rationales and conditions.

### Step 7: Manage Implementation Actions & Verify Closure
Navigate to **Stage 7 (Implementation Plan)**:
- Add concrete rollout tasks with assignees and target completion dates.
- Update task statuses as operational milestones are reached.
- Once all actions are complete, record the final verification sign-off and close the proposal.

### Step 8: Generate and Export the Governance Dossier
Under **Stage 10 (Output Summary)**:
- Inspect the **Audit Completeness Notice** to ensure no essential governance details were overlooked.
- Review the automatically embedded snapshot comparison summary.
- Click **Copy Text** to copy the full dossier formatted in clean Markdown to your clipboard.
- Click **Print Report** (or press Ctrl+P / Cmd+P) to generate a clean, paginated PDF report.

---

## 2. Managing Your Local Workspace

### Local Storage & Backup Safeguards
- CCM stores all records directly in your browser's `localStorage`.
- No user data is sent across the network or stored in external databases.
- If storage limits are reached, CCM presents a **Storage Persistence Warning** banner with an immediate **Export Backup JSON** option.
- **Best Practice:** Regularly export your workspace via the **Export** button in the top navigation bar to save an authoritative file on your institutional drive.

### Importing and Restoring Data
- Click **Import** in the header to restore a `.json` backup.
- CCM validates file structure and schema version before replacing your active workspace.
- Invalid or corrupted files will be safely rejected without overwriting your current data.

---

## 3. Governance Notice & Institutional Limitations

> **Governance Notice:** CCM is designed to support structured reflection, pedagogical rationale capture, and local audit readiness. Recording an approval decision in CCM records what occurred in committee but **does not replace formal institutional sign-off or confer independent statutory authority**. Formal curriculum validity requires adherence to your institution's specific governance procedures.
