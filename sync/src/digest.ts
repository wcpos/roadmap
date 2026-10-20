// Renders the digest issue body (spec §6): State, Attention (lanes), a fenced json block and `Last run`. Pure.
import type { IssueNode, Item, Plan, Snapshot, Write } from './types.ts';
import { epicSummary, parseRelease, type ReleaseBrief } from './parse.ts';
import { compareVersions, epicState, releaseStates, type EpicState } from './state.ts';

export const DIGEST_MARKER = '<!-- roadmap-sync:digest -->';
export const DIGEST_TITLE = 'Roadmap sync digest';
export const DIGEST_LABEL = 'roadmap-digest';
export const DIGEST_MAX = 60000;   // GitHub caps an issue body at 65536 characters

export interface DigestItem extends Item { since: string }
export interface DigestInput {
  snapshot: Snapshot;
  plan: Plan;
  unattachedEpics: { count: number; url: string };
  extraItems: Item[];          // read warnings, already shaped as items
  previousBody: string | null; // the digest issue's current body, for `since`
  generatedAt: string;         // ISO
  runUrl: string;
  dryRun: boolean;
  bulk: boolean;
}

// Job 1's write order (plan.ts), for the `writes` counts.
const KIND_ORDER: Write['kind'][] = [
  'validation.comment', 'milestone.create', 'milestone.update', 'milestone.delete',
  'issue.label', 'subissue.remove', 'issue.milestone',
];
const GROUP = { active: 'now', planning: 'next', later: 'later' } as const;

function date(dueOn: string | null): string {
  return dueOn === null ? 'none' : dueOn.slice(0, 10);
}

export function describeWrite(w: Write): string {
  switch (w.kind) {
    case 'validation.comment':
      return `comment on wcpos/roadmap#${w.issue}: ${w.reasons.join('; ')}`;
    case 'milestone.create':
      return `create milestone ${w.title} in ${w.repo} (due ${date(w.dueOn)})`;
    case 'milestone.update': {
      const parts: string[] = [];
      if ('title' in w.patch) parts.push(`title → ${w.patch.title}`);
      if ('description' in w.patch) parts.push('description');
      if ('dueOn' in w.patch) parts.push(`dueOn → ${date(w.patch.dueOn ?? null)}`);
      if ('state' in w.patch) parts.push(`state → ${w.patch.state}`);
      return `update milestone ${w.title} (#${w.number}) in ${w.repo}: ${parts.join(', ')}`;
    }
    case 'milestone.delete':
      return `delete milestone ${w.title} (#${w.number}) in ${w.repo}`;
    case 'issue.label':
      return `label ${w.repo}#${w.issue} epic`;
    case 'subissue.remove':
      return `detach ${w.repo}#${w.issue} from wcpos/roadmap#${w.parent}`;
    case 'issue.milestone':
      return `move ${w.repo}#${w.issue} milestone ${w.from ?? 'none'} → ${w.to ?? 'none'}`;
  }
}

// id → since from the json block of a previous digest body. Never throws.
export function previousSince(body: string | null): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof body !== 'string') return out;
  const at = body.indexOf(DIGEST_MARKER);
  if (at === -1) return out;
  const lines = body.slice(at + DIGEST_MARKER.length).split(/\r?\n/);
  const open = lines.indexOf('```json');
  if (open === -1) return out;
  const close = lines.indexOf('```', open + 1);
  if (close === -1) return out;
  try {
    const parsed: unknown = JSON.parse(lines.slice(open + 1, close).join('\n'));
    const items = (parsed as { items?: unknown } | null)?.items;
    if (!Array.isArray(items)) return out;
    for (const item of items) {
      const { id, since } = (item ?? {}) as { id?: unknown; since?: unknown };
      if (typeof id === 'string' && typeof since === 'string') out.set(id, since);
    }
  } catch {
    // Invalid JSON: no previous `since` values.
  }
  return out;
}

interface Progress { completed: number; total: number }
interface EpicView {
  repo: string; number: number; title: string; state: EpicState; visible: boolean; progress: Progress | null; url: string;
}
interface ReleaseView {
  number: number; version: string; theme: string; group: 'now' | 'next' | 'later'; dueOn: string | null;
  url: string; progress: { done: number; total: number } | null; epics: EpicView[];
}

function url(repo: string, number: number): string {
  return `https://github.com/${repo}/issues/${number}`;
}

