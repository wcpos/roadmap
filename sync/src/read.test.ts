import { describe, expect, it } from 'vitest';
import type { IssueNode } from './types.ts';
import type { GitHubClient, GraphQLError } from './github.ts';
import {
  CHILDREN_QUERY, CHILD_BATCH, MAX_DEPTH, MORE_CHILDREN_QUERY, RELEASES_QUERY, UNATTACHED_QUERY, UNATTACHED_QUERY_TEXT,
  readSnapshot,
} from './read.ts';

interface Conn { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: unknown[] }
interface Fake {
  releasePages?: Record<string, Conn>;      // keyed by `after` ('' for the first page)
  children?: Record<string, Conn>;          // parent id → first page, for CHILDREN_QUERY
  nullChildren?: string[];                  // parent ids CHILDREN_QUERY answers with null
  more?: Record<string, Conn>;              // `${id}@${after}` → page, for MORE_CHILDREN_QUERY
  errors?: Map<string, GraphQLError[][]>;   // query → errors for its 1st, 2nd, … response
  milestones?: Record<string, unknown[]>;   // REST path → entries
  issueCount?: number;
}
interface GqlCall { query: string; variables: Record<string, unknown> }

function conn(nodes: unknown[], endCursor: string | null = null): Conn {
  return { pageInfo: { hasNextPage: endCursor !== null, endCursor }, nodes };
}

function fakeClient(fake: Fake): { client: GitHubClient; gql: GqlCall[]; rest: string[] } {
  const gql: GqlCall[] = [];
  const rest: string[] = [];
  const answer = (query: string, variables: Record<string, unknown>): unknown => {
    if (query === RELEASES_QUERY) {
      const page = fake.releasePages?.[(variables.after as string | null) ?? ''] ?? conn([]);
      return { repository: { issues: page } };
    }
    if (query === CHILDREN_QUERY) {
      return {
        nodes: (variables.ids as string[]).map((id) =>
          fake.nullChildren?.includes(id) ? null : { id, subIssues: fake.children?.[id] ?? conn([]) }),
      };
    }
    if (query === MORE_CHILDREN_QUERY) {
      const page = fake.more?.[`${variables.id as string}@${variables.after as string}`];
      if (!page) throw new Error(`unexpected page ${JSON.stringify(variables)}`);
      return { node: { subIssues: page } };
    }
    if (query === UNATTACHED_QUERY) return { search: { issueCount: fake.issueCount ?? 0 } };
    throw new Error('unexpected query');
  };
  const client: GitHubClient = {
    async graphql<T>(query: string, variables: Record<string, unknown>) {
      gql.push({ query, variables });
      const data = answer(query, variables) as T;
      return { data, errors: fake.errors?.get(query)?.shift() ?? [] };
    },
    async request<T>(method: 'GET' | 'POST' | 'PATCH', path: string) {
      if (method !== 'GET') throw new Error('the reader never writes');
      rest.push(path);
      return (fake.milestones?.[path] ?? []) as T;
    },
  };
  return { client, gql, rest };
}

interface IssueFields {
  repo?: string; title?: string; body?: string; state?: 'OPEN' | 'CLOSED'; stateReason?: string | null;
  closedAt?: string | null; labels?: string[]; milestone?: string | null; total?: number; completed?: number;
}

function issue(id: string, number: number, f: IssueFields = {}, subIssues?: Conn): Record<string, unknown> {
  return {
    id, number, title: f.title ?? `Issue ${number}`, body: f.body ?? '', state: f.state ?? 'OPEN',
    stateReason: f.stateReason ?? null, closedAt: f.closedAt ?? null,
    repository: { nameWithOwner: f.repo ?? 'wcpos/roadmap' },
    labels: { nodes: (f.labels ?? []).map((name) => ({ name })) },
    milestone: f.milestone ? { title: f.milestone } : null,
    subIssuesSummary: { total: f.total ?? 0, completed: f.completed ?? 0 },
    ...(subIssues ? { subIssues } : {}),
  };
}

function release(id: string, number: number, kids: Conn = conn([])): Record<string, unknown> {
  return issue(id, number, { title: `v2.${number}.0 — Release`, labels: ['release'], total: kids.nodes.length }, kids);
}

function calls(gql: GqlCall[], query: string): Record<string, unknown>[] {
  return gql.filter((c) => c.query === query).map((c) => c.variables);
}

function numbers(nodes: IssueNode[]): number[] {
  return nodes.map((n) => n.number);
}

