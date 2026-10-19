import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { epicSummary, parseRelease, section, type ParseResult } from './parse.ts';

// A release fixture: line 1 is the issue title, line 2 is empty, the body follows (line endings kept).
function load(name: string): { title: string; body: string } {
  const raw = readFileSync(new URL(`../fixtures/releases/${name}`, import.meta.url), 'utf8');
  const head = /^(.*)\r?\n\r?\n/.exec(raw);
  if (!head) throw new Error(`fixture ${name} has no title line`);
  return { title: head[1] ?? '', body: raw.slice(head[0].length) };
}

function parseFixture(name: string): ParseResult {
  const { title, body } = load(name);
  return parseRelease(title, body);
}

describe('parseRelease on the live release bodies', () => {
  const live = [
    { n: 195, version: 'v2.0.0', theme: 'A new register, checkout and cash drawer', dueDate: null, shippedOn: null, notIn: 3 },
    { n: 225, version: 'v2.1.0', theme: 'Fiscal compliance', dueDate: '2026-12-31', shippedOn: null, notIn: 2 },
    { n: 452, version: 'v2.2.0', theme: 'Control what each cashier can do', dueDate: null, shippedOn: null, notIn: 3 },
    { n: 226, version: 'v2.3.0', theme: 'Works with your other plugins', dueDate: null, shippedOn: null, notIn: 1 },
    { n: 223, version: 'v1.10.0', theme: 'Offline & stock-state correctness', dueDate: '2026-08-25', shippedOn: '2026-08-25', notIn: 1 },
    { n: 224, version: 'v1.9.0', theme: 'Receipts & printing', dueDate: '2026-05-15', shippedOn: '2026-05-15', notIn: 0 },
  ];
  it.each(live)('live-$n.md parses as $version', ({ n, version, theme, dueDate, shippedOn, notIn }) => {
    const result = parseFixture(`live-${n}.md`);
    if (!result.ok) throw new Error(result.reasons.join('; '));
    const { brief } = result;
    expect({ version: brief.version, theme: brief.theme, dueDate: brief.dueDate, shippedOn: brief.shippedOn })
      .toEqual({ version, theme, dueDate, shippedOn });
    expect(brief.notIn).toHaveLength(notIn);
    expect(brief.pitch).not.toBeNull();
    expect(brief.why.length).toBeGreaterThan(0);
  });

  it('reads major and minor as numbers', () => {
    const result = parseFixture('live-223.md');
    expect(result.ok && [result.brief.major, result.brief.minor]).toEqual([1, 10]);
  });
});

