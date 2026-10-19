// Derived states: epics (spec §3) and releases (spec §2). Pure.
import type { IssueNode } from './types.ts';
import type { ReleaseBrief } from './parse.ts';

export type ReleaseState = 'active' | 'planning' | 'later' | 'shipped' | 'withdrawn';
export type EpicState = 'done' | 'withdrawn' | 'in_progress' | 'planned';

// Closed as not planned or duplicate: a withdrawn epic or release.
export function isWithdrawn(n: IssueNode): boolean {
  return n.state === 'CLOSED' && (n.stateReason === 'NOT_PLANNED' || n.stateReason === 'DUPLICATE');
}

export function epicState(n: IssueNode): EpicState {
  if (n.state === 'CLOSED') return isWithdrawn(n) ? 'withdrawn' : 'done';
  return n.subIssuesCompleted > 0 ? 'in_progress' : 'planned';
}

function versionParts(v: string): number[] {
  return v.replace(/^v/, '').split('.').map((part) => Number(part) || 0);
}

// Numeric compare of 'vX.Y.Z' strings: 'v2.10.0' > 'v2.9.0'.
export function compareVersions(a: string, b: string): number {
  const pa = versionParts(a);
  const pb = versionParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

export function releaseStates(valid: { issue: IssueNode; brief: ReleaseBrief }[]): Map<number, ReleaseState> {
  const states = new Map<number, ReleaseState>();
  const open = valid.filter((r) => r.issue.state === 'OPEN');
  const lowest = [...open].sort((a, b) => compareVersions(a.brief.version, b.brief.version))[0];
  for (const { issue, brief } of valid) {
    if (issue.state === 'CLOSED') states.set(issue.number, isWithdrawn(issue) ? 'withdrawn' : 'shipped');
    else if (issue === lowest?.issue) states.set(issue.number, 'active');
    else states.set(issue.number, brief.dueDate ? 'planning' : 'later');
  }
  return states;
}