describe('readSnapshot', () => {
  it('follows the release cursor until the last page', async () => {
    const { client, gql } = fakeClient({
      releasePages: { '': conn([release('R1', 1)], 'p1'), p1: conn([release('R2', 2)]) },
    });
    const { snapshot } = await readSnapshot(client);
    expect(numbers(snapshot.releases)).toEqual([1, 2]);
    expect(calls(gql, RELEASES_QUERY)).toEqual([{ after: null }, { after: 'p1' }]);
  });

  it('reads a tree three levels deep and maps every field', async () => {
    const epic = issue('E', 10, { repo: 'wcpos/monorepo', title: 'Epic', body: '### Summary\n\nX.', labels: ['epic', 'ux'],
      milestone: 'v2.0.0', total: 2, completed: 1 });
    const { client, gql } = fakeClient({
      releasePages: { '': conn([release('R', 1, conn([epic]))]) },
      children: {
        E: conn([
          issue('W', 11, { repo: 'wcpos/woocommerce-pos', title: 'Work', total: 1 }),
          issue('D', 12, { title: 'Dropped', state: 'CLOSED', stateReason: 'NOT_PLANNED', closedAt: '2026-10-01T00:00:00Z' }),
        ]),
        W: conn([issue('L', 13, { repo: 'wcpos/electron', title: 'Leaf', state: 'CLOSED', stateReason: 'COMPLETED',
          closedAt: '2026-10-02T00:00:00Z', milestone: 'v1.11.2' })]),
      },
    });
    const { snapshot, warnings } = await readSnapshot(client);
    expect(warnings).toEqual([]);
    expect(calls(gql, CHILDREN_QUERY)).toEqual([{ ids: ['E'] }, { ids: ['W'] }]);
    const leaf: IssueNode = {
      repo: 'wcpos/electron', number: 13, title: 'Leaf', body: '', state: 'CLOSED', stateReason: 'COMPLETED',
      closedAt: '2026-10-02T00:00:00Z', labels: [], milestone: 'v1.11.2', subIssuesTotal: 0, subIssuesCompleted: 0, subIssues: [],
    };
    const work: IssueNode = {
      repo: 'wcpos/woocommerce-pos', number: 11, title: 'Work', body: '', state: 'OPEN', stateReason: null, closedAt: null,
      labels: [], milestone: null, subIssuesTotal: 1, subIssuesCompleted: 0, subIssues: [leaf],
    };
    const dropped: IssueNode = {
      repo: 'wcpos/roadmap', number: 12, title: 'Dropped', body: '', state: 'CLOSED', stateReason: 'NOT_PLANNED',
      closedAt: '2026-10-01T00:00:00Z', labels: [], milestone: null, subIssuesTotal: 0, subIssuesCompleted: 0, subIssues: [],
    };
    expect(snapshot.releases).toEqual([{
      repo: 'wcpos/roadmap', number: 1, title: 'v2.1.0 — Release', body: '', state: 'OPEN', stateReason: null, closedAt: null,
      labels: ['release'], milestone: null, subIssuesTotal: 1, subIssuesCompleted: 0, subIssues: [{
        repo: 'wcpos/monorepo', number: 10, title: 'Epic', body: '### Summary\n\nX.', state: 'OPEN', stateReason: null,
        closedAt: null, labels: ['epic', 'ux'], milestone: 'v2.0.0', subIssuesTotal: 2, subIssuesCompleted: 1,
        subIssues: [work, dropped],
      }],
    }]);
  });

  it('asks for children CHILD_BATCH parents at a time', async () => {
    const epics = Array.from({ length: 25 }, (_, i) => issue(`E${i}`, 100 + i, { total: 1 }));
    const { client, gql } = fakeClient({ releasePages: { '': conn([release('R', 1, conn(epics))]) } });
    await readSnapshot(client);
    const batches = calls(gql, CHILDREN_QUERY).map((v) => v.ids as string[]);
    expect(CHILD_BATCH).toBe(20);
    expect(batches.map((b) => b.length)).toEqual([20, 5]);
    expect(batches.flat()).toEqual(epics.map((e) => e.id));
  });

  it('asks for 50 labels per issue, keeping queries under the node limit', () => {
    for (const q of [RELEASES_QUERY, CHILDREN_QUERY]) {
      expect(q).toContain('labels(first: 50)');
      expect(q).not.toContain('labels(first: 100)');
    }
  });

  it('pages a release past 100 children with MORE_CHILDREN_QUERY', async () => {
    const { client, gql } = fakeClient({
      releasePages: { '': conn([release('R', 1, conn([issue('A', 10)], 'c1'))]) },
      more: { 'R@c1': conn([issue('B', 11), issue('C', 12)]) },
    });
    const { snapshot } = await readSnapshot(client);
    expect(calls(gql, MORE_CHILDREN_QUERY)).toEqual([{ id: 'R', after: 'c1' }]);
    expect(numbers(snapshot.releases[0]!.subIssues)).toEqual([10, 11, 12]);
  });

  it('pages an epic past 100 children with MORE_CHILDREN_QUERY', async () => {
    const { client, gql } = fakeClient({
      releasePages: { '': conn([release('R', 1, conn([issue('E', 10, { total: 3 })]))]) },
      children: { E: conn([issue('A', 20)], 'e1') },
      more: { 'E@e1': conn([issue('B', 21), issue('C', 22)]) },
    });
    const { snapshot } = await readSnapshot(client);
    expect(calls(gql, MORE_CHILDREN_QUERY)).toEqual([{ id: 'E', after: 'e1' }]);
    expect(numbers(snapshot.releases[0]!.subIssues[0]!.subIssues)).toEqual([20, 21, 22]);
  });

  it('skips null nodes and turns partial errors into warnings', async () => {
    const long = 'y'.repeat(300);
    const errors = new Map<string, GraphQLError[][]>([
      [CHILDREN_QUERY, [[{ type: 'FORBIDDEN', message: 'x', path: ['nodes', 3] }, { message: long }]]],
    ]);
    const { client } = fakeClient({
      releasePages: { '': conn([null, release('R', 1, conn([issue('E', 10, { total: 2 }), issue('H', 11, { total: 1 }), null]))]) },
      children: { E: conn([null, issue('W', 20)]) },
      nullChildren: ['H'],
      errors,
    });
    const { snapshot, warnings } = await readSnapshot(client);
    expect(numbers(snapshot.releases)).toEqual([1]);
    expect(numbers(snapshot.releases[0]!.subIssues)).toEqual([10, 11]);
    expect(numbers(snapshot.releases[0]!.subIssues[0]!.subIssues)).toEqual([20]);
    expect(snapshot.releases[0]!.subIssues[1]!.subIssues).toEqual([]);
    expect(warnings).toEqual([
      { id: 'nodes.3', text: 'FORBIDDEN: x' },
      { id: '1', text: `ERROR: ${long}`.slice(0, 200) },
    ]);
  });

  it('places an issue once per tree', async () => {
    const { client } = fakeClient({
      releasePages: { '': conn([release('R', 1, conn([issue('E', 10, { total: 2 }), issue('E', 10, { total: 2 })]))]) },
      children: { E: conn([issue('W', 20), issue('W', 20)]) },
    });
    const { snapshot } = await readSnapshot(client);
    expect(numbers(snapshot.releases[0]!.subIssues)).toEqual([10]);
    expect(numbers(snapshot.releases[0]!.subIssues[0]!.subIssues)).toEqual([20]);
  });

  it('reads milestones page by page, in MILESTONE_REPOS order', async () => {
    const entry = (n: number) => ({ number: n, title: `M${n}`, description: null, due_on: null, state: 'open' });
    const base = '/repos/wcpos';
    const q = 'milestones?state=all&per_page=100&page=';
    const { client, rest } = fakeClient({
      milestones: {
        [`${base}/woocommerce-pos/${q}1`]: Array.from({ length: 100 }, (_, i) => entry(i + 1)),
        [`${base}/woocommerce-pos/${q}2`]: [entry(101)],
        [`${base}/woocommerce-pos-pro/${q}1`]: [entry(1)],
        [`${base}/monorepo/${q}1`]: [{ number: 7, title: 'v2.0.0', description: 'Managed', due_on: '2026-12-31T12:00:00Z', state: 'closed' }],
        [`${base}/electron/${q}1`]: [entry(2)],
        [`${base}/roadmap/${q}1`]: [entry(3)],
      },
    });
    const { snapshot } = await readSnapshot(client);
    expect(rest).toEqual([
      `${base}/woocommerce-pos/${q}1`, `${base}/woocommerce-pos/${q}2`, `${base}/woocommerce-pos-pro/${q}1`,
      `${base}/monorepo/${q}1`, `${base}/electron/${q}1`, `${base}/roadmap/${q}1`,
    ]);
    expect(snapshot.milestones).toHaveLength(105);
    expect(snapshot.milestones[100]).toEqual({ repo: 'woocommerce-pos', number: 101, title: 'M101', description: null, dueOn: null, state: 'open' });
    expect(snapshot.milestones[102]).toEqual({
      repo: 'monorepo', number: 7, title: 'v2.0.0', description: 'Managed', dueOn: '2026-12-31T12:00:00Z', state: 'closed',
    });
  });

  it('counts the unattached open-epic pool and links to it', async () => {
    const { client, gql } = fakeClient({ issueCount: 4 });
    const { unattachedEpics } = await readSnapshot(client);
    expect(calls(gql, UNATTACHED_QUERY)).toEqual([{ q: UNATTACHED_QUERY_TEXT }]);
    expect(unattachedEpics).toEqual({
      count: 4,
      url: 'https://github.com/issues?q=org%3Awcpos%20is%3Aissue%20is%3Aopen%20label%3Aepic%20no%3Aparent-issue',
    });
  });

  it('stops asking for children at MAX_DEPTH', async () => {
    // release → C1 → C2 → … → C12, each with one child.
    const chain = Array.from({ length: 12 }, (_, i) => issue(`C${i + 1}`, i + 1, { total: 1 }));
    const children: Record<string, Conn> = {};
    for (let i = 0; i < 11; i++) children[`C${i + 1}`] = conn([chain[i + 1]]);
    const { client, gql } = fakeClient({ releasePages: { '': conn([release('R', 100, conn([chain[0]]))]) }, children });
    const { snapshot } = await readSnapshot(client);
    const asked = calls(gql, CHILDREN_QUERY).flatMap((v) => v.ids as string[]);
    expect(asked).toEqual(Array.from({ length: MAX_DEPTH - 1 }, (_, i) => `C${i + 1}`));
    let depth = 0;
    for (let n: IssueNode | undefined = snapshot.releases[0]; n?.subIssues[0]; n = n.subIssues[0]) depth++;
    expect(depth).toBe(MAX_DEPTH);
  });
});
