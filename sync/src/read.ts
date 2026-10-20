// Builds the Snapshot from GitHub (spec §5 step 1): release trees through GraphQL, milestones through REST.
// Read-only. Client errors propagate, so a failed read fails the run; partial GraphQL errors become warnings.
import { MILESTONE_REPOS, OWNER, type IssueNode, type Milestone, type MilestoneRepo, type Snapshot } from './types.ts';
import type { GitHubClient, GraphQLError } from './github.ts';

export const UNATTACHED_QUERY_TEXT = 'org:wcpos is:issue is:open label:epic no:parent-issue';
export const CHILD_BATCH = 20;         // parents per nodes(ids:) query
export const LABEL_PAGE = 50;          // worst case: releases ≈ 257,550 nodes, children ≈ 20 × 100 × 51 ≈ 102,000; GitHub's limit is 500,000
export const MAX_DEPTH = 10;           // GitHub nests sub-issues 8 deep; this is a guard, not a limit we expect to meet

const FIELDS = `id number title body state stateReason closedAt
repository { nameWithOwner }
labels(first: ${LABEL_PAGE}) { nodes { name } }
milestone { title }
subIssuesSummary { total completed }`;

const CHILDREN = `pageInfo { hasNextPage endCursor } nodes { ${FIELDS} }`;

export const RELEASES_QUERY = `query($after: String) {
  repository(owner: "wcpos", name: "roadmap") {
    issues(labels: ["release"], states: [OPEN, CLOSED], first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ${FIELDS} subIssues(first: 100) { ${CHILDREN} } }
    }
  }
}`;

export const CHILDREN_QUERY = `query($ids: [ID!]!) {
  nodes(ids: $ids) { ... on Issue { id subIssues(first: 100) { ${CHILDREN} } } }
}`;

export const MORE_CHILDREN_QUERY = `query($id: ID!, $after: String!) {
  node(id: $id) { ... on Issue { subIssues(first: 100, after: $after) { ${CHILDREN} } } }
}`;

export const UNATTACHED_QUERY = `query($q: String!) {
  search(query: $q, type: ISSUE, first: 0) { issueCount }
}`;

export interface ReadWarning { id: string; text: string }
export interface ReadResult {
  snapshot: Snapshot;
  unattachedEpics: { count: number; url: string };
  warnings: ReadWarning[];
}

interface PageInfo { hasNextPage: boolean; endCursor: string | null }
interface GqlIssue {
  id: string; number: number; title: string; body: string;
  state: 'OPEN' | 'CLOSED'; stateReason: IssueNode['stateReason']; closedAt: string | null;
  repository: { nameWithOwner: string };
  labels: { nodes: ({ name: string } | null)[] } | null;
  milestone: { title: string } | null;
  subIssuesSummary: { total: number; completed: number };
}
interface Connection { pageInfo: PageInfo; nodes: (GqlIssue | null)[] }
interface GqlRelease extends GqlIssue { subIssues: Connection }

interface RestMilestone {
  number: number; title: string; description: string | null; due_on: string | null; state: 'open' | 'closed';
}

// One placement of an issue in a release tree, waiting for its children.
interface Pending { id: string; node: IssueNode; depth: number; tree: Set<string> }

function toNode(g: GqlIssue): IssueNode {
  return {
    repo: g.repository.nameWithOwner,
    number: g.number,
    title: g.title,
    body: g.body,
    state: g.state,
    stateReason: g.stateReason ?? null,
    closedAt: g.closedAt ?? null,
    labels: (g.labels?.nodes ?? []).flatMap((l) => (l ? [l.name] : [])),
    milestone: g.milestone?.title ?? null,
    subIssuesTotal: g.subIssuesSummary.total,
    subIssuesCompleted: g.subIssuesSummary.completed,
    subIssues: [],
  };
}

