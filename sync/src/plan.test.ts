import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { IssueNode, Milestone, Snapshot } from './types.ts';
import { dueOnFor, milestoneDescription, plan } from './plan.ts';

const TREES = new URL('../fixtures/trees/', import.meta.url);

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(new URL(name, TREES), 'utf8'));
}

function node(fields: Partial<IssueNode>): IssueNode {
  return {
    repo: 'wcpos/roadmap', number: 1, title: '', body: '', state: 'OPEN', stateReason: null, closedAt: null,
    labels: [], milestone: null, subIssuesTotal: 0, subIssuesCompleted: 0, subIssues: [], ...fields,
  };
}

const BODY = '### Due date\n\n### Why this release\n\nBecause.';

// An open, undated release whose `count` direct children each lack only the `epic` label.
function releaseWithUnlabelledEpics(number: number, version: string, count: number): IssueNode {
  const subIssues = Array.from({ length: count }, (_, i) => node({
    repo: 'wcpos/monorepo', number: 1000 + i, title: `Epic ${i}`, body: '### Summary\n\nA feature.',
    milestone: version, subIssuesTotal: 1,
  }));
  return node({ number, title: `${version} — Big release`, body: BODY, labels: ['release'], subIssues, subIssuesTotal: count });
}

const invalidRelease = node({ number: 701, title: 'v3.1.0 - Hyphenated', body: BODY, labels: ['release'] });

describe('plan on the tree fixtures', () => {
  const names = readdirSync(TREES).filter((f) => f.endsWith('.json') && !f.endsWith('.expected.json')).sort();

  it('has eleven trees, each with an expected plan', () => {
    expect(names).toHaveLength(11);
  });

  it.each(names)('%s', (name) => {
    const snapshot = readJson(name) as Snapshot;
    const expected = readJson(name.replace(/\.json$/, '.expected.json'));
    expect(plan(snapshot, { bulk: false })).toEqual(expected);
  });
});

describe('bulk cap', () => {
  it('refuses more than 100 projection writes but keeps the validation comment', () => {
    // 5 milestone creates + 96 epic labels = 101 projection writes.
    const snapshot: Snapshot = { releases: [releaseWithUnlabelledEpics(700, 'v3.0.0', 96), invalidRelease], milestones: [] };
    expect(plan(snapshot, { bulk: false })).toEqual({
      writes: [{ kind: 'validation.comment', issue: 701, reasons: ['title must be "vX.Y.0 — Theme"'] }],
      items: [
        { id: 'bulk-cap', lane: 'assistant', kind: 'bulk-cap', subject: 'wcpos/roadmap', text: '101 writes exceed the cap of 100; run with bulk' },
        { id: 'invalid:701', lane: 'assistant', kind: 'release-invalid', subject: 'wcpos/roadmap#701', text: 'title must be "vX.Y.0 — Theme"' },
      ],
      refused: true,
    });

    const bulk = plan(snapshot, { bulk: true });
    expect(bulk.refused).toBe(false);
    expect(bulk.writes).toHaveLength(102);
    expect(bulk.writes.filter((w) => w.kind === 'milestone.create')).toHaveLength(5);
    expect(bulk.writes.filter((w) => w.kind === 'issue.label')).toHaveLength(96);
    expect(bulk.items.map((i) => i.id)).toEqual(['invalid:701']);
  });

  it('applies exactly 100 projection writes without bulk', () => {
    // 5 milestone creates + 95 epic labels = 100 projection writes.
    const snapshot: Snapshot = { releases: [releaseWithUnlabelledEpics(700, 'v3.0.0', 95), invalidRelease], milestones: [] };
    const result = plan(snapshot, { bulk: false });
    expect(result.refused).toBe(false);
    expect(result.writes).toHaveLength(101);
    expect(result.items.map((i) => i.id)).toEqual(['invalid:701']);
  });
});

