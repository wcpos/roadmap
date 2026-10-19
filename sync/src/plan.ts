// The reconcile core: snapshot in, exact GitHub write list and digest items out (spec §2–§5).
// Pure: no network, no I/O, never throws on malformed releases (they become invalid instead).
import {
  BULK_CAP, MILESTONE_REPOS, OWNER, ROADMAP_REPO,
  type IssueNode, type Item, type Milestone, type Plan, type Snapshot, type Write,
} from './types.ts';
import { epicSummary, parseRelease, titleVersion, type ReleaseBrief } from './parse.ts';
import { epicState, isWithdrawn, releaseStates, type ReleaseState } from './state.ts';

// A patch-line milestone title (`v1.11.2`); never a release version.
const PATCH = /^v\d+\.\d+\.[1-9]\d*$/;
// GitHub returns at most this many sub-issues per read (spec §4.2 `subIssues(first:100)`).
const SUBISSUE_READ_CAP = 100;
// Write order in a plan, so tests can compare exactly.
const KIND_ORDER: Write['kind'][] = [
  'validation.comment', 'milestone.create', 'milestone.update', 'milestone.delete',
  'issue.label', 'subissue.remove', 'issue.milestone',
];

export function milestoneDescription(theme: string, issue: number): string {
  return `${theme}\n\nManaged from ${ROADMAP_REPO}#${issue} — do not edit.`;
}

export function dueOnFor(date: string | null): string | null {
  return date === null ? null : `${date}T12:00:00Z`;
}

interface Release { issue: IssueNode; brief: ReleaseBrief; state: ReleaseState }

function has(n: IssueNode, label: string): boolean {
  return Array.isArray(n.labels) && n.labels.includes(label);
}

function children(n: IssueNode): IssueNode[] {
  return Array.isArray(n.subIssues) ? n.subIssues : [];
}

function isOpenState(state: ReleaseState): boolean {
  return state === 'active' || state === 'planning' || state === 'later';
}

