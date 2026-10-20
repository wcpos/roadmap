import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { IssueNode, Item, Snapshot, Write } from './types.ts';
import { plan } from './plan.ts';
import { DIGEST_MARKER, describeWrite, previousSince, renderDigest, type DigestInput } from './digest.ts';

const DIGEST = new URL('../fixtures/digest/', import.meta.url);

function basicInput(): DigestInput {
  const raw = JSON.parse(readFileSync(new URL('basic.snapshot.json', DIGEST), 'utf8')) as Omit<DigestInput, 'plan'>;
  return { ...raw, plan: plan(raw.snapshot, { bulk: false }) };
}

function node(fields: Partial<IssueNode>): IssueNode {
  return {
    repo: 'wcpos/roadmap', number: 1, title: '', body: '', state: 'OPEN', stateReason: null, closedAt: null,
    labels: [], milestone: null, subIssuesTotal: 0, subIssuesCompleted: 0, subIssues: [], ...fields,
  };
}

function inputFor(snapshot: Snapshot, extra: Partial<DigestInput> = {}): DigestInput {
  return {
    snapshot, plan: plan(snapshot, { bulk: false }), unattachedEpics: { count: 0, url: 'https://example.test/q' },
    extraItems: [], previousBody: null, generatedAt: '2026-10-20T06:00:00.000Z', runUrl: 'local', dryRun: true, bulk: false,
    ...extra,
  };
}

function jsonBlock(body: string): unknown {
  const lines = body.split('\n');
  const open = lines.indexOf('```json');
  const close = lines.indexOf('```', open + 1);
  return JSON.parse(lines.slice(open + 1, close).join('\n'));
}

function logLines(body: string): string[] {
  const lines = body.split('\n');
  const start = lines.indexOf('### log') + 1;
  const end = lines.indexOf('', start);
  return lines.slice(start, end);
}

describe('renderDigest', () => {
  it('renders the basic fixture byte for byte', () => {
    const expected = readFileSync(new URL('basic.expected.md', DIGEST), 'utf8');
    expect(renderDigest(basicInput())).toBe(expected);
  });

  it('truncates the log lane from the end and says how many lines it dropped', () => {
    const input = basicInput();
    const full = renderDigest(input);
    const log = logLines(full);
    expect(log).toHaveLength(17);
    const withoutLog = full.length - log.reduce((n, line) => n + line.length + 1, 0);
    const moreLine = '- … 15 more; the full list is in the run summary';
    // Room for exactly the first two log lines plus the `… 15 more` line.
    const maxLength = withoutLog + (log[0]!.length + 1) + (log[1]!.length + 1) + (moreLine.length + 1);
    const body = renderDigest(input, maxLength);
    expect(body.length).toBeLessThanOrEqual(maxLength);
    expect(logLines(body)).toEqual([log[0], log[1], moreLine]);
    expect(body).toContain('```json\n');
    expect(jsonBlock(body)).toEqual(jsonBlock(full));
    expect(body.slice(0, body.indexOf('### log'))).toBe(full.slice(0, full.indexOf('### log')));
  });

  it.each([false, true])('rejects a cap smaller than the no-log body (no writes: %s)', (noWrites) => {
    const input = basicInput();
    if (noWrites) input.plan.writes = [];
    const full = renderDigest(input);
    const withoutLog = full.length - logLines(full).reduce((n, line) => n + line.length + 1, 0);
    expect(() => renderDigest(input, withoutLog - 1)).toThrow(/over the \d+ cap/);
  });

  it('writes a json block that parses, with the top-level keys in order', () => {
    const json = jsonBlock(renderDigest(basicInput())) as Record<string, unknown>;
    expect(Object.keys(json)).toEqual(['generatedAt', 'runUrl', 'dryRun', 'bulk', 'refused', 'state', 'items', 'writes']);
    expect(Object.keys(json.state as object)).toEqual(['releases', 'unattachedEpics', 'latestShipped']);
  });

  it('gives a release with no visible epics null progress and 0 of 0 features', () => {
    const release = node({
      number: 300, title: 'v4.0.0 — Quiet', body: '### Due date\n\n### Why this release\n\nBecause.', labels: ['release'],
      subIssuesTotal: 1, subIssues: [node({ number: 301, title: 'No summary', labels: ['epic'], milestone: 'v4.0.0', subIssuesTotal: 1 })],
    });
    const body = renderDigest(inputFor({ releases: [release], milestones: [] }));
    expect(body).toContain('### v4.0.0 — Quiet\nnow · due none · 0 of 0 features\n- planned · wcpos/roadmap#301 No summary · 0/1 · hidden\n\n');
    const json = jsonBlock(body) as { state: { releases: { progress: unknown }[] } };
    expect(json.state.releases[0]!.progress).toBeNull();
  });

  it('says so when there is no open release, and none in empty lanes', () => {
    const body = renderDigest(inputFor({ releases: [], milestones: [] }));
    expect(body).toContain('## State\n\nNo open releases.\n\nUnattached open epics: 0 (https://example.test/q)\nLatest shipped: none\n\n');
    expect(body).toContain('### paul\n- none\n\n### assistant\n- none\n\n### log\n- none\n\n```json\n');
  });
});

