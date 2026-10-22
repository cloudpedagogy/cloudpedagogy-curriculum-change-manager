import type { ChangeProposal, ImpactDimensionKey } from '../types';
import { IMPACT_DIMENSIONS } from './governance';
import { diffCurriculumSnapshots } from './comparison';

/**
 * Generates an audit-ready, structured Markdown governance dossier from a proposal.
 * Suitable for copying into committee minutes, VLE pages, or saving as documentation.
 */
export function generateMarkdownDossier(proposal: ChangeProposal): string {
  const dimKeys = Object.keys(IMPACT_DIMENSIONS) as ImpactDimensionKey[];

  let md = `# Curriculum Change Governance Dossier\n\n`;
  md += `**Reference:** ${proposal.ref} | **Category:** ${proposal.category.toUpperCase().replace(/_/g, ' ')}\n`;
  md += `**Title:** ${proposal.title}\n`;
  md += `**Current Status:** ${proposal.status.toUpperCase().replace(/_/g, ' ')}\n`;
  md += `**Proposer:** ${proposal.ownerName || 'Unassigned'} ${proposal.ownerRole ? `(${proposal.ownerRole})` : ''}\n`;
  md += `**Created Date:** ${new Date(proposal.createdAt).toLocaleDateString()}\n`;
  if (proposal.targetDate) {
    md += `**Target Implementation:** ${proposal.targetDate}\n`;
  }
  md += `\n---\n\n`;

  md += `> **Governance Notice:** This dossier represents a local academic proposal and audit record maintained in the CloudPedagogy Curriculum Change Manager. Formal validity requires ratification by the competent institutional committee (e.g. Board of Studies or Academic Standards Committee) in accordance with institutional terms of reference.\n\n`;

  // Section 1: Curriculum Context
  md += `## 1. Curriculum Context\n\n`;
  md += `- **Programme:** ${proposal.context.programmeName || '[Incomplete: Programme not specified]'}\n`;
  md += `- **Module:** ${proposal.context.moduleName || '[Incomplete: Module not specified]'} (Level: ${proposal.context.level || 'Not specified'})\n`;
  md += `- **Department / Faculty:** ${proposal.context.department || 'Not specified'}\n`;
  if (proposal.context.currentSituation) {
    md += `- **Current Situation:** ${proposal.context.currentSituation}\n`;
  }
  md += `\n`;

  // Section 2: Proposed Change & Educational Rationale
  md += `## 2. Proposed Change & Educational Rationale\n\n`;
  md += `### Proposed Change\n${proposal.proposedChange || '[Incomplete: No change description documented]'}\n\n`;
  md += `### Educational Rationale\n${proposal.rationale || '[Incomplete: No educational rationale documented]'}\n\n`;
  if (proposal.intendedBenefits) {
    md += `### Intended Outcomes & Benefits\n${proposal.intendedBenefits}\n\n`;
  }
  if (proposal.affectedComponents) {
    md += `### Affected Curriculum Components\n${proposal.affectedComponents}\n\n`;
  }

  // Section 3: Educational Impact Assessment Findings
  md += `## 3. Educational Impact Assessment Findings\n\n`;
  md += `| Dimension | Impact Level | Rationale & Evidence | Mitigation |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  dimKeys.forEach((key) => {
    const def = IMPACT_DIMENSIONS[key];
    const data = proposal.impactAssessment?.dimensions?.[key];
    const lvl = data?.impactLevel ? data.impactLevel.replace(/_/g, ' ') : 'not assessed';
    const rat = (data?.rationale || 'None recorded').replace(/\|/g, '\\|');
    const ev = data?.evidence ? ` (Evidence: ${data.evidence.replace(/\|/g, '\\|')})` : '';
    const mit = (data?.mitigation || 'None proposed').replace(/\|/g, '\\|');
    md += `| **${def.title}** | ${lvl} | ${rat}${ev} | ${mit} |\n`;
  });
  if (proposal.impactAssessment?.overallNotes) {
    md += `\n**Overall Pedagogical Synthesis:** ${proposal.impactAssessment.overallNotes}\n\n`;
  } else {
    md += `\n*Overall Pedagogical Synthesis: Not documented.*\n\n`;
  }

  // Section 4: Committee & Peer Reviews
  md += `## 4. Committee & Peer Reviews\n\n`;
  if (!proposal.reviews || proposal.reviews.length === 0) {
    md += `*No formal committee reviews recorded.*\n\n`;
  } else {
    proposal.reviews.forEach((rev, idx) => {
      md += `### Review ${idx + 1}: ${rev.reviewerName} ${rev.reviewerRole ? `(${rev.reviewerRole})` : ''} - ${rev.reviewDate}\n`;
      md += `- **Findings:** ${rev.findings}\n`;
      if (rev.recommendations) md += `- **Recommendations:** ${rev.recommendations}\n`;
      if (rev.conditions) md += `- **Conditions:** ${rev.conditions}\n`;
      md += `\n`;
    });
  }

  // Section 5: Formal Governance Decisions
  md += `## 5. Formal Governance Decisions\n\n`;
  if (!proposal.decisions || proposal.decisions.length === 0) {
    md += `*No formal governance decisions recorded yet.*\n\n`;
  } else {
    proposal.decisions.forEach((dec) => {
      md += `- **Outcome:** ${dec.outcome.toUpperCase().replace(/_/g, ' ')} by ${dec.decisionMaker} on ${dec.decisionDate}\n`;
      md += `  - **Rationale:** ${dec.decisionRationale}\n`;
      if (dec.conditions) md += `  - **Approval Conditions:** ${dec.conditions}\n`;
      if (dec.targetSnapshotId) md += `  - **Target Snapshot:** ${dec.targetSnapshotId}\n`;
      md += `\n`;
    });
  }

  // Section 6: Implementation Tracking
  md += `## 6. Implementation Tracking & Closure\n\n`;
  if (!proposal.implementationActions || proposal.implementationActions.length === 0) {
    md += `*No implementation actions recorded.*\n\n`;
  } else {
    md += `| Action | Assignee | Due Date | Status | Completion Evidence |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    proposal.implementationActions.forEach((act) => {
      md += `| ${act.title.replace(/\|/g, '\\|')} | ${act.assignee.replace(/\|/g, '\\|')} | ${act.dueDate || '—'} | ${act.status.replace(/_/g, ' ')} | ${(act.completionEvidence || act.notes || '—').replace(/\|/g, '\\|')} |\n`;
    });
    md += `\n`;
  }
  if (proposal.closure) {
    md += `### Implementation Closure Sign-Off\n`;
    md += `- **Verified By:** ${proposal.closure.verifiedBy} on ${proposal.closure.verifiedDate}\n`;
    md += `- **Verification Basis:** ${proposal.closure.verifiedBasis}\n`;
    if (proposal.closure.closureNotes) {
      md += `- **Closure Notes:** ${proposal.closure.closureNotes}\n`;
    }
    md += `\n`;
  }

  // Section 7: Version Snapshots & Comparison Summary
  md += `## 7. Version Snapshots & Comparison Summary\n\n`;
  if (proposal.versions.length === 0) {
    md += `*No design versions attached to this proposal.*\n\n`;
  } else {
    proposal.versions.forEach((v) => {
      md += `- **${v.title}** (${v.createdAt}) [Source: ${v.sourceType}]: ${v.description || 'No description'}\n`;
    });
    md += `\n`;

    if (proposal.versions.length >= 2) {
      const baselineV = proposal.versions[0];
      const latestV = proposal.versions[proposal.versions.length - 1];
      const diffResult = diffCurriculumSnapshots(baselineV.sourceData, latestV.sourceData);

      md += `### Baseline vs Latest Snapshot Comparison\n`;
      md += `- **Baseline:** ${baselineV.title} (${baselineV.id})\n`;
      md += `- **Latest:** ${latestV.title} (${latestV.id})\n`;
      md += `- **Summary:** ${diffResult.summary.totalChanges} total changes (${diffResult.summary.addedCount} added, ${diffResult.summary.removedCount} removed, ${diffResult.summary.modifiedCount} modified)\n\n`;

      if (diffResult.changes.length > 0) {
        md += `| Changed Field | Type | Baseline Value | New Value |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        diffResult.changes.slice(0, 15).forEach((c) => {
          md += `| **${c.label}** (\`${c.path}\`) | ${c.type.toUpperCase()} | ${c.oldDisplay.replace(/\|/g, '\\|')} | ${c.newDisplay.replace(/\|/g, '\\|')} |\n`;
        });
        if (diffResult.changes.length > 15) {
          md += `\n*... and ${diffResult.changes.length - 15} additional changed fields.* (Refer to Version Snapshots tab for interactive inspector)\n`;
        }
        md += `\n`;
      }
    } else {
      md += `*Single version snapshot recorded. Baseline comparison requires at least two version snapshots.*\n\n`;
    }
  }

  // Section 8: Documented Change Log Entries
  md += `## 8. Documented Change Log Entries\n\n`;
  if (proposal.changeLog.length === 0) {
    md += `*No discrete changes logged.*\n\n`;
  } else {
    proposal.changeLog.forEach((entry) => {
      md += `- **${entry.date}:** ${entry.changeSummary}\n`;
      if (entry.rationale) md += `  - Rationale: ${entry.rationale}\n`;
      if (entry.impact) md += `  - Impact: ${entry.impact}\n`;
      md += `\n`;
    });
  }

  // Section 9: Governance Event Audit Trail
  md += `## 9. Governance Event History & Audit Trail\n\n`;
  if (!proposal.events || proposal.events.length === 0) {
    md += `*No governance events logged.*\n\n`;
  } else {
    proposal.events.forEach((ev) => {
      md += `- **${new Date(ev.timestamp).toLocaleDateString()} [${ev.eventType.toUpperCase()}]:** ${ev.actor} - ${ev.description}\n`;
    });
    md += `\n`;
  }

  return md;
}