describe('plan edge cases', () => {
  it('reports more than 100 direct children and carries on with them', () => {
    const snapshot: Snapshot = { releases: [releaseWithUnlabelledEpics(700, 'v3.0.0', 101)], milestones: [] };
    const result = plan(snapshot, { bulk: true });
    expect(result.items).toEqual([{
      id: 'too-many-subissues:700', lane: 'assistant', kind: 'too-many-subissues',
      subject: 'wcpos/roadmap#700', text: 'more than 100 sub-issues; split this release',
    }]);
    expect(result.writes.filter((w) => w.kind === 'issue.label')).toHaveLength(101);
  });

  it('reports a release whose total is over 100 when the read stopped at 100', () => {
    const release = { ...releaseWithUnlabelledEpics(700, 'v3.0.0', 100), subIssuesTotal: 101 };
    expect(plan({ releases: [release], milestones: [] }, { bulk: true }).items.map((i) => i.id))
      .toEqual(['too-many-subissues:700']);
  });

  it('ignores a bad Shipped on while the release is open', () => {
    const open = node({ number: 702, title: 'v3.2.0 — Theme', body: `${BODY}\n\n### Shipped on\n\n2026-02-31`, labels: ['release'] });
    const result = plan({ releases: [open], milestones: [] }, { bulk: false });
    expect(result.writes.map((w) => w.kind)).toEqual(Array(5).fill('milestone.create'));
    expect(result.items).toEqual([]);
  });

  it('does not let withdrawn release #19 delete the copy managed from #195', () => {
    const copy = (repo: Milestone['repo'], number: number, issue: number): Milestone => ({
      repo, number, title: 'v2.6.0', description: milestoneDescription('Theme', issue), dueOn: null, state: 'open',
    });
    const withdrawn = node({
      number: 19, title: 'v2.6.0 — Theme', body: BODY, labels: ['release'],
      state: 'CLOSED', stateReason: 'NOT_PLANNED', closedAt: '2026-10-01T00:00:00Z',
    });
    const result = plan({ releases: [withdrawn], milestones: [copy('monorepo', 1, 195), copy('electron', 2, 19)] }, { bulk: false });
    expect(result.writes).toEqual([{ kind: 'milestone.delete', repo: 'electron', number: 2, title: 'v2.6.0' }]);
    expect(result.items.map((i) => i.id)).toEqual(['unmanaged-copy:monorepo:v2.6.0']);
  });

  it('writes nothing twice when the reader returns a release twice', () => {
    const release = releaseWithUnlabelledEpics(700, 'v3.0.0', 2);
    const once = plan({ releases: [release], milestones: [] }, { bulk: false });
    expect(plan({ releases: [release, release], milestones: [] }, { bulk: false })).toEqual(once);
    expect(once.writes).toHaveLength(7);
  });

  it('ignores issues without the release label', () => {
    const notRelease = node({ number: 5, title: 'v3.0.0 — Theme', body: BODY, labels: ['epic'] });
    expect(plan({ releases: [notRelease], milestones: [] }, { bulk: false })).toEqual({ writes: [], items: [], refused: false });
  });

  it('turns a malformed release into a validation comment instead of throwing', () => {
    const broken = { ...node({ number: 9, labels: ['release'] }), title: null, body: undefined } as unknown as IssueNode;
    const result = plan({ releases: [broken], milestones: [] }, { bulk: false });
    expect(result.writes).toEqual([{
      kind: 'validation.comment', issue: 9,
      reasons: ['title must be "vX.Y.0 — Theme"', 'missing "### Due date"', 'missing "### Why this release"'],
    }]);
  });
});

describe('helpers', () => {
  it('formats the managed milestone description', () => {
    expect(milestoneDescription('Fiscal compliance', 225)).toBe('Fiscal compliance\n\nManaged from wcpos/roadmap#225 — do not edit.');
  });

  it('pins a due date to midday UTC', () => {
    expect(dueOnFor('2026-12-31')).toBe('2026-12-31T12:00:00Z');
    expect(dueOnFor(null)).toBeNull();
  });
});
