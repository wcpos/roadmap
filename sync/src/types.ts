export const OWNER = 'wcpos';
export const ROADMAP_REPO = 'wcpos/roadmap';
// The five repos that carry a copy of every release milestone (spec §4.1), in this order.
export const MILESTONE_REPOS = ['woocommerce-pos', 'woocommerce-pos-pro', 'monorepo', 'electron', 'roadmap'] as const;
export type MilestoneRepo = (typeof MILESTONE_REPOS)[number];
// Above this many projection writes a run writes nothing unless `bulk` is set (spec §5 step 4).
export const BULK_CAP = 100;

export interface IssueNode {
  repo: string;                 // nameWithOwner, e.g. 'wcpos/monorepo'
  number: number;
  title: string;
  body: string;
  state: 'OPEN' | 'CLOSED';
  stateReason: 'COMPLETED' | 'NOT_PLANNED' | 'DUPLICATE' | 'REOPENED' | null;
  closedAt: string | null;
  labels: string[];
  milestone: string | null;     // milestone title
  subIssuesTotal: number;
  subIssuesCompleted: number;
  subIssues: IssueNode[];       // children as read, in GitHub order
}

export interface Milestone {
  repo: MilestoneRepo;
  number: number;
  title: string;
  description: string | null;
  dueOn: string | null;         // ISO timestamp as GitHub returns it
  state: 'open' | 'closed';
}

export interface Snapshot { releases: IssueNode[]; milestones: Milestone[] }

export type Write =
  | { kind: 'validation.comment'; issue: number; reasons: string[] }                       // control plane
  | { kind: 'milestone.create'; repo: MilestoneRepo; title: string; description: string; dueOn: string | null }
  | { kind: 'milestone.update'; repo: MilestoneRepo; number: number; title: string;
      patch: { title?: string; description?: string; dueOn?: string | null; state?: 'open' | 'closed' } }
  | { kind: 'milestone.delete'; repo: MilestoneRepo; number: number; title: string }
  | { kind: 'issue.label'; repo: string; issue: number; label: 'epic' }
  | { kind: 'issue.milestone'; repo: string; issue: number; from: string | null; to: string | null }
  | { kind: 'subissue.remove'; parent: number; repo: string; issue: number };              // parent is in wcpos/roadmap

export interface Item { id: string; lane: 'paul' | 'assistant'; kind: string; subject: string; text: string }

export interface Plan { writes: Write[]; items: Item[]; refused: boolean }