// §1: every `release` issue either validates or gets one comment and one item, and nothing else.
// Withdrawn releases are left out of the duplicate check, so a version can be re-filed (Amendment 2).
function validate(releases: IssueNode[], writes: Write[], items: Item[]): { issue: IssueNode; brief: ReleaseBrief }[] {
  const byVersion = new Map<string, number[]>();
  for (const r of releases) {
    const version = titleVersion(r.title);
    if (version && !isWithdrawn(r)) byVersion.set(version, [...(byVersion.get(version) ?? []), r.number]);
  }
  const valid: { issue: IssueNode; brief: ReleaseBrief }[] = [];
  for (const r of releases) {
    const parsed = parseRelease(r.title, r.body, r.state === 'OPEN');
    const reasons = parsed.ok ? [] : [...parsed.reasons];
    if (has(r, 'epic')) reasons.push('an issue cannot be both release and epic');
    const version = titleVersion(r.title);
    const others = version && !isWithdrawn(r)
      ? (byVersion.get(version) ?? []).filter((n) => n !== r.number).sort((a, b) => a - b) : [];
    if (others.length > 0) reasons.push(`version ${version} is also ${others.map((n) => `#${n}`).join(', ')}`);
    if (parsed.ok && reasons.length === 0) {
      valid.push({ issue: r, brief: parsed.brief });
      continue;
    }
    writes.push({ kind: 'validation.comment', issue: r.number, reasons });
    items.push({
      id: `invalid:${r.number}`, lane: 'assistant', kind: 'release-invalid',
      subject: `${ROADMAP_REPO}#${r.number}`, text: reasons.join('; '),
    });
  }
  return valid;
}

// §2: the five milestone copies of one release. Each copy found is added to `copies` as `repo#number`.
function planCopies(r: Release, milestones: Milestone[], copies: Set<string>, writes: Write[], items: Item[]): void {
  const v = r.brief.version;
  const description = milestoneDescription(r.brief.theme, r.issue.number);
  // `(?!\d)` so release #19 does not claim the copy managed from #195.
  const managed = new RegExp(`Managed from ${ROADMAP_REPO}#${r.issue.number}(?!\\d)`);
  for (const repo of MILESTONE_REPOS) {
    // The copy is titled V; failing that, it is a hand-renamed one still carrying our marker (Amendment 3).
    const copy = milestones.find((m) => m.repo === repo && m.title === v)
      ?? milestones.filter((m) => m.repo === repo && managed.test(m.description ?? '')).sort((a, b) => a.number - b.number)[0];
    if (copy) copies.add(`${repo}#${copy.number}`);
    if (r.state === 'shipped') {
      if (copy?.state === 'open') {
        writes.push({ kind: 'milestone.update', repo, number: copy.number, title: v, patch: { state: 'closed' } });
      }
    } else if (r.state === 'withdrawn') {
      if (!copy) continue;
      if (managed.test(copy.description ?? '')) {
        writes.push({ kind: 'milestone.delete', repo, number: copy.number, title: v });
      } else {
        items.push({
          id: `unmanaged-copy:${repo}:${v}`, lane: 'assistant', kind: 'unmanaged-copy',
          subject: `${repo} milestone ${v}`, text: 'withdrawn release; copy not created by the sync, left in place',
        });
      }
    } else if (!copy) {
      writes.push({ kind: 'milestone.create', repo, title: v, description, dueOn: dueOnFor(r.brief.dueDate) });
    } else {
      const patch: { title?: string; description?: string; dueOn?: string | null; state?: 'open' | 'closed' } = {};
      if (copy.title !== v) patch.title = v;
      if ((copy.description ?? '') !== description) patch.description = description;
      if ((copy.dueOn === null ? null : copy.dueOn.slice(0, 10)) !== r.brief.dueDate) patch.dueOn = dueOnFor(r.brief.dueDate);
      if (copy.state === 'closed') patch.state = 'open';
      if (Object.keys(patch).length > 0) writes.push({ kind: 'milestone.update', repo, number: copy.number, title: v, patch });
    }
  }
}

// §3: the direct children (epics) of one release.
function planEpics(r: Release, writes: Write[], items: Item[]): void {
  const v = r.brief.version;
  const kids = children(r.issue);
  const subject = `${ROADMAP_REPO}#${r.issue.number}`;
  // A real read stops at 100 children, so the total is what shows the overflow.
  if (Math.max(kids.length, r.issue.subIssuesTotal) > SUBISSUE_READ_CAP) {
    items.push({
      id: `too-many-subissues:${r.issue.number}`, lane: 'assistant', kind: 'too-many-subissues',
      subject, text: 'more than 100 sub-issues; split this release',
    });
  }
  for (const child of kids) {
    const ref = `${child.repo}#${child.number}`;
    if (has(child, 'release')) {
      items.push({
        id: `release-under-release:${ref}`, lane: 'assistant', kind: 'release-under-release',
        subject: ref, text: `a release issue is a sub-issue of ${v}`,
      });
      continue;
    }
    const withdrawn = epicState(child) === 'withdrawn';
    const open = child.state === 'OPEN';
    // Close-out: when a release closes (shipped or withdrawn), its open epics detach (spec §2, Amendment 2).
    const leftover = open && (r.state === 'shipped' || r.state === 'withdrawn');
    // Leftovers keep the label: the unattached open-epic pool is found by it (Amendment 3).
    if (!withdrawn && !has(child, 'epic')) {
      writes.push({ kind: 'issue.label', repo: child.repo, issue: child.number, label: 'epic' });
    }
    if (withdrawn || leftover) {
      writes.push({ kind: 'subissue.remove', parent: r.issue.number, repo: child.repo, issue: child.number });
      if (child.milestone === v) {
        writes.push({ kind: 'issue.milestone', repo: child.repo, issue: child.number, from: v, to: null });
      }
    }
    if (leftover) {
      items.push({
        id: `leftover:${ref}`, lane: 'paul', kind: 'leftover', subject: ref,
        text: `open when ${v} ${r.state === 'shipped' ? 'shipped' : 'was withdrawn'}; awaiting placement`,
      });
    }
    // Open or done: both are shown on the page, so either is hidden without a Summary (Amendment 4).
    if (isOpenState(r.state) && !withdrawn && epicSummary(child.body) === null) {
      items.push({
        id: `no-summary:${ref}`, lane: 'assistant', kind: 'no-summary',
        subject: ref, text: `epic in ${v} has no "### Summary"; hidden on the page`,
      });
    }
    if (r.state === 'active' && open && child.subIssuesTotal === 0) {
      items.push({
        id: `no-work:${ref}`, lane: 'assistant', kind: 'no-work',
        subject: ref, text: `epic in the active release ${v} has no sub-issues`,
      });
    }
  }
}

// §4: pre-order walk of an open release's descendants, writing the release milestone downward.
function walk(nodes: IssueNode[], v: string, writes: Write[]): void {
  for (const n of nodes) {
    const inRepos = MILESTONE_REPOS.some((repo) => n.repo === `${OWNER}/${repo}`);
    // A fix shipped on the patch line keeps its patch milestone; its children are still visited.
    const keepsPatch = n.state === 'CLOSED' && PATCH.test(n.milestone ?? '');
    if (inRepos && !keepsPatch && n.milestone !== v) {
      writes.push({ kind: 'issue.milestone', repo: n.repo, issue: n.number, from: n.milestone ?? null, to: v });
    }
    walk(children(n), v, writes);
  }
}

function sortKey(w: Write): [number, string, number, string] {
  const repo = w.kind === 'validation.comment' ? ROADMAP_REPO : w.repo;
  const number = w.kind === 'milestone.update' || w.kind === 'milestone.delete' ? w.number
    : w.kind === 'milestone.create' ? 0 : w.issue;
  const title = 'title' in w ? w.title : '';
  return [KIND_ORDER.indexOf(w.kind), repo, number, title];
}

function compare(a: string | number, b: string | number): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function orderWrites(writes: Write[]): Write[] {
  const unique = new Map(writes.map((w) => [JSON.stringify(w), w]));
  return [...unique.entries()]
    .sort(([ja, a], [jb, b]) => {
      const ka = sortKey(a);
      const kb = sortKey(b);
      for (let i = 0; i < ka.length; i++) {
        const c = compare(ka[i] as string | number, kb[i] as string | number);
        if (c !== 0) return c;
      }
      return compare(ja, jb); // e.g. one issue detached from two releases
    })
    .map(([, w]) => w);
}

export function plan(snapshot: Snapshot, opts: { bulk: boolean }): Plan {
  const writes: Write[] = [];
  const items: Item[] = [];
  const milestones = Array.isArray(snapshot.milestones) ? snapshot.milestones : [];

  const releases = (Array.isArray(snapshot.releases) ? snapshot.releases : []).filter((n) => has(n, 'release'));
  // Every version a release issue names, and those still held by a release that is not withdrawn.
  const versions = new Set(releases.map((r) => titleVersion(r.title)));
  const liveVersions = new Set(releases.filter((r) => !isWithdrawn(r)).map((r) => titleVersion(r.title)));

  const valid = validate(releases, writes, items);
  const states = releaseStates(valid);
  const copies = new Set<string>();
  for (const { issue, brief } of valid) {
    const r: Release = { issue, brief, state: states.get(issue.number) ?? 'later' };
    // A withdrawn release whose version was re-filed leaves the copies to the live release.
    if (!(r.state === 'withdrawn' && liveVersions.has(brief.version))) planCopies(r, milestones, copies, writes, items);
    planEpics(r, writes, items);
    if (!isOpenState(r.state)) continue;
    walk(children(issue).filter((c) => epicState(c) !== 'withdrawn' && !has(c, 'release')), brief.version, writes);
  }

  // §5: open milestones that are no copy found above, whose title no release issue names
  // (valid or not, open or closed) and no patch line.
  for (const m of milestones) {
    if (m.state !== 'open' || copies.has(`${m.repo}#${m.number}`) || versions.has(m.title) || PATCH.test(m.title)) continue;
    items.push({
      id: `drift-milestone:${m.repo}:${m.title}`, lane: 'assistant', kind: 'drift-milestone',
      subject: `${m.repo} milestone ${m.title}`, text: 'open milestone that is not a release copy',
    });
  }

  // §6: the bulk cap counts projection writes only; validation comments are the control plane.
  let ordered = orderWrites(writes);
  const projections = ordered.filter((w) => w.kind !== 'validation.comment').length;
  const refused = projections > BULK_CAP && !opts.bulk;
  if (refused) {
    ordered = ordered.filter((w) => w.kind === 'validation.comment');
    items.push({
      id: 'bulk-cap', lane: 'assistant', kind: 'bulk-cap', subject: ROADMAP_REPO,
      text: `${projections} writes exceed the cap of ${BULK_CAP}; run with bulk`,
    });
  }
  const byId = new Map<string, Item>();
  for (const item of items) if (!byId.has(item.id)) byId.set(item.id, item);
  return { writes: ordered, items: [...byId.values()].sort((a, b) => compare(a.id, b.id)), refused };
}
