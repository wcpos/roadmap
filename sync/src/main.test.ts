import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { GitHubClient, GraphQLError } from './github.ts';
import { CHILDREN_QUERY, RELEASES_QUERY, UNATTACHED_QUERY } from './read.ts';
import { DIGEST_LABEL, DIGEST_MARKER, DIGEST_TITLE, previousSince } from './digest.ts';
import { DRY_RUN, run } from './main.ts';

interface RestCall { method: string; path: string; body?: unknown }

const LIST = '/repos/wcpos/roadmap/issues?labels=roadmap-digest&state=open&per_page=100';
const NOW = () => new Date('2026-10-20T06:00:00.000Z');

function issue(id: string, number: number, f: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id, number, title: f.title ?? `Issue ${number}`, body: f.body ?? '### Summary\n\nX.', state: f.state ?? 'OPEN',
    stateReason: f.stateReason ?? null, closedAt: null,
    repository: { nameWithOwner: f.repo ?? 'wcpos/roadmap' },
    labels: { nodes: ((f.labels as string[] | undefined) ?? []).map((name) => ({ name })) },
    milestone: f.milestone ? { title: f.milestone } : null,
    subIssuesSummary: { total: f.total ?? 0, completed: 0 },
    ...(f.subIssues ? { subIssues: f.subIssues } : {}),
  };
}

function conn(nodes: unknown[]) {
  return { pageInfo: { hasNextPage: false, endCursor: null }, nodes };
}

const RELEASE_BODY = '### Due date\n\n### Why this release\n\nBecause.';

// A plan with validation.comment (#220), milestone.create (×5), issue.label and issue.milestone (#10),
// subissue.remove and issue.milestone (#11, withdrawn): ten writes.
function releases(): unknown[] {
  return [
    issue('R', 200, { title: 'v2.0.0 — Main', body: RELEASE_BODY, labels: ['release'], total: 2, subIssues: conn([
      issue('X', 10, { repo: 'wcpos/monorepo' }),
      issue('Y', 11, { state: 'CLOSED', stateReason: 'NOT_PLANNED', labels: ['epic'], milestone: 'v2.0.0' }),
    ]) }),
    issue('B', 220, { title: 'v3.0.0 - Hyphen', body: RELEASE_BODY, labels: ['release'], subIssues: conn([]) }),
  ];
}

interface FakeOptions {
  releases?: unknown[];
  children?: Record<string, unknown[]>;
  digestIssues?: unknown[];
  releaseErrors?: GraphQLError[];
}

function fakeClient(opts: FakeOptions = {}): { client: GitHubClient; rest: RestCall[] } {
  const rest: RestCall[] = [];
  const client: GitHubClient = {
    async graphql<T>(query: string, variables: Record<string, unknown>) {
      if (query === RELEASES_QUERY) {
        const data = { repository: { issues: conn(opts.releases ?? releases()) } };
        return { data: data as T, errors: opts.releaseErrors ?? [] };
      }
      if (query === CHILDREN_QUERY) {
        const nodes = (variables.ids as string[]).map((id) => ({ id, subIssues: conn(opts.children?.[id] ?? []) }));
        return { data: { nodes } as T, errors: [] };
      }
      if (query === UNATTACHED_QUERY) return { data: { search: { issueCount: 2 } } as T, errors: [] };
      throw new Error('unexpected query');
    },
    async request<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown) {
      rest.push(body === undefined ? { method, path } : { method, path, body });
      if (method === 'POST') return { number: 77 } as T;
      if (method === 'PATCH') return {} as T;
      if (path === LIST) return (opts.digestIssues ?? []) as T;
      return [] as T;
    },
  };
  return { client, rest };
}

function writesMade(rest: RestCall[]): RestCall[] {
  return rest.filter((c) => c.method !== 'GET');
}

function logLines(body: string): string[] {
  const lines = body.split('\n');
  const start = lines.indexOf('### log') + 1;
  return lines.slice(start, lines.indexOf('', start));
}