export async function readSnapshot(client: GitHubClient): Promise<ReadResult> {
  const warnings: ReadWarning[] = [];

  async function query<T>(text: string, variables: Record<string, unknown>): Promise<T> {
    const { data, errors } = await client.graphql<T>(text, variables);
    errors.forEach((e: GraphQLError, i) => {
      warnings.push({ id: e.path?.join('.') ?? String(i), text: `${e.type ?? 'ERROR'}: ${e.message}`.slice(0, 200) });
    });
    return data;
  }

  // Every child of `id`: the first page as already read, then MORE_CHILDREN_QUERY until the last page.
  const allChildren = new Map<string, GqlIssue[]>();
  async function childrenOf(id: string, first: Connection): Promise<GqlIssue[]> {
    const cached = allChildren.get(id);
    if (cached) return cached;
    const out = first.nodes.filter((n): n is GqlIssue => n !== null);
    let page = first.pageInfo;
    while (page.hasNextPage) {
      const data = await query<{ node: { subIssues: Connection } | null }>(MORE_CHILDREN_QUERY, { id, after: page.endCursor });
      const more = data.node?.subIssues;
      if (!more) break;
      out.push(...more.nodes.filter((n): n is GqlIssue => n !== null));
      page = more.pageInfo;
    }
    allChildren.set(id, out);
    return out;
  }

  // Places the children under `parent` (skipping any issue already in this tree) and returns
  // those that still need their own children read.
  function place(parent: Pending, kids: GqlIssue[]): Pending[] {
    const next: Pending[] = [];
    for (const kid of kids) {
      if (parent.tree.has(kid.id)) continue;
      parent.tree.add(kid.id);
      const node = toNode(kid);
      parent.node.subIssues.push(node);
      const depth = parent.depth + 1;
      if (node.subIssuesTotal > 0 && depth < MAX_DEPTH) next.push({ id: kid.id, node, depth, tree: parent.tree });
    }
    return next;
  }

  // Releases, page by page; each carries its first 100 children.
  const releases: IssueNode[] = [];
  const seenReleases = new Set<string>();
  let level: Pending[] = [];
  let after: string | null = null;
  for (;;) {
    const data: { repository: { issues: { pageInfo: PageInfo; nodes: (GqlRelease | null)[] } } | null } =
      await query(RELEASES_QUERY, { after });
    if (!data.repository) throw new Error(`repository ${OWNER}/roadmap not readable`);
    const { pageInfo, nodes } = data.repository.issues;
    for (const r of nodes) {
      if (!r || seenReleases.has(r.id)) continue;
      seenReleases.add(r.id);
      const root: Pending = { id: r.id, node: toNode(r), depth: 0, tree: new Set([r.id]) };
      releases.push(root.node);
      level.push(...place(root, await childrenOf(r.id, r.subIssues)));
    }
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }

  // Breadth first, one level at a time, CHILD_BATCH parents per query.
  while (level.length > 0) {
    const ids = [...new Set(level.map((p) => p.id))];
    const firstPages = new Map<string, Connection>();
    for (let i = 0; i < ids.length; i += CHILD_BATCH) {
      const data = await query<{ nodes: ({ id: string; subIssues: Connection } | null)[] }>(
        CHILDREN_QUERY, { ids: ids.slice(i, i + CHILD_BATCH) });
      for (const n of data.nodes) if (n?.subIssues) firstPages.set(n.id, n.subIssues);
    }
    const next: Pending[] = [];
    for (const parent of level) {
      const first = firstPages.get(parent.id);
      if (first) next.push(...place(parent, await childrenOf(parent.id, first)));
    }
    level = next;
  }

  const search = await query<{ search: { issueCount: number } }>(UNATTACHED_QUERY, { q: UNATTACHED_QUERY_TEXT });
  const unattachedEpics = {
    count: search.search.issueCount,
    url: 'https://github.com/issues?q=' + encodeURIComponent(UNATTACHED_QUERY_TEXT),
  };

  const milestones: Milestone[] = [];
  for (const repo of MILESTONE_REPOS) {
    for (let p = 1; ; p++) {
      const page = await client.request<RestMilestone[]>('GET', `/repos/${OWNER}/${repo}/milestones?state=all&per_page=100&page=${p}`);
      milestones.push(...page.map((m) => toMilestone(repo, m)));
      if (page.length < 100) break;
    }
  }

  return { snapshot: { releases, milestones }, unattachedEpics, warnings };
}

function toMilestone(repo: MilestoneRepo, m: RestMilestone): Milestone {
  return { repo, number: m.number, title: m.title, description: m.description, dueOn: m.due_on, state: m.state };
}