describe('describeWrite', () => {
  const cases: [Write, string][] = [
    [{ kind: 'validation.comment', issue: 7, reasons: ['a', 'b'] }, 'comment on wcpos/roadmap#7: a; b'],
    [{ kind: 'milestone.create', repo: 'monorepo', title: 'v2.0.0', description: 'x', dueOn: '2026-12-31T12:00:00Z' },
      'create milestone v2.0.0 in monorepo (due 2026-12-31)'],
    [{ kind: 'milestone.update', repo: 'electron', number: 5, title: 'v2.0.0',
      patch: { title: 'v2.0.0', description: 'x', dueOn: '2026-11-30T12:00:00Z', state: 'open' } },
    'update milestone v2.0.0 (#5) in electron: title → v2.0.0, description, dueOn → 2026-11-30, state → open'],
    [{ kind: 'milestone.update', repo: 'roadmap', number: 6, title: 'v2.1.0', patch: { dueOn: null } },
      'update milestone v2.1.0 (#6) in roadmap: dueOn → none'],
    [{ kind: 'milestone.delete', repo: 'woocommerce-pos', number: 8, title: 'v3.0.0' }, 'delete milestone v3.0.0 (#8) in woocommerce-pos'],
    [{ kind: 'issue.label', repo: 'wcpos/monorepo', issue: 9, label: 'epic' }, 'label wcpos/monorepo#9 epic'],
    [{ kind: 'subissue.remove', parent: 200, repo: 'wcpos/electron', issue: 10 }, 'detach wcpos/electron#10 from wcpos/roadmap#200'],
    [{ kind: 'issue.milestone', repo: 'wcpos/monorepo', issue: 11, from: null, to: 'v2.0.0' }, 'move wcpos/monorepo#11 milestone none → v2.0.0'],
    [{ kind: 'issue.milestone', repo: 'wcpos/monorepo', issue: 12, from: 'v2.0.0', to: null }, 'move wcpos/monorepo#12 milestone v2.0.0 → none'],
  ];
  it.each(cases)('%j', (write, text) => {
    expect(describeWrite(write)).toBe(text);
  });
});

describe('previousSince', () => {
  it('is empty for a null body', () => {
    expect(previousSince(null).size).toBe(0);
  });

  it('is empty without the marker', () => {
    expect(previousSince('```json\n{"items":[{"id":"a","since":"s"}]}\n```\n').size).toBe(0);
  });

  it('is empty for invalid json', () => {
    expect(previousSince(`${DIGEST_MARKER}\n\n\`\`\`json\n{"items": [\n\`\`\`\n`).size).toBe(0);
  });

  it('maps id to since for entries that carry both strings', () => {
    const body = `${DIGEST_MARKER}\n## State\n\n\`\`\`json\n${JSON.stringify({
      items: [{ id: 'a', since: '2026-10-01' }, { id: 'b' }, { since: 'x' }, { id: 'c', since: 3 }, { id: 'd', since: '2026-10-02' }],
    }, null, 2)}\n\`\`\`\n\nLast run: x (local)\n`;
    expect([...previousSince(body)]).toEqual([['a', '2026-10-01'], ['d', '2026-10-02']]);
  });

  it('keeps since across a rendered digest', () => {
    const extra: Item = { id: 'read-warning:0', lane: 'assistant', kind: 'read-warning', subject: 'wcpos/roadmap', text: 'ERROR: x' };
    const first = renderDigest(inputFor({ releases: [], milestones: [] }, { extraItems: [extra], generatedAt: '2026-10-01T00:00:00.000Z' }));
    const second = renderDigest(inputFor({ releases: [], milestones: [] }, { extraItems: [extra], previousBody: first }));
    expect(previousSince(second).get('read-warning:0')).toBe('2026-10-01T00:00:00.000Z');
  });
});