const dirs: string[] = [];
function tempFile(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'roadmap-sync-'));
  dirs.push(dir);
  return join(dir, name);
}
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('run', () => {
  it('is a dry run', () => {
    expect(DRY_RUN).toBe(true);
  });

  it('creates the digest issue, and writes nothing else, when there is none', async () => {
    const { client, rest } = fakeClient({ releaseErrors: [{ type: 'FORBIDDEN', message: 'x', path: ['nodes', 3] }] });
    const summary = await run({ client, env: {}, now: NOW });
    const writes = writesMade(rest);
    expect(writes).toHaveLength(1);
    const [post] = writes as [RestCall];
    expect(post.method).toBe('POST');
    expect(post.path).toBe('/repos/wcpos/roadmap/issues');
    const body = post.body as { title: string; body: string; labels: string[] };
    expect(Object.keys(body).sort()).toEqual(['body', 'labels', 'title']);
    expect(body.title).toBe(DIGEST_TITLE);
    expect(body.labels).toEqual([DIGEST_LABEL]);
    expect(body.body.startsWith(DIGEST_MARKER)).toBe(true);
    expect(rest.filter((c) => c.path === LIST)).toEqual([{ method: 'GET', path: LIST }]);
    expect(summary).toEqual({
      releases: 2, issues: 4, milestones: 0, writes: 10, refused: false, paul: 0, assistant: 3, warnings: 1, digest: 'created #77',
    });
    const kinds = new Set(logLines(body.body).map((l) => l.split(' ')[4]));
    expect(kinds).toEqual(new Set(['comment', 'create', 'label', 'detach', 'move']));
  });

  it('edits the lowest open digest issue, skips pull requests, and keeps since', async () => {
    const previous = `${DIGEST_MARKER}\n\n\`\`\`json\n{"items":[{"id":"invalid:220","since":"2026-01-01T00:00:00.000Z"}]}\n\`\`\`\n`;
    const { client, rest } = fakeClient({
      digestIssues: [
        { number: 9, body: 'newer' },
        { number: 4, body: previous },
        { number: 2, body: 'a pull request', pull_request: { url: 'x' } },
      ],
    });
    const summary = await run({ client, env: {}, now: NOW });
    const writes = writesMade(rest);
    expect(writes.map((c) => `${c.method} ${c.path}`)).toEqual(['PATCH /repos/wcpos/roadmap/issues/4']);
    const body = (writes[0]!.body as { body: string }).body;
    expect(Object.keys(writes[0]!.body as object)).toEqual(['body']);
    expect(previousSince(body).get('invalid:220')).toBe('2026-01-01T00:00:00.000Z');
    expect(previousSince(body).get('no-work:wcpos/monorepo#10')).toBe('2026-10-20T06:00:00.000Z');
    expect(summary.digest).toBe('updated #4');
  });

  it('stays a dry run whatever DRY_RUN_INPUT and BULK say', async () => {
    const { client, rest } = fakeClient();
    await run({ client, env: { DRY_RUN_INPUT: 'false', BULK: 'true' }, now: NOW });
    const writes = writesMade(rest);
    expect(writes.map((c) => `${c.method} ${c.path}`)).toEqual(['POST /repos/wcpos/roadmap/issues']);
    const body = (writes[0]!.body as { body: string }).body;
    const log = logLines(body);
    expect(log).toHaveLength(10);
    for (const line of log) expect(line.startsWith('- (dry run) would: ')).toBe(true);
    expect(body).toContain('"dryRun": true,\n  "bulk": true,');
  });

  it('writes the body to a file in local mode and calls no write and no digest lookup', async () => {
    const { client, rest } = fakeClient();
    const out = tempFile('digest.md');
    const summary = await run({ client, env: {}, out, now: NOW });
    expect(writesMade(rest)).toEqual([]);
    expect(rest.some((c) => c.path.startsWith('/repos/wcpos/roadmap/issues'))).toBe(false);
    const body = readFileSync(out, 'utf8');
    expect(body.startsWith(`${DIGEST_MARKER}\n## State\n`)).toBe(true);
    expect(body.endsWith('Last run: 2026-10-20T06:00:00.000Z (local)\n')).toBe(true);
    expect(logLines(body)).toHaveLength(10);
    expect(summary.digest).toBe(out);
  });

  it('puts every write in the step summary, even when the digest is cut', async () => {
    // One epic with 1000 open work items and no milestone: 1000 issue.milestone writes, too long for the digest.
    const work = Array.from({ length: 1000 }, (_, i) => issue(`W${i}`, 10000 + i, { repo: 'wcpos/monorepo' }));
    const { client, rest } = fakeClient({
      releases: [issue('R', 200, { title: 'v2.0.0 — Main', body: RELEASE_BODY, labels: ['release'], total: 1, subIssues: conn([
        issue('E', 10, { labels: ['epic'], milestone: 'v2.0.0', total: 1000 }),
      ]) })],
      children: { E: work },
    });
    const file = tempFile('summary.md');
    const summary = await run({ client, env: { BULK: 'true', GITHUB_STEP_SUMMARY: file }, now: NOW });
    expect(summary.writes).toBe(1005);
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    expect(lines.slice(0, 4)).toEqual([
      '## Roadmap sync (dry run)', '',
      'releases=1 issues=1002 milestones=0 writes=1005 refused=false paul=0 assistant=0 warnings=0 digest=created #77', '',
    ]);
    const writeLines = lines.filter((l) => l.startsWith('- (dry run) would: '));
    expect(writeLines).toHaveLength(1005);
    expect(writeLines[1004]).toBe('- (dry run) would: move wcpos/monorepo#10999 milestone none → v2.0.0');
    const body = (writesMade(rest)[0]!.body as { body: string }).body;
    expect(logLines(body).at(-1)).toMatch(/^- … \d+ more; the full list is in the run summary$/);
  });

  it('writes none to the step summary when the plan has no writes', async () => {
    const file = tempFile('summary.md');
    const { client } = fakeClient({ releases: [] });
    await run({ client, env: { GITHUB_STEP_SUMMARY: file }, out: tempFile('digest.md'), now: NOW });
    expect(readFileSync(file, 'utf8').split('\n').slice(4)).toEqual(['- none', '']);
  });

  it('builds runUrl from the three GitHub env vars, and is local without any one of them', async () => {
    const full = { GITHUB_SERVER_URL: 'https://github.com', GITHUB_REPOSITORY: 'wcpos/roadmap', GITHUB_RUN_ID: '42' };
    const lastRun = async (env: Record<string, string>) => {
      const out = tempFile('digest.md');
      await run({ client: fakeClient().client, env, out, now: NOW });
      return readFileSync(out, 'utf8').split('\n').at(-2);
    };
    expect(await lastRun(full)).toBe('Last run: 2026-10-20T06:00:00.000Z (https://github.com/wcpos/roadmap/actions/runs/42)');
    for (const key of Object.keys(full)) {
      const env: Record<string, string> = { ...full };
      delete env[key];
      expect(await lastRun(env)).toBe('Last run: 2026-10-20T06:00:00.000Z (local)');
    }
  });
});
