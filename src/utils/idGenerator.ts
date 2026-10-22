import type { ChangeProposal } from '../types';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateProposalRef(existingProposals: ChangeProposal[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `CCP-${currentYear}-`;

  // Find highest existing sequence number for this year
  let maxSeq = 0;
  for (const p of existingProposals) {
    if (p.ref && p.ref.startsWith(prefix)) {
      const seqStr = p.ref.substring(prefix.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  }

  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  return `${prefix}${nextSeq}`;
}

export function generateVersionId(): string {
  return `ver_${generateUUID().slice(0, 8)}`;
}

export function generateChangeLogId(): string {
  return `chg_${generateUUID().slice(0, 8)}`;
}
