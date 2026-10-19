// Parses a release issue (spec §2) and the sections of issue bodies. Pure; never throws.

export interface ReleaseBrief {
  version: string; major: number; minor: number; theme: string;
  dueDate: string | null; pitch: string | null; why: string; notIn: string[]; shippedOn: string | null;
}
export type ParseResult = { ok: true; brief: ReleaseBrief } | { ok: false; reasons: string[] };

// `u` so the 1–60 theme length counts characters, not UTF-16 code units.
const TITLE = /^v(\d+)\.(\d+)\.0 — (.{1,60})$/u;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// The version a title names (`vX.Y.0`, digits as written), or null when the title is malformed.
export function titleVersion(title: string): string | null {
  const m = TITLE.exec(text(title));
  return m ? `v${m[1]}.${m[2]}.0` : null;
}

export function section(body: string, name: string): string | null {
  const lines = text(body).replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.trimEnd() === `### ${name}`);
  if (start === -1) return null;
  const content: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('### ') || line === '---') break;
    content.push(line);
  }
  return content.join('\n').trim();
}

export function epicSummary(body: string): string | null {
  const summary = section(body, 'Summary');
  return summary === '' ? null : summary;
}

// True when `value` is YYYY-MM-DD and names a real calendar day (2026-02-31 does not).
function isCalendarDay(value: string): boolean {
  const m = DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

// An empty section means null; anything else must be a calendar day.
function dateField(value: string, label: string, reasons: string[]): string | null {
  if (value === '') return null;
  if (isCalendarDay(value)) return value;
  reasons.push(`${label} "${value}" is not a calendar day`);
  return null;
}

// `open`: while the issue is open, `Shipped on` is ignored, never a validation failure (source spec §1).
export function parseRelease(title: string, body: string, open: boolean): ParseResult {
  const reasons: string[] = [];
  const m = TITLE.exec(text(title));
  if (!m) reasons.push('title must be "vX.Y.0 — Theme"');

  const due = section(body, 'Due date');
  let dueDate: string | null = null;
  if (due === null) reasons.push('missing "### Due date"');
  else dueDate = dateField(due, 'due date', reasons);

  const why = section(body, 'Why this release');
  if (!why) reasons.push('missing "### Why this release"');

  const shipped = open ? null : section(body, 'Shipped on');
  const shippedOn = shipped === null ? null : dateField(shipped, 'shipped on', reasons);

  if (!m || reasons.length > 0) return { ok: false, reasons };

  const pitch = section(body, 'Pitch');
  const notIn = (section(body, 'Not in this release') ?? '')
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());

  return {
    ok: true,
    brief: {
      version: `v${m[1]}.${m[2]}.0`,
      major: Number(m[1]),
      minor: Number(m[2]),
      theme: m[3] ?? '',
      dueDate,
      pitch: pitch === '' ? null : pitch,
      why: why ?? '',
      notIn,
      shippedOn,
    },
  };
}
