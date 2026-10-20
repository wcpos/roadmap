// One sync run: read, plan, publish the digest (spec §5 steps 1 and 6). The digest issue is the only write.
import { appendFile, writeFile } from 'node:fs/promises';
import { ROADMAP_REPO, type IssueNode, type Item } from './types.ts';
import type { GitHubClient } from './github.ts';
import { plan } from './plan.ts';
import { readSnapshot } from './read.ts';
import { DIGEST_LABEL, DIGEST_TITLE, describeWrite, renderDigest } from './digest.ts';

// Flipped by its own one-line PR, on Paul's word, after a week of dry-run digests (spec §11 step 3).
// Job 2 has no apply path, so the plan's writes are never made either way.
export const DRY_RUN = true;

export interface RunInput {
  client: GitHubClient;
  env: Record<string, string | undefined>;
  out?: string;        // local mode: write the digest body to this file; no digest read or write on GitHub
  now?: () => Date;
}
export interface RunSummary {
  releases: number; issues: number; milestones: number; writes: number; refused: boolean;
  paul: number; assistant: number; warnings: number; digest: string;
}

interface RestIssue { number: number; body: string | null; pull_request?: unknown }

function count(nodes: IssueNode[]): number {
  return nodes.reduce((n, node) => n + 1 + count(node.subIssues), 0);
}

// The one line the CLI prints and the step summary carries: counts only, never titles or bodies.
export function summaryLine(s: RunSummary): string {
  return `releases=${s.releases} issues=${s.issues} milestones=${s.milestones} writes=${s.writes} refused=${s.refused} `
    + `paul=${s.paul} assistant=${s.assistant} warnings=${s.warnings} digest=${s.digest}`;
}

export async function run(input: RunInput): Promise<RunSummary> {
  const { client, env } = input;
  const bulk = env.BULK === 'true';
  const dryRun = DRY_RUN || env.DRY_RUN_INPUT !== 'false';
  const runUrl = env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
    ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` : 'local';
  const generatedAt = (input.now ?? (() => new Date()))().toISOString();

  const read = await readSnapshot(client);
  const result = plan(read.snapshot, { bulk });
  const extraItems: Item[] = read.warnings.map((w) => ({
    id: `read-warning:${w.id}`, lane: 'assistant', kind: 'read-warning', subject: ROADMAP_REPO, text: w.text,
  }));
  const render = (previousBody: string | null) => renderDigest({
    snapshot: read.snapshot, plan: result, unattachedEpics: read.unattachedEpics, extraItems,
    previousBody, generatedAt, runUrl, dryRun, bulk,
  });

  let digest: string;
  if (input.out !== undefined) {
    await writeFile(input.out, render(null));
    digest = input.out;
  } else {
    const open = await client.request<RestIssue[]>('GET', `/repos/${ROADMAP_REPO}/issues?labels=${DIGEST_LABEL}&state=open&per_page=100`);
    const existing = open.filter((i) => !('pull_request' in i)).sort((a, b) => a.number - b.number)[0];
    const body = render(existing ? existing.body ?? null : null);
    if (existing) {
      await client.request('PATCH', `/repos/${ROADMAP_REPO}/issues/${existing.number}`, { body });
      digest = `updated #${existing.number}`;
    } else {
      const created = await client.request<{ number: number }>('POST', `/repos/${ROADMAP_REPO}/issues`,
        { title: DIGEST_TITLE, body, labels: [DIGEST_LABEL] });
      digest = `created #${created.number}`;
    }
  }

  const items = [...result.items, ...extraItems];
  const summary: RunSummary = {
    releases: read.snapshot.releases.length,
    issues: count(read.snapshot.releases),
    milestones: read.snapshot.milestones.length,
    writes: result.writes.length,
    refused: result.refused,
    paul: items.filter((i) => i.lane === 'paul').length,
    assistant: items.filter((i) => i.lane === 'assistant').length,
    warnings: read.warnings.length,
    digest,
  };

  if (env.GITHUB_STEP_SUMMARY) {
    const lines = result.writes.length > 0 ? result.writes.map((w) => `- (dry run) would: ${describeWrite(w)}`) : ['- none'];
    await appendFile(env.GITHUB_STEP_SUMMARY, ['## Roadmap sync (dry run)', '', summaryLine(summary), '', ...lines, ''].join('\n'));
  }
  return summary;
}