function stateView(snapshot: Snapshot, plan: Plan): { releases: ReleaseView[]; latestShipped: string | null } {
  // Valid: parses, and plan() raised no `release-invalid` item for it (duplicates, both labels).
  const invalid = new Set(plan.items.filter((i) => i.kind === 'release-invalid').map((i) => i.id));
  const valid: { issue: IssueNode; brief: ReleaseBrief }[] = [];
  for (const issue of snapshot.releases) {
    const parsed = parseRelease(issue.title, issue.body, issue.state === 'OPEN');
    if (parsed.ok && !invalid.has(`invalid:${issue.number}`)) valid.push({ issue, brief: parsed.brief });
  }
  const states = releaseStates(valid);

  let latestShipped: string | null = null;
  for (const { issue, brief } of valid) {
    if (states.get(issue.number) !== 'shipped') continue;
    if (latestShipped === null || compareVersions(brief.version, latestShipped) > 0) latestShipped = brief.version;
  }

  const releases: ReleaseView[] = [];
  for (const { issue, brief } of valid) {
    const state = states.get(issue.number);
    if (state !== 'active' && state !== 'planning' && state !== 'later') continue;
    const epics: EpicView[] = issue.subIssues
      .filter((c) => epicState(c) !== 'withdrawn' && !c.labels.includes('release'))
      .map((c) => ({
        repo: c.repo, number: c.number, title: c.title, state: epicState(c), visible: epicSummary(c.body) !== null,
        progress: c.subIssuesTotal > 0 ? { completed: c.subIssuesCompleted, total: c.subIssuesTotal } : null,
        url: url(c.repo, c.number),
      }));
    const visible = epics.filter((e) => e.visible);
    releases.push({
      number: issue.number, version: brief.version, theme: brief.theme, group: GROUP[state], dueOn: brief.dueDate,
      url: url(issue.repo, issue.number),
      progress: visible.length > 0 ? { done: visible.filter((e) => e.state === 'done').length, total: visible.length } : null,
      epics,
    });
  }
  releases.sort((a, b) => compareVersions(a.version, b.version));
  return { releases, latestShipped };
}

function compareIds(a: DigestItem, b: DigestItem): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function renderDigest(input: DigestInput, maxLength: number = DIGEST_MAX): string {
  const since = previousSince(input.previousBody);
  const items: DigestItem[] = [...input.plan.items, ...input.extraItems]
    .map((i) => ({ id: i.id, lane: i.lane, kind: i.kind, subject: i.subject, text: i.text, since: since.get(i.id) ?? input.generatedAt }))
    .sort(compareIds);
  const { releases, latestShipped } = stateView(input.snapshot, input.plan);

  const writes: Partial<Record<Write['kind'], number>> = {};
  for (const kind of KIND_ORDER) {
    const n = input.plan.writes.filter((w) => w.kind === kind).length;
    if (n > 0) writes[kind] = n;
  }
  const json = {
    generatedAt: input.generatedAt, runUrl: input.runUrl, dryRun: input.dryRun, bulk: input.bulk,
    refused: input.plan.refused,
    state: { releases, unattachedEpics: { count: input.unattachedEpics.count, url: input.unattachedEpics.url }, latestShipped },
    items,
    writes,
  };

  const head: string[] = [DIGEST_MARKER, '## State', ''];
  for (const r of releases) {
    head.push(`### ${r.version} — ${r.theme}`);
    head.push(`${r.group} · due ${r.dueOn ?? 'none'} · ${r.progress?.done ?? 0} of ${r.progress?.total ?? 0} features`);
    for (const e of r.epics) {
      const progress = e.progress ? ` · ${e.progress.completed}/${e.progress.total}` : '';
      head.push(`- ${e.state} · ${e.repo}#${e.number} ${e.title}${progress}${e.visible ? '' : ' · hidden'}`);
    }
    head.push('');
  }
  if (releases.length === 0) head.push('No open releases.', '');
  head.push(`Unattached open epics: ${input.unattachedEpics.count} (${input.unattachedEpics.url})`);
  head.push(`Latest shipped: ${latestShipped ?? 'none'}`, '', '## Attention', '');
  for (const lane of ['paul', 'assistant'] as const) {
    const inLane = items.filter((i) => i.lane === lane);
    head.push(`### ${lane}`);
    head.push(...(inLane.length > 0 ? inLane.map((i) => `- \`${i.id}\` ${i.subject}: ${i.text}`) : ['- none']));
    head.push('');
  }
  head.push('### log');

  const prefix = input.dryRun ? '(dry run) would: ' : '';
  const log = input.plan.writes.map((w) => `- ${prefix}${describeWrite(w)}`);
  const tail = ['', '```json', JSON.stringify(json, null, 2), '```', '', `Last run: ${input.generatedAt} (${input.runUrl})`, ''];

  const render = (logLines: string[]) => [...head, ...logLines, ...tail].join('\n');
  if (log.length === 0) return render(['- none']);
  const full = render(log);
  if (full.length <= maxLength) return full;

  // Too long: drop log lines from the end; the `… N more` line counts toward the length.
  const fixed = full.length - log.reduce((sum, line) => sum + line.length + 1, 0);
  let kept = log.length;
  let used = log.reduce((sum, line) => sum + line.length + 1, 0);
  const more = (n: number) => `- … ${n} more; the full list is in the run summary`;
  while (kept > 0) {
    used -= (log[kept - 1] as string).length + 1;
    kept -= 1;
    if (fixed + used + more(log.length - kept).length + 1 <= maxLength) break;
  }
  return render([...log.slice(0, kept), more(log.length - kept)]);
}
