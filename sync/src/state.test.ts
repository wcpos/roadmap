import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { IssueNode } from './types.ts';
import { parseRelease, type ReleaseBrief } from './parse.ts';
import { compareVersions, epicState, releaseStates } from './state.ts';

function node(fields: Partial<IssueNode>): IssueNode {
  return {
    repo: 'wcpos/roadmap', number: 1, title: '', body: '', state: 'OPEN', stateReason: null, closedAt: null,
    labels: [], milestone: null, subIssuesTotal: 0, subIssuesCompleted: 0, subIssues: [], ...fields,
  };
}

function brief(version: string, dueDate: string | null): ReleaseBrief {
  const [major, minor] = version.slice(1).split('.').map(Number);
  return { version, major: major ?? 0, minor: minor ?? 0, theme: 'Theme', dueDate, pitch: null, why: 'Why.', notIn: [], shippedOn: null };
}

const CLOSED_AT = '2026-10-01T00:00:00Z';

describe('epicState', () => {
  it.each([
    ['closed COMPLETED', { state: 'CLOSED', stateReason: 'COMPLETED', closedAt: CLOSED_AT }, 'done'],
    ['closed with a null reason', { state: 'CLOSED', stateReason: null, closedAt: CLOSED_AT }, 'done'],
    ['closed NOT_PLANNED', { state: 'CLOSED', stateReason: 'NOT_PLANNED', closedAt: CLOSED_AT }, 'withdrawn'],
    ['closed DUPLICATE', { state: 'CLOSED', stateReason: 'DUPLICATE', closedAt: CLOSED_AT }, 'withdrawn'],
    ['open with completed work', { subIssuesTotal: 3, subIssuesCompleted: 1 }, 'in_progress'],
    ['open with no completed work', { subIssuesTotal: 3, subIssuesCompleted: 0 }, 'planned'],
    ['open with no sub-issues', { subIssuesTotal: 0, subIssuesCompleted: 0 }, 'planned'],
    ['reopened with completed work', { stateReason: 'REOPENED', subIssuesTotal: 2, subIssuesCompleted: 2 }, 'in_progress'],
  ] as [string, Partial<IssueNode>, string][])('%s is %s', (_name, fields, expected) => {
    expect(epicState(node(fields))).toBe(expected);
  });
});

describe('compareVersions', () => {
  it('compares numerically, not as strings', () => {
    expect(compareVersions('v2.10.0', 'v2.9.0')).toBeGreaterThan(0);
    expect(compareVersions('v2.9.0', 'v2.10.0')).toBeLessThan(0);
    expect(compareVersions('v10.0.0', 'v9.99.0')).toBeGreaterThan(0);
    expect(compareVersions('v2.1.0', 'v2.1.0')).toBe(0);
  });
});

describe('releaseStates', () => {
  it('makes v2.9.0 active over v2.10.0, and the active release may be undated', () => {
    const states = releaseStates([
      { issue: node({ number: 10 }), brief: brief('v2.10.0', '2026-12-31') },
      { issue: node({ number: 9 }), brief: brief('v2.9.0', null) },
      { issue: node({ number: 11 }), brief: brief('v2.11.0', null) },
    ]);
    expect(Object.fromEntries(states)).toEqual({ 9: 'active', 10: 'planning', 11: 'later' });
  });

  it('makes the lowest open version active even when it is dated', () => {
    const states = releaseStates([
      { issue: node({ number: 9 }), brief: brief('v2.9.0', '2026-11-30') },
      { issue: node({ number: 10 }), brief: brief('v2.10.0', '2026-12-31') },
    ]);
    expect(Object.fromEntries(states)).toEqual({ 9: 'active', 10: 'planning' });
  });

  it('derives shipped and withdrawn from the close reason and skips them for active', () => {
    const states = releaseStates([
      { issue: node({ number: 1, state: 'CLOSED', stateReason: 'COMPLETED', closedAt: CLOSED_AT }), brief: brief('v1.9.0', null) },
      { issue: node({ number: 2, state: 'CLOSED', stateReason: null, closedAt: CLOSED_AT }), brief: brief('v1.8.0', null) },
      { issue: node({ number: 3, state: 'CLOSED', stateReason: 'NOT_PLANNED', closedAt: CLOSED_AT }), brief: brief('v1.10.0', null) },
      { issue: node({ number: 4, state: 'CLOSED', stateReason: 'DUPLICATE', closedAt: CLOSED_AT }), brief: brief('v1.11.0', null) },
      { issue: node({ number: 5 }), brief: brief('v2.0.0', '2026-12-31') },
    ]);
    expect(Object.fromEntries(states)).toEqual({ 1: 'shipped', 2: 'shipped', 3: 'withdrawn', 4: 'withdrawn', 5: 'active' });
  });

  it('places the six live releases', () => {
    const live: [number, Partial<IssueNode>][] = [
      [195, {}], [225, {}], [452, {}], [226, {}],
      [223, { state: 'CLOSED', stateReason: 'COMPLETED', closedAt: CLOSED_AT }],
      [224, { state: 'CLOSED', stateReason: 'COMPLETED', closedAt: CLOSED_AT }],
    ];
    const valid = live.map(([n, fields]) => {
      const raw = readFileSync(new URL(`../fixtures/releases/live-${n}.md`, import.meta.url), 'utf8');
      const [title = '', ...rest] = raw.split('\n');
      const parsed = parseRelease(title, rest.slice(1).join('\n'), fields.state !== 'CLOSED');
      if (!parsed.ok) throw new Error(parsed.reasons.join('; '));
      return { issue: node({ number: n, title, ...fields }), brief: parsed.brief };
    });
    expect(Object.fromEntries(releaseStates(valid))).toEqual({
      195: 'active', 225: 'planning', 452: 'later', 226: 'later', 223: 'shipped', 224: 'shipped',
    });
  });
});