describe('parseRelease on synthetic bodies', () => {
  it('rejects a hyphen in place of the em dash', () => {
    expect(parseFixture('bad-title-hyphen.md')).toEqual({ ok: false, reasons: ['title must be "vX.Y.0 — Theme"'] });
  });

  it('rejects a theme over 60 characters', () => {
    const { title } = load('bad-title-long.md');
    expect([...title.slice('v2.4.0 — '.length)]).toHaveLength(61);
    expect(parseFixture('bad-title-long.md')).toEqual({ ok: false, reasons: ['title must be "vX.Y.0 — Theme"'] });
  });

  it('accepts a theme of exactly 60 characters', () => {
    const theme = 'Sixty characters is exactly as long as a theme may ever be!!';
    expect(theme).toHaveLength(60);
    const result = parseRelease(`v2.4.0 — ${theme}`, '### Due date\n\n### Why this release\n\nBecause.');
    expect(result.ok && result.brief.theme).toBe(theme);
  });

  it('rejects 2026-02-31 as not a calendar day', () => {
    expect(parseFixture('bad-date.md')).toEqual({ ok: false, reasons: ['due date "2026-02-31" is not a calendar day'] });
  });

  it('rejects a due date that is not YYYY-MM-DD', () => {
    const result = parseRelease('v2.4.0 — Theme', '### Due date\n30/11/2026\n### Why this release\nBecause.');
    expect(result).toEqual({ ok: false, reasons: ['due date "30/11/2026" is not a calendar day'] });
  });

  it('accepts 29 February in a leap year only', () => {
    const body = (date: string) => `### Due date\n${date}\n### Why this release\nBecause.`;
    expect(parseRelease('v2.4.0 — Theme', body('2028-02-29')).ok).toBe(true);
    expect(parseRelease('v2.4.0 — Theme', body('2026-02-29')).ok).toBe(false);
  });

  it('requires the Due date section', () => {
    expect(parseFixture('missing-due.md')).toEqual({ ok: false, reasons: ['missing "### Due date"'] });
  });

  it('requires a non-empty Why this release', () => {
    expect(parseFixture('empty-why.md')).toEqual({ ok: false, reasons: ['missing "### Why this release"'] });
  });

  it('collects every reason', () => {
    expect(parseRelease('2.4.0 — Theme', '### Shipped on\n2026-13-01')).toEqual({
      ok: false,
      reasons: [
        'title must be "vX.Y.0 — Theme"',
        'missing "### Due date"',
        'missing "### Why this release"',
        'shipped on "2026-13-01" is not a calendar day',
      ],
    });
  });

  it('parses a dateless release', () => {
    expect(parseFixture('dateless.md')).toEqual({
      ok: true,
      brief: {
        version: 'v2.5.0', major: 2, minor: 5, theme: 'No date yet', dueDate: null, pitch: null,
        why: 'Planned, but nobody has picked a date.', notIn: [], shippedOn: null,
      },
    });
  });

  it('parses a CRLF body exactly as its LF twin', () => {
    expect(load('crlf.md').body).toContain('\r\n');
    expect(parseFixture('crlf.md')).toEqual({
      ok: true,
      brief: {
        version: 'v2.6.0', major: 2, minor: 6, theme: 'Written on Windows', dueDate: '2026-11-30',
        pitch: 'Line endings are CRLF throughout.',
        why: 'Bodies edited in some browsers arrive with CRLF line endings.\nThe parser normalises them before it reads a section.',
        notIn: ['Mixed line endings.', 'Old Mac CR-only endings.'],
        shippedOn: null,
      },
    });
  });

  it('ends a section at a --- line', () => {
    const result = parseFixture('section-hr.md');
    if (!result.ok) throw new Error(result.reasons.join('; '));
    expect(result.brief.notIn).toEqual(['First deferral.', 'Second deferral.']);
    expect(result.brief.shippedOn).toBeNull();
  });

  it('never throws on malformed input', () => {
    const bad = parseRelease(undefined as unknown as string, null as unknown as string);
    expect(bad.ok).toBe(false);
  });
});

describe('section', () => {
  it('distinguishes absent from empty', () => {
    expect(section('### Pitch\n\n### Why this release\nBecause.', 'Pitch')).toBe('');
    expect(section('### Why this release\nBecause.', 'Pitch')).toBeNull();
  });

  it('ignores trailing whitespace on the heading but not a longer heading', () => {
    expect(section('### Pitch   \nOne line.', 'Pitch')).toBe('One line.');
    expect(section('### Pitches\nOne line.', 'Pitch')).toBeNull();
  });
});

describe('epicSummary', () => {
  it('reads a Summary ended by the next heading', () => {
    expect(epicSummary('### Summary\n\nCash at the till.\n\n### Next\n\nInternal notes.')).toBe('Cash at the till.');
  });

  it('reads a Summary ended by ---', () => {
    expect(epicSummary('### Summary\nCash at the till.\nTwo lines.\n---\nInternal notes.')).toBe('Cash at the till.\nTwo lines.');
  });

  it('maps an empty Summary to null', () => {
    expect(epicSummary('### Summary\n\n### Next\nNotes.')).toBeNull();
  });

  it('gives null when there is no Summary', () => {
    expect(epicSummary('### Problem\nSomething.')).toBeNull();
  });
});
